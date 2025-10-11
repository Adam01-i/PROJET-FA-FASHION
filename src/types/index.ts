// types.ts
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

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: unknown;
  created_at: string;
  updated_at?: string;
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

export interface SiteSettingsData {
  siteName: string;
  description: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  currency: string;
  maintenanceMode: boolean;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  paymentMethods: {
    wave: boolean;
    orangeMoney: boolean;
    creditCard: boolean;
    mobileMoney: boolean;
  };
  shipping: {
    enabled: boolean;
    cost: number;
    freeShippingThreshold: number;
  };
}

export interface SiteSettingsDB {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}