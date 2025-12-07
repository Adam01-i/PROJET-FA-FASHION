// components/client/Cart/ClientCart.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  User,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { formatXOF } from "../../../lib/currency";
import { useCart } from "../../../contexts/CartContext";
import { DeliveryLocation } from "../../../models";
import { calculateCartWithWholesale } from "../../../services/pricingService";
import PaymentSelector from "../../../payment/PaymentSelector";

// Définition locale si CartItem n'est pas dans models.ts
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock_quantity: number;
}

interface CartItemWithWholesale extends CartItem {
  wholesalePrice?: number;
  savings?: number;
  isWholesaleApplied?: boolean;
  appliedTier?: {
    min_quantity: number;
    wholesale_price: number;
  };
}

export default function ClientCart() {
  // const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<DeliveryLocation | null>(null);
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [cartWithWholesale, setCartWithWholesale] = useState<{
    items: CartItemWithWholesale[];
    subtotal: number;
    totalWholesaleSavings: number;
  } | null>(null);

  const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();

  // Calculer les prix en gros
  useEffect(() => {
    const calculatePrices = async () => {
      if (items.length > 0) {
        const result = await calculateCartWithWholesale(items);
        setCartWithWholesale(result);
      } else {
        setCartWithWholesale(null);
      }
    };

    calculatePrices();
  }, [items]);

  // Récupérer les lieux de livraison
  useEffect(() => {
    const fetchDeliveryLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const { data, error } = await supabase
          .from("delivery_locations")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (error) throw error;
        setDeliveryLocations(data || []);
        
        if (data && data.length > 0) {
          setSelectedLocation(data[0]);
        }
      } catch (error) {
        console.error("Error fetching delivery locations:", error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchDeliveryLocations();
  }, []);

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + " " + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      formatted = formatted.slice(0, 6) + " " + formatted.slice(6);
    }
    if (cleaned.length > 7) {
      formatted = formatted.slice(0, 9) + " " + formatted.slice(9);
    }

    setPhoneNumber(formatted.slice(0, 12));
  };

  const handlePaymentSuccess = (orderId: string, method: string) => {
    console.log(`Order ${orderId} created with ${method}`);
    clearCart();
    setShowCustomerForm(false);
    setPhoneNumber("");
    setCustomerName("");
    // alert(`Commande créée avec succès! Numéro: ${orderId}`);
  };

  const handlePaymentError = (error: string) => {
    alert(`Erreur: ${error}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">
            Votre panier est vide
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Commencez votre shopping en visitant notre catalogue de produits.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-500 hover:bg-pink-600"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayItems = cartWithWholesale?.items || items;
  const subtotal = cartWithWholesale?.subtotal || total;
  const deliveryFee = selectedLocation?.delivery_fee || 0;
  const totalAmount = subtotal + deliveryFee;
  const totalSavings = cartWithWholesale?.totalWholesaleSavings || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Votre Panier ({itemCount} article{itemCount > 1 ? "s" : ""})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section produits */}
        <div className="lg:col-span-8">
          <div className="bg-white shadow-sm rounded-lg">
            {displayItems.map((item) => {
              const itemPrice = 'wholesalePrice' in item ? (item as CartItemWithWholesale).wholesalePrice || item.price : item.price;
              const itemTotal = itemPrice * item.quantity;
              const regularTotal = item.price * item.quantity;
              const savings = 'savings' in item ? (item as CartItemWithWholesale).savings || 0 : 0;

              return (
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
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.name}
                        </h3>
                        {savings > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                              Économie: {formatXOF(savings)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Prix en gros appliqué
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">
                          {formatXOF(itemTotal)}
                        </p>
                        {savings > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            {formatXOF(regularTotal)}
                          </p>
                        )}
                      </div>
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
                        <span className="px-4 py-2 text-gray-900">
                          {item.quantity}
                        </span>
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
              );
            })}
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

        {/* Section résumé et paiement */}
        <div className="lg:col-span-4">
          <div className="bg-white shadow-sm rounded-lg p-6 sticky top-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Résumé de la commande
            </h2>

            {/* Lieu de livraison */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu de livraison *
              </label>
              {isLoadingLocations ? (
                <div className="text-sm text-gray-500">Chargement...</div>
              ) : deliveryLocations.length > 0 ? (
                <select
                  value={selectedLocation?.id || ""}
                  onChange={(e) => {
                    const location = deliveryLocations.find(
                      (loc) => loc.id === e.target.value
                    );
                    setSelectedLocation(location || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Sélectionnez un lieu</option>
                  {deliveryLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {formatXOF(location.delivery_fee)}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-red-600">
                  Aucun lieu de livraison disponible
                </div>
              )}
            </div>

            {/* Détails des prix */}
            <div className="flow-root">
              <dl className="-my-4 text-sm divide-y divide-gray-200">
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Sous-total</dt>
                  <dd className="font-medium text-gray-900">
                    {formatXOF(subtotal)}
                  </dd>
                </div>
                
                {totalSavings > 0 && (
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-green-600">Économies prix en gros</dt>
                    <dd className="font-medium text-green-600">
                      -{formatXOF(totalSavings)}
                    </dd>
                  </div>
                )}

                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Frais de livraison</dt>
                  <dd className="font-medium text-gray-900">
                    {selectedLocation
                      ? formatXOF(selectedLocation.delivery_fee)
                      : "---"}
                  </dd>
                </div>
                
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">
                    {formatXOF(totalAmount)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Formulaire client */}
            {showCustomerForm ? (
              <div className="mt-6 space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center text-sm text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Informations de contact
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Votre nom (optionnel)
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Sélecteur de paiement */}
                <PaymentSelector
                  amount={totalAmount}
                  items={items}
                  customerInfo={{
                    phone: phoneNumber,
                    name: customerName
                  }}
                  deliveryInfo={selectedLocation ? {
                    location: selectedLocation.name,
                    fee: selectedLocation.delivery_fee
                  } : undefined}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />

                <button
                  onClick={() => setShowCustomerForm(false)}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  Retour
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  onClick={() => setShowCustomerForm(true)}
                  disabled={!selectedLocation}
                  className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                    !selectedLocation
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-pink-500 hover:bg-pink-600"
                  }`}
                >
                  Procéder au paiement
                </button>
                {!selectedLocation && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Veuillez sélectionner un lieu de livraison
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}