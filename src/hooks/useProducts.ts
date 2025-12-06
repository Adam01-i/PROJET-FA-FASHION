// hooks/useProducts.ts (version complète avec prix en gros)
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Product, StockMovement, ProductWithWholesale } from '../models';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsWithWholesale, setProductsWithWholesale] = useState<ProductWithWholesale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSubscribed = useRef(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les produits avec leurs catégories ET prix en gros
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (name),
          wholesale_pricing (
            id,
            min_quantity,
            wholesale_price,
            is_active
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformer les données pour les produits standard
      const formattedProducts: Product[] = (data || []).map(product => ({
        ...product,
        category_name: product.category?.name
      }));

      // Transformer pour les produits avec info prix en gros
      const formattedProductsWithWholesale: ProductWithWholesale[] = (data || []).map(product => ({
        ...product,
        category_name: product.category?.name,
        has_wholesale: product.wholesale_pricing && product.wholesale_pricing.length > 0,
        wholesale_tiers: product.wholesale_pricing || [],
        min_wholesale_quantity: product.wholesale_pricing?.[0]?.min_quantity,
        wholesale_price: product.wholesale_pricing?.[0]?.wholesale_price
      }));
      
      setProducts(formattedProducts);
      setProductsWithWholesale(formattedProductsWithWholesale);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer spécifiquement les produits avec info de prix en gros
  const fetchProductsWithWholesale = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories (name),
          wholesale_pricing (
            id,
            min_quantity,
            wholesale_price,
            is_active
          )
        `)
        .eq('is_public', true)
        .order('name');

      if (error) throw error;

      const formattedProducts: ProductWithWholesale[] = (data || []).map(product => ({
        ...product,
        category_name: product.category?.name,
        has_wholesale: product.wholesale_pricing && product.wholesale_pricing.length > 0,
        wholesale_tiers: product.wholesale_pricing || [],
        min_wholesale_quantity: product.wholesale_pricing?.[0]?.min_quantity,
        wholesale_price: product.wholesale_pricing?.[0]?.wholesale_price
      }));

      setProductsWithWholesale(formattedProducts);
      return formattedProducts;
    } catch (err) {
      console.error('Error fetching products with wholesale:', err);
      throw err;
    }
  };

  // Fonction pour ajouter un prix en gros à un produit
  const addWholesalePrice = async (
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
      
      await fetchProductsWithWholesale();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Fonction pour mettre à jour un prix en gros
  const updateWholesalePrice = async (
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
      
      await fetchProductsWithWholesale();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Fonction pour supprimer un prix en gros
  const deleteWholesalePrice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wholesale_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProductsWithWholesale();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Fonction pour activer/désactiver un prix en gros
  const toggleWholesalePrice = async (id: string, isActive: boolean) => {
    return updateWholesalePrice(id, { is_active: !isActive });
  };

  // Fonction pour récupérer tous les seuils d'un produit
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

  // NOUVELLE FONCTION POUR VENDRE UN PRODUIT
  const sellProduct = async (productId: string, quantity: number, reason?: string, createdBy?: string) => {
    try {
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

      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStock,
          sales_count: newSalesCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

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
    productsWithWholesale,
    loading,
    error,
    refetch: fetchProducts,
    refetchWholesaleInfo: fetchProductsWithWholesale,
    // Fonctions pour prix en gros
    addWholesalePrice,
    updateWholesalePrice,
    deleteWholesalePrice,
    toggleWholesalePrice,
    getProductWholesaleTiers,
    // Fonctions existantes
    sellProduct,
    updateProductStock,
    restockProduct,
    getStockMovements,
    createProduct,
    updateProduct,
    deleteProduct
  };
}