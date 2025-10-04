export interface Product {
  id: string;
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  image_url?: string;
  image_gallery?: string[];
  stock_quantity: number;
  low_stock_threshold?: number;
category?: string | CategoryObject;  
category_id?: string;
  is_published?: boolean;
  is_featured?: boolean;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  vendor_id?: string;
  views_count?: number;
  sales_count?: number;
  created_at: string;
  updated_at?: string;
}


export interface CartItem {
  product: Product;
  quantity: number;
}
export interface CategoryObject {
  name: string;
  id?: string;
}


export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  role?: 'admin' | 'assistant' | 'client' | string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: string; // Ajout recommandé
  created_at: string;
  updated_at?: string; // Ajout recommandé
  order_items: OrderItem[];
}

export interface SiteSettings {
  siteName: string;
  description: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  paymentMethods: {
    wave: boolean;
    orangeMoney: boolean;
    creditCard: boolean;
  };
}