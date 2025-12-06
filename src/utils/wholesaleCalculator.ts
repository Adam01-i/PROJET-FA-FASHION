// utils/wholesaleCalculator.ts
import { supabase } from '../lib/supabase';

export interface WholesalePriceResult {
  finalPrice: number;
  priceType: 'regular' | 'wholesale';
  applicableTier?: {
    min_quantity: number;
    wholesale_price: number;
    discount_percentage: number;
  };
  nextTier?: {
    min_quantity: number;
    wholesale_price: number;
    neededQuantity: number;
  };
}

export async function calculateProductPrice(
  productId: string,
  quantity: number
): Promise<WholesalePriceResult> {
  try {
    // Utiliser la fonction RPC de la base de données
    const { data, error } = await supabase.rpc(
      'get_product_pricing_info',
      {
        p_product_id: productId,
        p_quantity: quantity
      }
    );

    if (error) throw error;

    if (data && data.length > 0) {
      const result = data[0];
      return {
        finalPrice: result.final_price,
        priceType: result.price_type,
        applicableTier: result.min_quantity_needed ? {
          min_quantity: result.min_quantity_needed,
          wholesale_price: result.final_price,
          discount_percentage: 0 // À calculer si nécessaire
        } : undefined,
        nextTier: result.next_tier_price ? {
          min_quantity: 0, // À récupérer si disponible
          wholesale_price: result.next_tier_price,
          neededQuantity: 0 // À calculer si nécessaire
        } : undefined
      };
    }

    // Fallback: récupérer le prix régulier
    const { data: productData } = await supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();

    return {
      finalPrice: productData?.price || 0,
      priceType: 'regular'
    };
  } catch (error) {
    console.error('Error calculating price:', error);
    return {
      finalPrice: 0,
      priceType: 'regular'
    };
  }
}

export function formatWholesaleSavings(
  regularPrice: number,
  wholesalePrice: number,
  quantity: number
): string {
  const savings = (regularPrice - wholesalePrice) * quantity;
  const percentage = ((regularPrice - wholesalePrice) / regularPrice) * 100;
  
  return `Économisez ${savings.toFixed(0)} FCFA (${percentage.toFixed(0)}%)`;
}