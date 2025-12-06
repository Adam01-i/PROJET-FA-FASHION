// hooks/useProducts.ts (version corrigée)
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Product, StockMovement } from '../models';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSubscribed = useRef(false);

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

  // NOUVELLE FONCTION POUR VENDRE UN PRODUIT
  const sellProduct = async (productId: string, quantity: number, reason?: string, createdBy?: string) => {
    try {
      // Récupérer le produit actuel
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity, sales_count')
        .eq('id', productId)
        .single();

      if (!currentProduct) throw new Error('Produit non trouvé');

      const newStock = currentProduct.stock_quantity - quantity;
      const newSalesCount = (currentProduct.sales_count || 0) + quantity;

      if (newStock < 0) {
        throw new Error('Stock insuffisant');
      }

      // Mettre à jour le produit en UNE SEULE opération
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          sales_count: newSalesCount, // ← METTRE À JOUR LE COMPTEUR DE VENTES
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Enregistrer le mouvement de vente
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: productId,
          movement_type: 'out',
          quantity: quantity,
          previous_stock: currentProduct.stock_quantity,
          new_stock: newStock,
          reason: reason || 'Vente',
          created_by: createdBy
        });

      if (movementError) throw movementError;

      return true;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur lors de la vente');
    }
  };

  const updateProductStock = async (productId: string, newStock: number, reason?: string, createdBy?: string) => {
    try {
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single();

      if (!currentProduct) throw new Error('Produit non trouvé');

      const previousStock = currentProduct.stock_quantity;
      const quantityChange = newStock - previousStock;

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

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

    if (isSubscribed.current) return;
    isSubscribed.current = true;

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
          console.log('🔄 Changement produit détecté:', payload.eventType);
          
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
      isSubscribed.current = false;
    };
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    sellProduct,
    updateProductStock,
    restockProduct,
    getStockMovements,
    createProduct,
    updateProduct,
    deleteProduct
  };
}