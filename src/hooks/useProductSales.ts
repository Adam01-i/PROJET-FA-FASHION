import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProductSale } from '../models';

export function useProductSales() {
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductSales = async () => {
    try {
      const { data, error } = await supabase
        .from('product_sales')
        .select('*')
        .order('total_revenue', { ascending: false });

      if (error) throw error;

      const salesData: ProductSale[] = (data || []).map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity_sold: item.quantity_sold,
        total_revenue: item.total_revenue,
        stock_quantity: item.stock_quantity,
        image_url: item.image_url || undefined,
        category: item.category_name || undefined
      }));

      setProductSales(salesData);
    } catch (err) {
      console.error('Erreur lors du chargement des ventes:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductSales();

    // Abonnement en temps réel aux changements
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          fetchProductSales();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          fetchProductSales();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { productSales, loading, error, refetch: fetchProductSales };
}