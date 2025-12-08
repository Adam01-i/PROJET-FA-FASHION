// types/payment.ts
export type PaymentMethod = 'whatsapp' | 'wave' | 'orange_money' | 'mobile_money' | 'credit_card' | 'cash' | 'paydunya';

export interface PaymentProvider {
  id: PaymentMethod;
  name: string;
  icon: string; // ou React component
  description: string;
  enabled: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  provider?: PaymentProvider;
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    phone: string;
    name?: string;
  };
}