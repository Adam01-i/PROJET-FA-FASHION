import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InventoryStats } from '../models';

export function useInventoryStats() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_stats')
        .select('*')
        .single();

      if (error) throw error;

      const statsData: InventoryStats = {
        totalProducts: data.total_products,
        lowStockProducts: data.low_stock_products,
        outOfStockProducts: data.out_of_stock_products,
        totalValue: data.total_value,
        totalSales: data.total_sales,
        assistantSales: data.assistant_sales
      };

      setStats(statsData);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Abonnement aux changements qui affectent les stats
    const subscription = supabase
      .channel('inventory_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}