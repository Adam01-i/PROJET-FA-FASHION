import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Mettre à jour l'état local
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, stock_quantity: newStock }
            : product
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating stock:', err);
      throw err;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Mettre à jour l'état local
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? { ...product, ...updates }
            : product
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    updateProductStock,
    updateProduct
  };
}