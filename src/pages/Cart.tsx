import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { stripePromise } from '../lib/stripe';
import WavePaymentModal from '../components/WavePaymentModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatXOF } from '../lib/currency';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = React.useState<'wave' | 'orange' | 'card' | null>(null);
  const [isWaveModalOpen, setIsWaveModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { user } = useAuth();

  const createOrder = async () => {
    if (!user) throw new Error('Vous devez être connecté pour effectuer un achat');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order.id;
  };

  const handleCheckout = async () => {
    if (!paymentMethod) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    try {
      setIsProcessing(true);
      const orderId = await createOrder();

      if (paymentMethod === 'wave') {
        setIsWaveModalOpen(true);
        return;
      }

      if (paymentMethod === 'orange') {
        const phoneNumber = prompt('Entrez votre numéro de téléphone:');
        if (!phoneNumber) return;

        alert(`Un message de confirmation a été envoyé à ${phoneNumber}. Veuillez suivre les instructions pour finaliser le paiement.`);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
          orderId,
        }),
      });

      const session = await response.json();
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWaveSuccess = () => {
    clearCart();
    alert('Paiement réussi ! Vous recevrez une confirmation par SMS.');
  };

  const handleWaveError = (error: Error) => {
    console.error('Wave payment error:', error);
    alert('Une erreur est survenue lors du paiement Wave. Veuillez réessayer.');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Votre panier est vide</h2>
          <p className="mt-1 text-sm text-gray-500">
            Commencez votre shopping en visitant notre catalogue de produits.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Votre Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white shadow-sm rounded-lg">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center p-6 border-b border-gray-200 last:border-0"
              >
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-lg font-medium text-gray-900">
                      {formatXOF(item.product.price * item.quantity)}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Résumé de la commande</h2>

            <div className="flow-root">
              <dl className="-my-4 text-sm divide-y divide-gray-200">
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Sous-total</dt>
                  <dd className="font-medium text-gray-900">{formatXOF(total)}</dd>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Livraison</dt>
                  <dd className="font-medium text-gray-900">Gratuite</dd>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">{formatXOF(total)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Mode de paiement</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('wave')}
                  className={`flex items-center justify-center px-4 py-3 border rounded-lg ${
                    paymentMethod === 'wave'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <img
                    src="https://wave.com/static/wave-logo.png"
                    alt="Wave"
                    className="h-6"
                  />
                </button>
                
                <button
                  onClick={() => setPaymentMethod('orange')}
                  className={`flex items-center justify-center px-4 py-3 border rounded-lg ${
                    paymentMethod === 'orange'
                      ? 'border-orange-600 bg-orange-50 text-orange-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <img
                    src="https://www.orange.sn/omoney/assets/images/logo-orange-money.png"
                    alt="Orange Money"
                    className="h-6"
                  />
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing || !paymentMethod}
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  isProcessing || !paymentMethod
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {isProcessing ? 'Traitement...' : 'Procéder au paiement'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <WavePaymentModal
        isOpen={isWaveModalOpen}
        onClose={() => setIsWaveModalOpen(false)}
        onSuccess={handleWaveSuccess}
        onError={handleWaveError}
        amount={total}
        phoneNumber={user?.phone || ''}
      />
    </div>
  );
}