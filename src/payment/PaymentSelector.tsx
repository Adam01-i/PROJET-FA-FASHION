// components/payment/PaymentSelector.tsx
import { useState } from 'react';
import { CreditCard, Smartphone, MessageCircle, Banknote } from 'lucide-react';
import { PaymentMethod, PaymentProvider } from '../types/payment';
import WhatsAppPayment from './WhatsAppPayment';
// import WavePayment from './WavePayment'; // À créer
// import OrangeMoneyPayment from './OrangeMoneyPayment'; // À créer
import { CartItem } from '../models';

interface PaymentSelectorProps {
  amount: number;
  items: CartItem[];
  customerInfo: {
    phone: string;
    name?: string;
  };
  deliveryInfo?: {
    location: string;
    fee: number;
  };
  onPaymentSuccess?: (orderId: string, method: PaymentMethod) => void;
  onPaymentError?: (error: string) => void;
}

const PAYMENT_METHODS: PaymentProvider[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'message-circle',
    description: 'Confirmez votre commande via WhatsApp',
    enabled: true
  },
  {
    id: 'wave',
    name: 'Wave',
    icon: 'smartphone',
    description: 'Paiement mobile via Wave',
    enabled: true
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    icon: 'smartphone',
    description: 'Paiement mobile Orange Money',
    enabled: true
  },
  {
    id: 'credit_card',
    name: 'Carte Bancaire',
    icon: 'credit-card',
    description: 'Paiement sécurisé par carte',
    enabled: false // À activer plus tard
  },
  {
    id: 'cash',
    name: 'Espèces',
    icon: 'banknote',
    description: 'Paiement à la livraison',
    enabled: true
  }
];

export default function PaymentSelector({
  items,
  customerInfo,
  deliveryInfo,
  onPaymentSuccess,
  onPaymentError
}: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('whatsapp');

  const handlePaymentSuccess = (orderId: string) => {
    onPaymentSuccess?.(orderId, selectedMethod);
  };

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'whatsapp':
        return (
          <WhatsAppPayment
            items={items}
            customerInfo={customerInfo}
            deliveryInfo={deliveryInfo}
            onSuccess={handlePaymentSuccess}
            onError={onPaymentError}
          />
        );
      
      case 'wave':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Wave payment component coming soon...</p>
            <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700">
              En développement
            </button>
          </div>
        );
      
      case 'orange_money':
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Orange Money payment component coming soon...</p>
            <button className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700">
              En développement
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Choisissez votre mode de paiement
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PAYMENT_METHODS.filter(method => method.enabled).map((method) => {
            const Icon = method.icon === 'message-circle' ? MessageCircle :
                        method.icon === 'smartphone' ? Smartphone :
                        method.icon === 'credit-card' ? CreditCard : Banknote;
            
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedMethod === method.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedMethod === method.id ? 'bg-indigo-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      selectedMethod === method.id ? 'text-indigo-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t pt-6">
        {renderPaymentMethod()}
      </div>
    </div>
  );
}