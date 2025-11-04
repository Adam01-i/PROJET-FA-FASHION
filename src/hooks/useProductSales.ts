// hooks/useProductSales.ts (version corrigée)
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProductSale } from '../models';

export function useProductSales() {
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProductSales = async () => {
    try {
      // Utiliser la vue qui ne compte que les commandes CONFIRMÉES
      const { data, error } = await supabase
        .from("product_sales_summary")
        .select("*")
        .order("total_revenue", { ascending: false });

      if (error) throw error;

      const salesData: ProductSale[] = (data || []).map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity_sold: item.quantity_sold || 0,
        total_revenue: item.total_revenue || 0,
        stock_quantity: item.stock_quantity,
        image_url: item.image_url || undefined,
        category: item.category_name || "Non catégorisé"
      }));

      setProductSales(salesData);
    } catch (err) {
      console.error("Error fetching product sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductSales();

    // Abonnement aux changements pour mettre à jour en temps réel
    const subscription = supabase
      .channel('product_sales_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          // Recharger les données quand une commande change
          fetchProductSales();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { productSales, loading, refetch: fetchProductSales };
}