// Types basiques seulement
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  stock_quantity: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SiteSettingsData {
  siteName: string;
  description: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  paymentMethods: {
    wave: boolean;
    orangeMoney: boolean;
    creditCard: boolean;
  };
}

export interface SiteSettingsDB {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
}