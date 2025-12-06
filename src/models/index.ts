export interface User {
  id: string;
  email: string;
  role: "admin" | "client" | "assistant" | "livreur" | string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_guest_user?: boolean;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
}


export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  stock_quantity: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  // Ajoute cette propriété pour gérer les jointures
  category?: {
    name: string;
  };
  // Ou cette propriété alternative
  category_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Order {
  assistant_id: string;
  assistant_name: string;
  id: string;
  user_id: string;
  user?: User;
  customer_phone: string; // Nouveau champ obligatoire
  customer_name?: string; // Nouveau champ optionnel
  customer_email?: string; // Nouveau champ optionnel
  processed_by?: User;

  // AJOUTER ces nouveaux champs pour la livraison
  subtotal_amount: number;
  delivery_fee: number;
  delivery_location_id?: string;
  delivery_location_name?: string;

  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "delivered" | "shipped";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?:
    | "wave"
    | "orange_money"
    | "mobile_money"
    | "credit_card"
    | "cash";
  payment_proof?: string;
  shipping_address?: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  notes?: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];

  delivered_by?: string;
  delivered_by_name?: string;
  delivered_at?: string;

  // Optionnel: ajouter une relation pour faciliter les jointures
  delivery_location?: DeliveryLocation;
  delivered_by_user?: User;
}
 // Dans models.ts, ajoutez après l'interface Product :

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock_quantity: number;
}

// Optionnel: Ajoutez aussi une interface étendue pour les prix en gros
export interface CartItemWithWholesale extends CartItem {
  wholesalePrice?: number;
  savings?: number;
  isWholesaleApplied?: boolean;
  appliedTier?: {
    min_quantity: number;
    wholesale_price: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// Nouveaux types pour les tables distinctes
export interface StoreSettings {
  id: string;
  name: string;
  description?: string; // Peut être null
  email: string;
  phone?: string; // Peut être null
  address?: string; // Peut être null
  currency: string;
  logo_url?: string;
  favicon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  id: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url?: string;
  tiktok_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethods {
  id: string;
  wave_enabled: boolean;
  orange_money_enabled: boolean;
  credit_card_enabled: boolean;
  mobile_money_enabled: boolean;
  cash_on_delivery_enabled: boolean;
  bank_transfer_enabled: boolean;
  wave_instructions?: string;
  orange_money_instructions?: string;
  bank_transfer_details?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingSettings {
  id: string;
  enabled: boolean;
  cost: number;
  free_shipping_threshold: number;
  delivery_time: string;
  home_delivery_enabled: boolean;
  pickup_in_store_enabled: boolean;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryLocation {
  id: string;
  name: string;
  delivery_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceSettings {
  id: string;
  company_name: string;
  company_address: string;
  company_city: string;
  company_country: string;
  company_phone: string;
  company_email: string;
  company_website?: string;
  company_tax_id?: string;
  company_logo_url?: string;
  company_account_number?: string;
  created_at: string;
  updated_at: string;
}

// Interface pour tous les paramètres combinés

export interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  totalSales: number;
  assistantSales: number;

  currentMonthSales: number;
  currentWeekSales: number;
  bestSellingProduct?: string;
  revenueGrowth?: number;
}

export interface ProductSale {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
  stock_quantity: number;
  image_url?: string;
  category?: string;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
  last_restock_date?: string;
  urgency: "low" | "medium" | "high";
}

export interface InventoryFilters {
  category: string;
  stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy: "name" | "stock" | "sales" | "revenue";
  sortOrder: "asc" | "desc";
}

// À ajouter à vos interfaces
export interface StockAlert {
  id: string;
  product_id: string;
  product?: Product;
  threshold: number;
  urgency: "low" | "medium" | "high";
  is_active: boolean;
  notified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product?: Product;
  movement_type: "in" | "out" | "adjustment";
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  created_by?: string;
  created_by_user?: User;
  created_at: string;
  updated_at: string;
}

export interface DeveloperInfo {
  id: string;
  developer_name: string;
  developer_email?: string;
  developer_phone?: string;
  developer_website?: string;
  github_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  portfolio_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}


// ----------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------

// Ajoutez ces interfaces à votre fichier models.ts
export interface WholesaleProduct {
  id: string;
  product_id: string;
  min_quantity: number;
  wholesale_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WholesalePricing {
  id: string;
  product_id: string;
  min_quantity: number;
  wholesale_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithWholesale extends Product {
  wholesale_tiers?: WholesaleTier[];
  has_wholesale?: boolean;
  min_wholesale_quantity?: number;
  wholesale_price?: number;
}

export interface WholesaleTier {
  min_quantity: number;
  wholesale_price: number;
  discount_percentage: number;
}

// Dans models.ts, ajoutez ces interfaces :
export interface WholesaleTier {
  id: string;
  product_id: string;
  min_quantity: number;
  wholesale_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithWholesale extends Product {
  has_wholesale?: boolean;
  wholesale_tiers?: WholesaleTier[];
  min_wholesale_quantity?: number;
  wholesale_price?: number;
  discount_percentage?: number;
}

export interface WholesaleStats {
  total_wholesale_products: number;
  active_wholesale_tiers: number;
  average_discount: number;
  top_discount_product?: {
    product_name: string;
    discount_percentage: number;
    regular_price: number;
    wholesale_price: number;
  };
  total_potential_savings: number;
}

// Ajoutez aussi le type pour le filtre
// MODELS.TS - Version corrigée
export interface InventoryFilters {
  category: string;
  stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sortBy: "name" | "stock" | "sales" | "revenue"; // Pas de "wholesale" ici
  sortOrder: "asc" | "desc";
  // Pas de "wholesale" ici - on le gère séparément
}