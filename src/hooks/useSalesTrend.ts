// hooks/useSalesTrend.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useSalesTrend() {
  const [salesTrend, setSalesTrend] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const calculateSalesTrend = async () => {
    try {
      setLoading(true);
      
      const currentPeriodStart = new Date();
      currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);
      
      const previousPeriodStart = new Date();
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);

      // Ventes de la période actuelle
      const { data: currentSales, error: currentError } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", currentPeriodStart.toISOString())
        .eq("status", "confirmed");

      if (currentError) throw currentError;

      // Ventes de la période précédente
      const { data: previousSales, error: previousError } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", previousPeriodStart.toISOString())
        .lt("created_at", currentPeriodStart.toISOString())
        .eq("status", "confirmed");

      if (previousError) throw previousError;

      const currentRevenue = currentSales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const previousRevenue = previousSales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Calcul du pourcentage de croissance
      const trend = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;

      setSalesTrend(Number(trend.toFixed(1)));
    } catch (err) {
      console.error("Error calculating sales trend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSalesTrend();
  }, []);

  return { salesTrend, loading };
}