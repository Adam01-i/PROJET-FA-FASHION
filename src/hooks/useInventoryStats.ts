// hooks/useInventoryStats.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { InventoryStats, LowStockAlert } from "../models";

export function useInventoryStats() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Récupérer les statistiques d'inventaire depuis la vue mise à jour
      const { data: statsData, error: statsError } = await supabase
        .from("inventory_stats")
        .select("*")
        .single();

      if (statsError) throw statsError;

      // Récupérer les alertes de stock faible
      const { data: alertsData, error: alertsError } = await supabase
        .from("low_stock_alerts")
        .select("*")
        .order("current_stock", { ascending: true });

      if (alertsError) throw alertsError;

      // Formater les statistiques
      const formattedStats: InventoryStats = {
        totalProducts: statsData.total_products || 0,
        lowStockProducts: statsData.low_stock_products || 0,
        outOfStockProducts: statsData.out_of_stock_products || 0,
        totalValue: statsData.total_value || 0,
        totalSales: statsData.total_sales || 0,
        assistantSales: statsData.assistant_sales || 0,
        currentMonthSales: statsData.current_month_sales || 0,
        currentWeekSales: statsData.current_week_sales || 0,
        bestSellingProduct: statsData.best_selling_product || "N/A",
        revenueGrowth: statsData.revenue_growth || 0,
      };

      // Formater les alertes de stock
      const formattedAlerts: LowStockAlert[] = (alertsData || []).map(
        (alert) => ({
          product_id: alert.product_id,
          product_name: alert.product_name,
          current_stock: alert.current_stock,
          threshold: alert.threshold,
          last_restock_date: alert.last_restock_date,
          urgency: alert.urgency as "low" | "medium" | "high",
        })
      );

      setStats(formattedStats);
      setLowStockAlerts(formattedAlerts);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des stats:", err);
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Souscription aux changements des commandes pour mettre à jour les stats
    const subscription = supabase
      .channel("inventory_stats_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          // Debounce pour éviter les appels multiples
          setTimeout(() => fetchStats(), 1000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    stats,
    lowStockAlerts,
    loading,
    error,
    refetch: fetchStats,
  };
}