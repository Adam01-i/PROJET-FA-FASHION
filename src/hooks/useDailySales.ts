// hooks/useDailySales.ts (version corrigée)
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

// Accepter "day" comme option valide
export function useDailySales(timeRange: "day" | "week" | "month" | "quarter" | "year") {
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailySales = useCallback(async () => {
    try {
      setLoading(true);
      
      const startDate = new Date();
      switch (timeRange) {
        case "day":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "quarter":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "year":
          startDate.setDate(startDate.getDate() - 365);
          break;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_amount, status")
        .gte("created_at", startDate.toISOString())
        .eq("status", "confirmed");

      if (error) throw error;

      // Méthode plus sûre pour le regroupement
      const dailyMap = new Map<string, { revenue: number; orders: number; timestamp: Date }>();

      data?.forEach(order => {
        try {
          const orderDate = new Date(order.created_at);
          if (isNaN(orderDate.getTime())) {
            console.warn('Date invalide:', order.created_at);
            return;
          }

          const dateKey = orderDate.toLocaleDateString('fr-CA'); // Format YYYY-MM-DD
          
          const existing = dailyMap.get(dateKey) || { 
            revenue: 0, 
            orders: 0, 
            timestamp: orderDate 
          };
          
          dailyMap.set(dateKey, {
            revenue: existing.revenue + order.total_amount,
            orders: existing.orders + 1,
            timestamp: orderDate
          });
        } catch (err) {
          console.warn('Erreur de traitement de la commande:', order.id, err);
        }
      });

      // Convertir en tableau et formater
      const salesArray = Array.from(dailyMap.entries())
        .map(([, data]) => ({
          date: data.timestamp.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          }),
          revenue: data.revenue,
          orders: data.orders,
        }))
        .sort((a, b) => {
          const dateA = new Date(a.date.split(' ').reverse().join(' '));
          const dateB = new Date(b.date.split(' ').reverse().join(' '));
          return dateA.getTime() - dateB.getTime();
        });

      setDailySales(salesArray);
    } catch (err) {
      console.error("Error fetching daily sales:", err);
      setDailySales([]); // Reset en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDailySales();
  }, [fetchDailySales]);

  return { dailySales, loading };
}