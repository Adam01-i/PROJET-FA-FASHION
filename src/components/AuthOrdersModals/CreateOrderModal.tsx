// components/AuthOrdersModals/CreateOrderModal.tsx
import { useState, useEffect } from "react";
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  User, 
//   Phone, 
  ShoppingBag,
  Loader 
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useToastContext } from "../../hooks/ToastProvider";
import { Product } from "../../models";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock_quantity: number;
  image_url?: string | null;
}

interface CreateOrderModalProps {
  onClose: () => void;
  onOrderCreated: () => void;
  assistantId?: string;
  assistantName?: string;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function CreateOrderModal({ 
  onClose, 
  onOrderCreated, 
  assistantId, 
  assistantName 
}: CreateOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { success, error: toastError } = useToastContext();

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_public", true) // Utiliser is_public au lieu de is_active
          .gt("stock_quantity", 0) // Seulement les produits en stock
          .order("name");

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error loading products:", error);
        toastError("Erreur", "Impossible de charger les produits");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [toastError]);

  // Filtrer les produits
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion du panier
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toastError("Stock insuffisant", "Quantité maximale disponible atteinte");
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stock_quantity === 0) {
          toastError("Stock épuisé", "Ce produit n'est plus disponible");
          return prevCart;
        }
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock_quantity: product.stock_quantity,
          image_url: product.image_url
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.id === productId) {
          if (newQuantity > item.stock_quantity) {
            toastError("Stock insuffisant", "Quantité maximale disponible atteinte");
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

  // Calculs
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Validation du téléphone
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^(77|76|70|75|78)[0-9]{7}$/;
    return phoneRegex.test(cleanPhone);
  };

  // Formatage du téléphone
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
    
    setCustomerPhone(formatted.slice(0, 12));
  };

  // Création de la commande
  const createOrder = async (): Promise<{id: string}> => {
    if (!customerPhone.trim()) {
      throw new Error('Le numéro de téléphone est obligatoire');
    }

    if (!validatePhone(customerPhone)) {
      throw new Error('Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)');
    }

    if (cart.length === 0) {
      throw new Error('Le panier est vide');
    }

    // Préparer les données des articles
    const orderItemsData = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));

    const cleanPhone = customerPhone.replace(/\s/g, '');

    // Utiliser RPC pour créer la commande avec assistant
    const { data, error } = await supabase.rpc('create_assistant_order', {
      customer_phone: cleanPhone,
      customer_name: customerName.trim() || null,
      total_amount: total,
      order_items: orderItemsData,
      assistant_id: assistantId || null,
      assistant_name: assistantName || null
    });

    if (error) {
      console.error('RPC Error:', error);
      throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
    }

    return { id: data };
  };

  const handleCreateOrder = async () => {
    try {
      setIsCreating(true);
      
      // Créer la commande dans la base de données
      const order = await createOrder();
      
      // Succès
      success("Commande créée", `Commande #${order.id.slice(0, 8)} créée avec succès`);
      
      // Réinitialiser et fermer
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      onOrderCreated();
      
    } catch (error) {
      console.error('Error creating order:', error);
      toastError(
        "Erreur", 
        error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la commande.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const canCreateOrder = cart.length > 0 && customerPhone.trim() && validatePhone(customerPhone);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Créer une commande</h2>
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
                Panier ({itemCount} article{itemCount > 1 ? 's' : ''})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Articles du panier */}
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun article dans le panier</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
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
                        <p className="text-sm text-gray-500">
                          {formatXOF(item.price)} × {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3 text-gray-600" />
                          </button>
                          <span className="px-2 py-1 text-sm text-gray-900 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                  ))}
                </div>
              )}

              {/* Informations client */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  Informations du client
                </div>
                
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du client (optionnel)
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nom du client"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 77, 76, 70, 75 ou 78
                  </p>
                </div>
              </div>

              {/* Résumé */}
              {cart.length > 0 && (
                <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flow-root">
                    <dl className="-my-3 text-sm divide-y divide-gray-200">
                      <div className="py-2 flex items-center justify-between">
                        <dt className="text-gray-600">Sous-total</dt>
                        <dd className="font-medium text-gray-900">{formatXOF(total)}</dd>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <dt className="text-gray-600">Livraison</dt>
                        <dd className="font-medium text-gray-900">Gratuite</dd>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <dt className="text-base font-medium text-gray-900">Total</dt>
                        <dd className="text-base font-medium text-gray-900">{formatXOF(total)}</dd>
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
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