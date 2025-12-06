import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Interface pour les données retournées par Supabase
interface WholesalePricingWithProduct {
  id: string;
  product_id: string;
  wholesale_price: number;
  products: {
    name: string;
    price: number;
  };
}

export interface WholesaleStats {
  total_wholesale_products: number;
  active_wholesale_tiers: number;
  average_discount: number;
  top_discount_product?: {
    product_name: string;
    discount_percentage: number;
    regular_price: number;
    wholesale_price: number;
  };
  total_potential_savings: number;
}

export function useWholesaleStats() {
  const [stats, setStats] = useState<WholesaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer le nombre total de produits avec prix en gros
      const { data: wholesaleData, error: wholesaleError } = await supabase
        .from('wholesale_pricing')
        .select(`
          id,
          product_id,
          wholesale_price,
          products:product_id (
            name,
            price
          )
        `)
        .eq('is_active', true);

      if (wholesaleError) throw wholesaleError;

      // Type assertion pour aider TypeScript
      const typedData = wholesaleData as unknown as WholesalePricingWithProduct[];
      
      // Calculer les statistiques
      const uniqueProducts = new Set(typedData?.map(item => item.product_id)).size;
      
      let totalDiscount = 0;
      let maxDiscount = 0;
      let maxDiscountProduct = null;
      let totalPotentialSavings = 0;

      typedData?.forEach(item => {
        const regularPrice = item.products?.price || 0;
        const wholesalePrice = item.wholesale_price;
        const discount = ((regularPrice - wholesalePrice) / regularPrice) * 100;
        
        totalDiscount += discount;
        totalPotentialSavings += (regularPrice - wholesalePrice);
        
        if (discount > maxDiscount) {
          maxDiscount = discount;
          maxDiscountProduct = {
            product_name: item.products?.name || 'Produit inconnu',
            discount_percentage: Math.round(discount * 100) / 100,
            regular_price: regularPrice,
            wholesale_price: wholesalePrice,
          };
        }
      });

      const averageDiscount = typedData && typedData.length > 0 
        ? totalDiscount / typedData.length 
        : 0;

      const statsData: WholesaleStats = {
        total_wholesale_products: uniqueProducts,
        active_wholesale_tiers: typedData?.length || 0,
        average_discount: Math.round(averageDiscount * 100) / 100,
        top_discount_product: maxDiscountProduct || undefined,
        total_potential_savings: Math.round(totalPotentialSavings),
      };

      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching wholesale stats:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}