import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Interface pour les données Supabase
interface ProductData {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock_quantity: number;
  is_public: boolean;
  categories: {
    name: string;
  };
}

export interface ProductForWholesale {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category_name?: string;
  stock_quantity: number;
  is_public: boolean;
  has_wholesale?: boolean;
}

export function useProductsForWholesale() {
  const [products, setProducts] = useState<ProductForWholesale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les produits actifs
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          stock_quantity,
          is_public,
          categories (
            name
          )
        `)
        .eq('is_public', true)
        .order('name');

      if (productsError) throw productsError;

      // Récupérer les produits qui ont déjà des prix en gros
      const { data: wholesaleData, error: wholesaleError } = await supabase
        .from('wholesale_pricing')
        .select('product_id')
        .eq('is_active', true);

      if (wholesaleError) throw wholesaleError;

      const wholesaleProductIds = new Set(
        wholesaleData?.map(item => item.product_id) || []
      );

      // Type assertion et transformation
      const typedData = productsData as unknown as ProductData[];
      
      const transformedData: ProductForWholesale[] = typedData.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        stock_quantity: item.stock_quantity,
        is_public: item.is_public,
        category_name: item.categories?.name,
        has_wholesale: wholesaleProductIds.has(item.id),
      }));

      setProducts(transformedData);
    } catch (err: any) {
      console.error('Error fetching products for wholesale:', err);
      setError(err.message || 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (searchTerm: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          stock_quantity,
          is_public,
          categories (
            name
          )
        `)
        .eq('is_public', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name');

      if (error) throw error;

      // Récupérer les produits qui ont déjà des prix en gros
      const { data: wholesaleData } = await supabase
        .from('wholesale_pricing')
        .select('product_id')
        .eq('is_active', true);

      const wholesaleProductIds = new Set(
        wholesaleData?.map(item => item.product_id) || []
      );

      // Type assertion et transformation
      const typedData = data as unknown as ProductData[];
      
      const transformedData: ProductForWholesale[] = typedData.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_url: item.image_url,
        stock_quantity: item.stock_quantity,
        is_public: item.is_public,
        category_name: item.categories?.name,
        has_wholesale: wholesaleProductIds.has(item.id),
      }));

      setProducts(transformedData);
    } catch (err: any) {
      console.error('Error searching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    searchProducts,
  };
}