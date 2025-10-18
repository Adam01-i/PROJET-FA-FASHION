// components/client/ClientCart.tsx (version simplifiée)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, MessageCircle, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { formatXOF } from '../../../lib/currency';
import { useCart } from '../../../contexts/CartContext';

export default function ClientCart() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    total,
    itemCount 
  } = useCart();

  // ✅ Fonction simple pour créer une commande guest
  const createOrder = async (): Promise<{id: string}> => {
    if (!phoneNumber.trim()) {
      throw new Error('Le numéro de téléphone est obligatoire');
    }

    // Valider le format du numéro de téléphone
    const phoneRegex = /^(77|76|70|75|78)[0-9]{7}$/;
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      throw new Error('Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)');
    }

    // Préparer les données des articles
    const orderItemsData = items.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    // Utiliser RPC pour créer la commande guest
    const { data, error } = await supabase.rpc('create_guest_order', {
      customer_phone: cleanPhone,
      customer_name: customerName.trim() || null,
      total_amount: total,
      order_items: orderItemsData
    });

    if (error) {
      console.error('RPC Error:', error);
      throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
    }

    return { id: data };
  };

  const generateWhatsAppMessage = (orderId: string) => {
    const itemsText = items.map(item => 
      `• ${item.quantity}x ${item.name} - ${formatXOF(item.price * item.quantity)}`
    ).join('\n');

    const customerInfo = customerName 
      ? `Nom: ${customerName}\nTéléphone: ${phoneNumber}`
      : `Téléphone: ${phoneNumber}`;

    return `Bonjour! Je souhaite passer une commande 🛍️\n\n` +
           `*Informations client:*\n${customerInfo}\n\n` +
           `*Détails de la commande:*\n` +
           `Numéro de commande: ${orderId}\n\n` +
           `*Produits commandés:*\n${itemsText}\n\n` +
           `*Total: ${formatXOF(total)}*\n\n` +
           `Je suis prêt(e) à procéder au paiement. Merci!`;
  };

  const handleWhatsAppOrder = async () => {
    try {
      setIsProcessing(true);
      
      if (!showCustomerForm) {
        setShowCustomerForm(true);
        return;
      }

      // Créer la commande dans la base de données
      const order = await createOrder();
      
      // Générer le message WhatsApp
      const message = generateWhatsAppMessage(order.id);
      const whatsappNumber = "221761994984"; // Votre numéro WhatsApp business
      const encodedMessage = encodeURIComponent(message);
      
      // Ouvrir WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
      // Vider le panier après envoi
      clearCart();
      setShowCustomerForm(false);
      setPhoneNumber('');
      setCustomerName('');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la commande.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      formatted = formatted.slice(0, 6) + ' ' + formatted.slice(6);
    }
    if (cleaned.length > 7) {
      formatted = formatted.slice(0, 9) + ' ' + formatted.slice(9);
    }
    
    setPhoneNumber(formatted.slice(0, 12));
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
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Votre Panier ({itemCount} article{itemCount > 1 ? 's' : ''})</h1>

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

            {/* Formulaire informations client */}
            {showCustomerForm && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  Informations de contact
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 77, 76, 70, 75 ou 78
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Votre nom (optionnel)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <button
                onClick={handleWhatsAppOrder}
                disabled={isProcessing || (showCustomerForm && !phoneNumber.trim())}
                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  isProcessing || (showCustomerForm && !phoneNumber.trim())
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {showCustomerForm 
                  ? (isProcessing ? 'Création de la commande...' : 'Confirmer et passer commande')
                  : 'Passer la commande'
                }
              </button>

              {!showCustomerForm && (
                <p className="text-xs text-gray-500 text-center">
                  Aucune connexion nécessaire. Juste votre numéro pour confirmer la commande.
                </p>
              )}

              {showCustomerForm && (
                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Retour
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}