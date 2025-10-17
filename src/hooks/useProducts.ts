// hooks/useProducts.ts (version corrigée)
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, StockMovement } from '../models';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Formater les produits avec le nom de catégorie
      const formattedProducts: Product[] = (data || []).map(product => ({
        ...product,
        category_name: product.category?.name
      }));
      
      setProducts(formattedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // AJOUTER CETTE FONCTION MANQUANTE
  const updateProductStock = async (productId: string, newStock: number, reason?: string, createdBy?: string) => {
    try {
      // Récupérer le stock actuel
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (!currentProduct) throw new Error('Produit non trouvé');

      const previousStock = currentProduct.stock_quantity;
      const quantityChange = newStock - previousStock;

      // Mettre à jour le produit
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Enregistrer le mouvement de stock
      if (quantityChange !== 0) {
        const movementType = quantityChange > 0 ? 'in' : 'out';
        
        const { error: movementError } = await supabase
          .from('stock_movements')
          .insert({
            product_id: productId,
            movement_type: movementType,
            quantity: Math.abs(quantityChange),
            previous_stock: previousStock,
            new_stock: newStock,
            reason: reason || 'Ajustement manuel du stock',
            created_by: createdBy
          });

        if (movementError) throw movementError;
      }

      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de mise à jour du stock');
    }
  };

  const restockProduct = async (productId: string, quantity: number, reason?: string, createdBy?: string) => {
    try {
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (!currentProduct) throw new Error('Produit non trouvé');

      const newStock = currentProduct.stock_quantity + quantity;

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Enregistrer le mouvement de réapprovisionnement
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: productId,
          movement_type: 'in',
          quantity: quantity,
          previous_stock: currentProduct.stock_quantity,
          new_stock: newStock,
          reason: reason || 'Réapprovisionnement',
          created_by: createdBy
        });

      if (movementError) throw movementError;

      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de réapprovisionnement');
    }
  };

  const getStockMovements = async (productId: string): Promise<StockMovement[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products (*),
          created_by_user:profiles!created_by (id, full_name, email)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de chargement des mouvements');
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'category_name'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select(`
          *,
          category:categories (name)
        `)
        .single();

      if (error) throw error;

      // Formater le produit avec le nom de catégorie
      const formattedProduct: Product = {
        ...data,
        category_name: data.category?.name
      };

      return formattedProduct;
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
            const newProduct = payload.new as Product;
            setProducts(prev => [newProduct, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProducts(prev => 
              prev.map(p => p.id === payload.new.id ? { ...payload.new as Product } : p)
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
    // AJOUTER updateProductStock ici
    updateProductStock,
    restockProduct,
    getStockMovements,
    createProduct,
    updateProduct,
    deleteProduct
  };
}