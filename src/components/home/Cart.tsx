import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatXOF } from '../../lib/currency';
import { Order} from '../../models';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const createOrder = async (): Promise<Order> => {
    if (!user) throw new Error('Vous devez être connecté pour effectuer un achat');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  };

  const generateWhatsAppMessage = (order: Order, orderItems: typeof items) => {
    const itemsText = orderItems.map(item => 
      `• ${item.quantity}x ${item.name} - ${formatXOF(item.price * item.quantity)}`
    ).join('\n');

    return `Bonjour! Je souhaite passer une commande 🛍️\n\n` +
           `*Détails de la commande:*\n` +
           `Numéro de commande: ${order.id}\n` +
           `Client: ${user?.email}\n\n` +
           `*Produits commandés:*\n${itemsText}\n\n` +
           `*Total: ${formatXOF(total)}*\n\n` +
           `Je suis prêt(e) à procéder au paiement. Merci!`;
  };

  const handleWhatsAppOrder = async () => {
    try {
      setIsProcessing(true);
      
      // Créer la commande dans la base de données
      const order = await createOrder();
      
      // Générer le message WhatsApp
      const message = generateWhatsAppMessage(order, items);
      const phoneNumber = "221761994984"; // Numéro de l'assistant
      const encodedMessage = encodeURIComponent(message);
      
      // Ouvrir WhatsApp
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      // Vider le panier après envoi
      clearCart();
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Une erreur est survenue lors de la création de la commande.');
    } finally {
      setIsProcessing(false);
    }
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
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voir les produits
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
                key={item.id}
                className="flex items-center p-6 border-b border-gray-200 last:border-0"
              >
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-lg font-medium text-gray-900">
                      {formatXOF(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4 text-gray-600" />
                      </button>
                      <span className="px-4 py-2 text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                        disabled={item.quantity >= item.stock_quantity}
                      >
                        <Plus className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
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
          <div className="bg-white shadow-sm rounded-lg p-6 sticky top-8">
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
              <button
                onClick={handleWhatsAppOrder}
                disabled={isProcessing}
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {isProcessing ? 'Création de la commande...' : 'Commander via WhatsApp'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Vous serez redirigé vers WhatsApp pour finaliser votre commande avec notre assistant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}