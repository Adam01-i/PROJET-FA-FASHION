export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'assistant' | string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  stock_quantity: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
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
  id: string;
  user_id: string;
  user?: User;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'wave' | 'orange_money' | 'mobile_money' | 'credit_card' | 'cash';
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
  description: string;
  email: string;
  phone: string;
  address: string;
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

export interface InvoiceSettings {
  id: string;
  // Informations de l'entreprise
  company_name: string;
  company_address: string;
  company_city: string;
  company_country: string;
  company_phone: string;
  company_email: string;
  company_website?: string;
  company_tax_id?: string;
  company_logo_url?: string;
  // company_rccm?: string;
  // company_id_nat?: string;
  company_account_number?: string;
  
  // Paramètres de facture
  // invoice_prefix: string;
  // invoice_next_number: number;
  // invoice_due_days: number;
  // invoice_terms: string;
  // invoice_notes?: string;
  // invoice_payment_terms?: string;
  // invoice_legal_notice?: string;
  
  created_at: string;
  updated_at: string;
}

// Interface pour tous les paramètres combinés
export interface SiteSettingsData {
  store: StoreSettings;
  socialLinks: SocialLinks;
  paymentMethods: PaymentMethods;
  shipping: ShippingSettings;
  invoiceSettings: InvoiceSettings;
}