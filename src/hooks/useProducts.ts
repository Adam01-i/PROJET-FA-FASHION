import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

// Dans useProducts.ts
export function useProducts(onlyPublic: boolean = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Filtrer seulement les produits publics si demandé
      if (onlyPublic) {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [onlyPublic]);

  return { products, loading, error, refetch: fetchProducts, refetchProducts: fetchProducts};
}