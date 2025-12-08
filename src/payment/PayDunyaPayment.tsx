// src/payment/PayDunyaPayment.tsx
import { useState } from 'react';
import axios from 'axios';
import { CartItem } from '../models';

interface Props {
  amount: number;
  items: CartItem[];
  customer: { name?: string; phone?: string; email?: string };
  onSuccess?: (orderId: string) => void;
  onError?: (err: any) => void;
}

export default function PayDunyaPayment({ amount, items, customer, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // returnUrl : où PayDunya ramènera l'utilisateur après paiement (frontend)
      const returnUrl = `${window.location.origin}/payment-success`;
      const cancelUrl = `${window.location.origin}/payment-cancel`;

      const resp = await axios.post('/api/paydunya/create-invoice', {
        amount,
        currency: 'XOF',
        items,
        customer,
        returnUrl,
        cancelUrl,
        metadata: { /* ex: orderId from your DB */ }
      });

      if (resp.data.success) {
        // Selon la réponse, récupérer l'URL de paiement:
        // exemple: resp.data.data.checkout_url ou resp.data.data.invoice_url
        const data = resp.data.data;
        const checkoutUrl = data.checkout_url || data.invoice_url || (data && data.data && data.data.checkout_url);

        if (!checkoutUrl) {
          throw new Error('Aucune URL de paiement fournie par PayDunya');
        }

        // Ouvrir l'url de paiement (nouvel onglet)
        window.open(checkoutUrl, '_blank');

        // Optionnel: si tu veux rediriger dans même page :
        // window.location.href = checkoutUrl;

        setLoading(false);
      } else {
        setLoading(false);
        onError?.(resp.data);
      }
    } catch (err: any) {
      setLoading(false);
      console.error('PayDunya create invoice error:', err.response?.data || err.message);
      onError?.(err.response?.data || err.message);
    }
  };

  return (
    <div className="text-center py-4">
      <button
        onClick={handlePay}
        disabled={loading}
        className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-yellow-600 hover:bg-yellow-700'}`}
      >
        {loading ? 'Redirection vers PayDunya...' : `Payer ${amount.toLocaleString()} XOF avec PayDunya`}
      </button>
    </div>
  );
}
