// components/payment/WavePayment.tsx
import { useState } from 'react';
import { CartItem } from '../models';
// import { Spinner } from '../ui/LoadingSpinner'
import axios from 'axios';

interface WavePaymentProps {
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
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export default function WavePayment({
  amount,
  items,
  customerInfo,
  deliveryInfo,
  onSuccess,
  onError
}: WavePaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWavePayment = async () => {
    if (!customerInfo.phone) {
      onError?.('Veuillez saisir votre numéro de téléphone.');
      return;
    }

    setIsProcessing(true);

    try {
      // Appel à ton endpoint backend qui gère Wave Business
      const response = await axios.post('/api/wave-payment', {
        amount,
        phone: customerInfo.phone.replace(/\s/g, ''), // enlever les espaces
        name: customerInfo.name,
        items,
        delivery: deliveryInfo
      });

      if (response.data.success) {
        onSuccess?.(response.data.orderId);
      } else {
        onError?.(response.data.message || 'Erreur lors du paiement Wave.');
      }
    } catch (err: any) {
      console.error('Wave payment error:', err);
      onError?.(err.response?.data?.message || err.message || 'Erreur inconnue.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="text-center py-4">
      <button
        onClick={handleWavePayment}
        disabled={isProcessing}
        className={`px-6 py-3 rounded-md text-white font-medium ${
          isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Traitement...' : `Payer ${amount.toLocaleString()} XOF avec Wave`}
      </button>
    </div>
  );
}
