// services/pricingService.ts
import { supabase } from '../lib/supabase';
import { CartItem } from '../models';

export interface WholesalePriceInfo {
  finalPrice: number;
  priceType: 'regular' | 'wholesale';
  appliedTier?: {
    min_quantity: number;
    wholesale_price: number;
  };
}

export async function calculateProductPrice(
  productId: string,
  quantity: number
): Promise<WholesalePriceInfo> {
  try {
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
        appliedTier: result.min_quantity_needed ? {
          min_quantity: result.min_quantity_needed,
          wholesale_price: result.final_price,
        } : undefined,
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

export async function calculateCartWithWholesale(
  items: CartItem[]
): Promise<{
  items: Array<CartItem & { wholesalePrice?: number; appliedTier?: any }>;
  subtotal: number;
  totalWholesaleSavings: number;
}> {
  const itemsWithWholesale = await Promise.all(
    items.map(async (item) => {
      const priceInfo = await calculateProductPrice(item.id, item.quantity);
      
      return {
        ...item,
        wholesalePrice: priceInfo.finalPrice,
        appliedTier: priceInfo.appliedTier,
        isWholesaleApplied: priceInfo.priceType === 'wholesale',
        savings: priceInfo.priceType === 'wholesale' 
          ? (item.price - priceInfo.finalPrice) * item.quantity 
          : 0
      };
    })
  );

  const subtotal = itemsWithWholesale.reduce(
    (sum, item) => sum + (item.wholesalePrice || item.price) * item.quantity,
    0
  );

  const totalWholesaleSavings = itemsWithWholesale.reduce(
    (sum, item) => sum + (item.savings || 0),
    0
  );

  return {
    items: itemsWithWholesale,
    subtotal,
    totalWholesaleSavings
  };
}