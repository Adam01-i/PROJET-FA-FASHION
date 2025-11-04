// hooks/useRevenueStats.ts - VOTRE VERSION ACTUELLE EST DÉJÀ BONNE
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface RevenueStats {
  totalRevenue: number;
  averageOrderValue: number;
  revenueGrowth: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueByCategory: { category: string; revenue: number; orderCount: number }[];
  dailyTrend: { date: string; revenue: number; orders: number }[];
}

export function useRevenueStats(timeRange: "day" | "week" | "month" | "year" = "month") {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ces appels utiliseront AUTOMATIQUEMENT les vues corrigées
      const { data: revenueData, error: revenueError } = await supabase
        .from("revenue_stats")
        .select("*")
        .single();

      if (revenueError) throw revenueError;

      const { data: categoryData, error: categoryError } = await supabase
        .from("revenue_by_category")
        .select("*");

      if (categoryError) throw categoryError;

      let dailyTrendQuery = supabase
        .from("daily_revenue_trend")
        .select("*")
        .order("date", { ascending: false });

      const startDate = new Date();
      switch (timeRange) {
        case "day":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate.setDate(startDate.getDate() - 365);
          break;
      }

      dailyTrendQuery = dailyTrendQuery.gte("date", startDate.toISOString().split('T')[0]);
      const { data: trendData, error: trendError } = await dailyTrendQuery;

      if (trendError) throw trendError;

      // Ces calculs utiliseront les données déjà filtrées par les vues SQL
      const currentRevenue = revenueData.current_month_revenue || 0;
      const previousRevenue = revenueData.previous_month_revenue || 0;
      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;

      const formattedTrend = (trendData || [])
        .map(day => ({
          date: new Date(day.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          }),
          revenue: day.daily_revenue || 0,
          orders: day.daily_orders || 0,
          sortDate: new Date(day.date)
        }))
        .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
        .map(({ sortDate, ...rest }) => rest);

      const revenueStats: RevenueStats = {
        totalRevenue: revenueData.total_revenue || 0,
        averageOrderValue: revenueData.average_order_value || 0,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        monthlyRevenue: revenueData.current_month_revenue || 0,
        totalOrders: revenueData.total_orders || 0,
        totalCustomers: revenueData.total_customers || 0,
        revenueByCategory: (categoryData || []).map(cat => ({
          category: cat.category,
          revenue: cat.revenue,
          orderCount: cat.order_count
        })),
        dailyTrend: formattedTrend
      };

      setStats(revenueStats);
    } catch (err) {
      console.error("Error fetching revenue stats:", err);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueStats();
  }, [timeRange]);

  return { stats, loading, error, refetch: fetchRevenueStats };
}