// components/client/WholesaleBadge.tsx
import { Tag } from "lucide-react";
import { Product, WholesaleTier } from "../../../models";

// Interface locale étendue
interface ProductWithWholesale extends Product {
  wholesale_tiers?: WholesaleTier[];
}

interface WholesaleBadgeProps {
  product: ProductWithWholesale;
}

export default function WholesaleBadge({ product }: WholesaleBadgeProps) {
  // Vérifier si le produit a des prix en gros actifs
  const hasWholesale = product.wholesale_tiers && 
    product.wholesale_tiers.some((tier: WholesaleTier) => tier.is_active);
  
  if (!hasWholesale) return null;

  // Trouver le seuil minimum
  const activeTiers = product.wholesale_tiers?.filter((tier: WholesaleTier) => tier.is_active) || [];
  const minTier = activeTiers.reduce((min: WholesaleTier, tier: WholesaleTier) => 
    tier.min_quantity < min.min_quantity ? tier : min, 
    { 
      min_quantity: Infinity, 
      wholesale_price: 0,
      is_active: true,
      id: '',
      product_id: '',
      created_at: '',
      updated_at: ''
    } as WholesaleTier
  );

  if (minTier.min_quantity === Infinity) return null;

  return (
    <div className="absolute top-14 left-3 z-10">
      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
        <Tag size={10} />
        <span>À partir de {minTier.min_quantity}</span>
      </div>
    </div>
  );
}