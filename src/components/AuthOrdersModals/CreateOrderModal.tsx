// components/AuthOrdersModals/CreateOrderModal.tsx
import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Search,
  User,
  MapPin,
  ShoppingBag,
  Loader,
  Percent,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useToastContext } from "../../hooks/ToastProvider";
import { Product, DeliveryLocation } from "../../models";
import { calculateCartWithWholesale } from "../../services/pricingService";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock_quantity: number;
  image_url?: string | null;
  wholesalePrice?: number; // AJOUT: Prix avec remise en gros
  appliedTier?: { // AJOUT: Information sur le seuil appliqué
    min_quantity: number;
    wholesale_price: number;
  };
  savings?: number; // AJOUT: Économies pour cet article
  isWholesaleApplied?: boolean; // AJOUT: Si le prix en gros est appliqué
}

interface CreateOrderModalProps {
  onClose: () => void;
  onOrderCreated: () => void;
  assistantId?: string;
  assistantName?: string;
  createOrderFunction: (orderData: {
    customer_phone: string;
    customer_name?: string;
    subtotal_amount: number;
    delivery_fee: number;
    total_amount: number;
    delivery_location_id: string;
    delivery_location_name: string;
    order_items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
    assistant_id?: string;
    assistant_name?: string;
  }) => Promise<{ id: string }>;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function CreateOrderModal({
  onClose,
  onOrderCreated,
  assistantId,
  assistantName,
  createOrderFunction,
}: CreateOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<
    DeliveryLocation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedLocation, setSelectedLocation] =
    useState<DeliveryLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { success, error: toastError } = useToastContext();

  // AJOUT: État pour les calculs de prix en gros
  const [, setCartWithWholesale] = useState<{
    items: CartItem[];
    subtotal: number;
    totalWholesaleSavings: number;
  } | null>(null);

  // Charger les produits et les lieux de livraison
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Charger les produits
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("is_public", true)
          .gt("stock_quantity", 0)
          .order("name");

        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Charger les lieux de livraison
        setIsLoadingLocations(true);
        const { data: locationsData, error: locationsError } = await supabase
          .from("delivery_locations")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (locationsError) throw locationsError;
        setDeliveryLocations(locationsData || []);

        // Sélectionner le premier lieu par défaut
        if (locationsData && locationsData.length > 0) {
          setSelectedLocation(locationsData[0]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toastError("Erreur", "Impossible de charger les données");
      } finally {
        setIsLoading(false);
        setIsLoadingLocations(false);
      }
    };

    loadData();
  }, [toastError]);

  // AJOUT: Effet pour calculer les prix en gros quand le panier change
  useEffect(() => {
    const calculateWholesalePrices = async () => {
      if (cart.length > 0) {
        // Convertissez le panier au format attendu par calculateCartWithWholesale
        const formattedCart = cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image_url || '',
          quantity: item.quantity,
          stock_quantity: item.stock_quantity
        }));

        const result = await calculateCartWithWholesale(formattedCart);
        
        // Met à jour le panier avec les prix en gros
        setCart(prevCart => 
          prevCart.map(item => {
            const wholesaleItem = result.items.find(wi => wi.id === item.id);
            return wholesaleItem ? {
              ...item,
              wholesalePrice: wholesaleItem.wholesalePrice,
              appliedTier: wholesaleItem.appliedTier,
              savings: (wholesaleItem as any).savings,
              isWholesaleApplied: (wholesaleItem as any).isWholesaleApplied ?? false
            } : item;
          })
        );

        setCartWithWholesale(result);
      } else {
        setCartWithWholesale(null);
      }
    };

    calculateWholesalePrices();
  }, [cart]);

  // AJOUT: Fonction utilitaire pour calculer le prix d'un produit
  async function calculateProductPrice(
    productId: string,
    quantity: number
  ): Promise<{
    finalPrice: number;
    priceType: 'regular' | 'wholesale';
    appliedTier?: {
      min_quantity: number;
      wholesale_price: number;
    };
  }> {
    try {
      const { data, error } = await supabase.rpc(
        'get_product_pricing_info',
        {
          p_product_id: productId,
          p_quantity: quantity
        }
      );

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        return {
          finalPrice: result.final_price,
          priceType: result.price_type,
          appliedTier: result.min_quantity_needed ? {
            min_quantity: result.min_quantity_needed,
            wholesale_price: result.final_price,
          } : undefined,
        };
      }

      // Fallback: récupérer le prix régulier
      const { data: productData } = await supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single();

      return {
        finalPrice: productData?.price || 0,
        priceType: 'regular'
      };
    } catch (error) {
      console.error('Error calculating price:', error);
      return {
        finalPrice: 0,
        priceType: 'regular'
      };
    }
  }

  // Filtrer les produits
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // AJOUT: Gestion du panier avec calcul des prix en gros
  const addToCart = async (product: Product) => {
    // Vérifier le stock
    if (product.stock_quantity === 0) {
      toastError("Stock épuisé", "Ce produit n'est plus disponible");
      return;
    }

    // Calculer le prix avec gros pour 1 unité
    const priceInfo = await calculateProductPrice(product.id, 1);
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toastError(
            "Stock insuffisant",
            "Quantité maximale disponible atteinte"
          );
          return prevCart;
        }
        
        // Met à jour la quantité (les prix seront recalculés par l'effet)
        return prevCart.map((item) =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url,
            wholesalePrice: priceInfo.finalPrice,
            appliedTier: priceInfo.appliedTier,
            isWholesaleApplied: priceInfo.priceType === 'wholesale',
            savings: priceInfo.priceType === 'wholesale' 
              ? product.price - priceInfo.finalPrice 
              : 0
          },
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          if (newQuantity > item.stock_quantity) {
            toastError(
              "Stock insuffisant",
              "Quantité maximale disponible atteinte"
            );
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // AJOUT: Calculs avec prise en compte des prix en gros
  const displayItems = cart; // Les articles avec prix en gros déjà calculés

  // Calcul du sous-total avec prix en gros
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.wholesalePrice || item.price) * item.quantity,
    0
  );

  // Calcul des économies totales
  const totalSavings = cart.reduce(
    (sum, item) => sum + ((item.savings || 0) * item.quantity),
    0
  );

  const deliveryFee = selectedLocation?.delivery_fee || 0;
  const total = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Validation du téléphone
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, "");
    const phoneRegex = /^(77|76|70|75|78)[0-9]{7}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Formatage du téléphone
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

    setCustomerPhone(formatted.slice(0, 12));
  };

  // Création de la commande avec livraison
  const createOrder = async (): Promise<{ id: string }> => {
    if (!customerPhone.trim()) {
      throw new Error("Le numéro de téléphone est obligatoire");
    }

    if (!validatePhone(customerPhone)) {
      throw new Error(
        "Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)"
      );
    }

    if (cart.length === 0) {
      throw new Error("Le panier est vide");
    }

    if (!selectedLocation) {
      throw new Error("Veuillez sélectionner un lieu de livraison");
    }

    // AJOUT: Préparer les données des articles avec prix en gros
    const orderItemsData = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.wholesalePrice || item.price, // Utilise le prix en gros si disponible
    }));

    const cleanPhone = customerPhone.replace(/\s/g, "");

    // Utiliser la fonction passée en prop
    return await createOrderFunction({
      customer_phone: cleanPhone,
      customer_name: customerName.trim() || undefined,
      subtotal_amount: subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
      delivery_location_id: selectedLocation.id,
      delivery_location_name: selectedLocation.name,
      order_items: orderItemsData,
      assistant_id: assistantId || undefined,
      assistant_name: assistantName || undefined,
    });
  };

  const handleCreateOrder = async () => {
    try {
      setIsCreating(true);

      // Créer la commande dans la base de données
      const order = await createOrder();

      // Succès
      success(
        "Commande créée",
        `Commande #${order.id.slice(0, 8)} créée avec succès`
      );

      // Réinitialiser et fermer
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      onOrderCreated();
    } catch (error) {
      console.error("Error creating order:", error);
      toastError(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la création de la commande."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const canCreateOrder =
    cart.length > 0 &&
    customerPhone.trim() &&
    validatePhone(customerPhone) &&
    selectedLocation;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Créer une commande
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assistant: {assistantName || "Non spécifié"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Section Produits */}
          <div className="border-r border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="h-6 w-6 animate-spin text-pink-500" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-full h-full text-gray-400 p-2" />
                        )}
                      </div>

                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatXOF(product.price)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Stock: {product.stock_quantity}
                        </p>
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock_quantity === 0}
                        className={`ml-2 px-3 py-1 text-sm rounded-md ${
                          product.stock_quantity === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-pink-500 text-white hover:bg-pink-600"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section Panier et Informations client */}
          <div className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Panier ({itemCount} article{itemCount > 1 ? "s" : ""})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Articles du panier */}
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun article dans le panier</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayItems.map((item) => {
                    const itemPrice = item.wholesalePrice || item.price;
                    // const itemTotal = itemPrice * item.quantity;
                    // const regularTotal = item.price * item.quantity;
                    const savings = item.savings || 0;
                    const totalSavingsForItem = savings * item.quantity;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-full h-full text-gray-400 p-1" />
                          )}
                        </div>

                        <div className="ml-3 flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          
                          {/* AJOUT: Affichage du prix et économies */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-green-600">
                              {formatXOF(itemPrice)} × {item.quantity}
                            </span>
                            
                            {item.isWholesaleApplied && savings > 0 && (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  {formatXOF(item.price)}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                  -{formatXOF(totalSavingsForItem)}
                                </span>
                              </>
                            )}
                          </div>

                          {/* AJOUT: Détail du seuil si prix en gros */}
                          {item.appliedTier && (
                            <p className="text-xs text-blue-600 mt-1">
                              <Percent className="inline h-3 w-3 mr-1" />
                              Prix en gros (min: {item.appliedTier.min_quantity} unités)
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="p-1 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3 text-gray-600" />
                            </button>
                            <span className="px-2 py-1 text-sm text-gray-900 min-w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="p-1 hover:bg-gray-100"
                              disabled={item.quantity >= item.stock_quantity}
                            >
                              <Plus className="h-3 w-3 text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sélection du lieu de livraison */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-700 mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  Lieu de livraison
                </div>

                {isLoadingLocations ? (
                  <div className="text-sm text-blue-600">
                    Chargement des lieux de livraison...
                  </div>
                ) : deliveryLocations.length > 0 ? (
                  <select
                    value={selectedLocation?.id || ""}
                    onChange={(e) => {
                      const location = deliveryLocations.find(
                        (loc) => loc.id === e.target.value
                      );
                      setSelectedLocation(location || null);
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Sélectionnez un lieu de livraison</option>
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

                {selectedLocation && (
                  <p className="text-xs text-blue-600 mt-2">
                    Livraison à {selectedLocation.name} - Frais:{" "}
                    {formatXOF(selectedLocation.delivery_fee)}
                  </p>
                )}
              </div>

              {/* Informations client */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  Informations du client
                </div>

                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom du client (optionnel)
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nom du client"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="customerPhone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 77, 76, 70, 75 ou 78
                  </p>
                </div>
              </div>

              {/* AJOUT: Résumé avec économies */}
              {cart.length > 0 && (
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flow-root">
                    <dl className="-my-3 text-sm divide-y divide-gray-200">
                      <div className="py-2 flex items-center justify-between">
                        <dt className="text-gray-600">Sous-total</dt>
                        <dd className="font-medium text-gray-900">
                          {formatXOF(subtotal)}
                        </dd>
                      </div>
                      
                      {totalSavings > 0 && (
                        <div className="py-2 flex items-center justify-between">
                          <dt className="text-green-600">Économies prix en gros</dt>
                          <dd className="font-medium text-green-600">
                            -{formatXOF(totalSavings)}
                          </dd>
                        </div>
                      )}
                      
                      <div className="py-2 flex items-center justify-between">
                        <dt className="text-gray-600">Frais de livraison</dt>
                        <dd className="font-medium text-gray-900">
                          {selectedLocation ? formatXOF(deliveryFee) : "---"}
                        </dd>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <dt className="text-base font-medium text-gray-900">
                          Total
                        </dt>
                        <dd className="text-base font-medium text-gray-900">
                          {selectedLocation
                            ? formatXOF(total)
                            : formatXOF(subtotal)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="px-3 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Vider le panier
                    </button>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={!canCreateOrder || isCreating}
                    className={`px-6 py-2 text-sm font-medium rounded-md ${
                      !canCreateOrder || isCreating
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-pink-500 text-white hover:bg-pink-600"
                    }`}
                  >
                    {isCreating ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      `Créer la commande (${formatXOF(total)})`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}