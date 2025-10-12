import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../models';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      // Récupérer le stock actuel
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (!currentProduct) throw new Error('Produit non trouvé');


      // Mettre à jour le produit
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Enregistrer le mouvement de stock automatiquement via le trigger
      // Le trigger log_stock_movement s'occupe de créer l'entrée dans stock_movements
      
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de mise à jour');
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de création');
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
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de mise à jour');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de suppression');
    }
  };

  useEffect(() => {
    fetchProducts();

    // Abonnement en temps réel aux produits
    const subscription = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [payload.new as Product, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => 
              prev.map(p => p.id === payload.new.id ? payload.new as Product : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    updateProductStock,
    createProduct,
    updateProduct,
    deleteProduct
  };
}