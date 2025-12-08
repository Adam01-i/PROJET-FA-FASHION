import { useState } from "react";
import { Loader2, Smartphone, CreditCard, Truck } from "lucide-react";
import axios from "axios";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  phone: string;
  name: string;
}

interface DeliveryInfo {
  location: string;
  fee: number;
}

interface PaymentSelectorProps {
  amount: number;
  items: CartItem[];
  customerInfo: CustomerInfo;
  deliveryInfo?: DeliveryInfo;
  onPaymentSuccess: (orderId: string, method: string) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentSelector({
  amount,
  items,
  customerInfo,
  deliveryInfo,
  onPaymentSuccess,
  onPaymentError,
}: PaymentSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null);

const handlePayDunyaPayment = async () => {
  setLoading("paydunya");

  try {
    const response = await axios.post("http://localhost:4000/paydunya/init-payment", {
      amount,
      items,
      customerInfo,
      deliveryInfo,
    });

    if (response.data?.url) {
      window.location.href = response.data.url; // <-- utiliser url
    } else {
      onPaymentError("Impossible d'obtenir l'URL de redirection PayDunya");
    }
  } catch (error) {
    console.error(error);
    onPaymentError("Erreur lors du paiement PayDunya");
  } finally {
    setLoading(null);
  }
};

  const handleWavePayment = async () => {
    setLoading("wave");

    try {
      const response = await axios.post("http://localhost:4000/wave/create-payment", {
        amount,
        items,
        customerInfo,
        deliveryInfo,
      });

      if (response.data?.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        onPaymentError("Impossible d'obtenir l'URL Wave");
      }
    } catch (error) {
      console.error(error);
      onPaymentError("Erreur lors du paiement Wave");
    } finally {
      setLoading(null);
    }
  };

  const handleCashDelivery = () => {
    onPaymentSuccess("cash-delivery", "cash");
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">
        Sélectionnez un mode de paiement
      </h2>

      {/* --- WAVE --- */}
      <button
        onClick={handleWavePayment}
        disabled={loading !== null}
        className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
      >
        <div className="flex items-center space-x-3">
          <Smartphone className="text-blue-600" />
          <span className="text-lg font-medium text-blue-800">Wave</span>
        </div>
        {loading === "wave" ? (
          <Loader2 className="animate-spin text-blue-600" />
        ) : (
          <span className="text-blue-700 font-semibold">{amount} FCFA</span>
        )}
      </button>

      {/* --- PAYDUNYA --- */}
      <button
        onClick={handlePayDunyaPayment}
        disabled={loading !== null}
        className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-300 rounded-xl hover:bg-yellow-100 transition"
      >
        <div className="flex items-center space-x-3">
          <CreditCard className="text-yellow-700" />
          <span className="text-lg font-medium text-yellow-900">PayDunya</span>
        </div>
        {loading === "paydunya" ? (
          <Loader2 className="animate-spin text-yellow-700" />
        ) : (
          <span className="text-yellow-900 font-semibold">{amount} FCFA</span>
        )}
      </button>

      {/* --- CASH --- */}
      <button
        onClick={handleCashDelivery}
        disabled={loading !== null}
        className="w-full flex items-center justify-between p-4 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition"
      >
        <div className="flex items-center space-x-3">
          <Truck className="text-gray-700" />
          <span className="text-lg font-medium text-gray-800">
            Paiement à la livraison
          </span>
        </div>
        <span className="text-gray-800 font-semibold">{amount} FCFA</span>
      </button>
    </div>
  );
}
