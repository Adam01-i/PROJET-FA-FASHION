import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Interface pour les données Supabase
interface WholesalePricingData {
  id: string;
  product_id: string;
  min_quantity: number;
  wholesale_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products: {
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
    is_public: boolean;
    categories: {
      name: string;
    };
  };
}

export interface WholesaleProduct {
  id: string;
  product_id: string;
  min_quantity: number;
  wholesale_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_name?: string;
  regular_price?: number;
  category_name?: string;
  image_url?: string;
  stock_quantity?: number;
  is_public?: boolean;
}

export interface WholesaleTier {
  id: string;
  min_quantity: number;
  wholesale_price: number;
  is_active: boolean;
}

export function useWholesaleProducts() {
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWholesaleProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les produits avec leurs prix en gros
      const { data, error: fetchError } = await supabase
        .from('wholesale_pricing')
        .select(`
          id,
          product_id,
          min_quantity,
          wholesale_price,
          is_active,
          created_at,
          updated_at,
          products:product_id (
            name,
            price,
            image_url,
            stock_quantity,
            is_public,
            categories (
              name
            )
          )
        `)
        .order('min_quantity', { ascending: true });

      if (fetchError) throw fetchError;

      // Type assertion et transformation
      const typedData = data as unknown as WholesalePricingData[];
      
      const transformedData: WholesaleProduct[] = typedData.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        min_quantity: item.min_quantity,
        wholesale_price: item.wholesale_price,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product_name: item.products?.name || 'Produit inconnu',
        regular_price: item.products?.price || 0,
        category_name: item.products?.categories?.name,
        image_url: item.products?.image_url,
        stock_quantity: item.products?.stock_quantity,
        is_public: item.products?.is_public,
      }));

      setProducts(transformedData);
    } catch (err: any) {
      console.error('Error fetching wholesale products:', err);
      setError(err.message || 'Erreur lors du chargement des produits en gros');
    } finally {
      setLoading(false);
    }
  };

  const addWholesaleTier = async (
    productId: string,
    minQuantity: number,
    wholesalePrice: number
  ) => {
    try {
      const { error } = await supabase.from('wholesale_pricing').insert({
        product_id: productId,
        min_quantity: minQuantity,
        wholesale_price: wholesalePrice,
        is_active: true,
      });

      if (error) throw error;
      
      await fetchWholesaleProducts();
      return { success: true };
    } catch (err: any) {
      console.error('Error adding wholesale tier:', err);
      return { success: false, error: err.message };
    }
  };

  const updateWholesaleTier = async (
    id: string,
    updates: { min_quantity?: number; wholesale_price?: number; is_active?: boolean }
  ) => {
    try {
      const { error } = await supabase
        .from('wholesale_pricing')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchWholesaleProducts();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating wholesale tier:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteWholesaleTier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wholesale_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchWholesaleProducts();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting wholesale tier:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleWholesaleTier = async (id: string, isActive: boolean) => {
    return updateWholesaleTier(id, { is_active: !isActive });
  };

  const getProductWholesaleTiers = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('wholesale_pricing')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('min_quantity', { ascending: true });

      if (error) throw error;
      return { success: true, tiers: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchWholesaleProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchWholesaleProducts,
    addWholesaleTier,
    updateWholesaleTier,
    deleteWholesaleTier,
    toggleWholesaleTier,
    getProductWholesaleTiers,
  };
}