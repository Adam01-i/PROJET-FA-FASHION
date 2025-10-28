// components/client/ClientOrders.tsx (extrait modifié)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle,
  //   Truck,
  Home,
  XCircle,
  Search,
  Eye,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { formatXOF } from "../../../lib/currency";
import { useMyOrders } from "../../../hooks/useMyOrders";
import { Order, OrderItem } from "../../../models";
import OrderDetailsModal from "./OrdersDetailsModal";
import { supabase } from "../../../lib/supabaseClient";

// Types pour les configurations de statut
type OrderStatus = Order["status"];
type PaymentStatus = Order["payment_status"];

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmée",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annulée",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  delivered: {
    label: "",
    color: "",
    icon: undefined
  },
  shipped: {
    label: "",
    color: "",
    icon: undefined
  }
};


const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Payée", color: "bg-green-100 text-green-800" },
  failed: { label: "Échouée", color: "bg-red-100 text-red-800" },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-800" },
};

// Fonction séparée pour récupérer le numéro de support
const fetchSupportPhone = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("phone")
      .single();

    if (error) {
      console.error("Error fetching support phone:", error);
      return "221761994984";
    }

    return data?.phone || "221761994984";
  } catch (error) {
    console.error("Error in fetchSupportPhone:", error);
    return "221761994984";
  }
};

export default function ClientOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [supportPhone, setSupportPhone] = useState<string>("221761994984");

  const {
    orders,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    stats,
    formatOrderDate,
    getOrderProgress,
    refetch,
    getSupportPhone, // On garde mais avec fallback
  } = useMyOrders();

  // ✅ Rafraîchir les données après une mise à jour
  const handleOrderUpdate = () => {
    refetch();
  };

  // ✅ Charger le numéro de support au montage du composant
  useEffect(() => {
    const loadSupportPhone = async () => {
      try {
        let phone: string;

        // Essayer d'abord avec la fonction du hook
        if (typeof getSupportPhone === "function") {
          phone = await getSupportPhone();
        } else {
          // Fallback vers la fonction séparée
          phone = await fetchSupportPhone();
        }

        setSupportPhone(phone);
      } catch (err) {
        console.warn("Error loading support phone (non-critical):", err);
        setSupportPhone("221761994984"); // Valeur par défaut sans bloquer l'UI
      }
    };

    loadSupportPhone();
  }, [getSupportPhone]);

  // ✅ Gérer le changement de filtre de statut
  const handleStatusFilterChange = (value: string) => {
    if (value === "all") {
      updateFilters({ status: undefined });
    } else {
      updateFilters({ status: value as OrderStatus });
    }
  };

  // ✅ Gérer le changement de filtre de statut de paiement
  const handlePaymentStatusFilterChange = (value: string) => {
    if (value === "all") {
      updateFilters({ paymentStatus: undefined });
    } else {
      updateFilters({ paymentStatus: value as PaymentStatus });
    }
  };

  // ✅ Ouvrir WhatsApp pour contacter le support avec le numéro dynamique
  const contactSupport = (order: Order) => {
    const message = `Bonjour! Je souhaite avoir des informations sur ma commande #${order.id
      .slice(-8)
      .toUpperCase()}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // Dans la partie d'affichage des erreurs
if (error) {
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="mt-2 text-red-600"></p>
        <div className="mt-4 flex gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

  // ✅ Afficher un écran de connexion si utilisateur non connecté
  if (error?.includes("") || error?.includes("")) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h2> */}
          {/* <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Vous devez être connecté pour accéder à vos commandes.
            Connectez-vous pour voir votre historique de commandes.
          </p> */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            > */}
              {/* <LogIn className="mr-2 h-5 w-5" />
              Se connecter
            </Link> */}
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-red-800">
            Erreur de chargement
          </h3>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-4 flex gap-3 justify-center">
            <button
              onClick={refetch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Réessayer
            </button>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
            <p className="text-gray-600 mt-2">
              Suivez l'état de vos commandes et consultez l'historique
            </p>
          </div>
          <div className="flex gap-3">
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.confirmed}
          </div>
          <div className="text-sm text-gray-600">Confirmées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.cancelled}
          </div>
          <div className="text-sm text-gray-600">Annulées</div>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Filtres avancés
            </h3>
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de commande
              </label>
              <select
                value={filters.status || "all"}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de paiement
              </label>
              <select
                value={filters.paymentStatus || "all"}
                onChange={(e) =>
                  handlePaymentStatusFilterChange(e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="failed">Échouée</option>
                <option value="refunded">Remboursée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.searchQuery || ""}
                  onChange={(e) =>
                    updateFilters({ searchQuery: e.target.value })
                  }
                  placeholder="N° commande, produit..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-xl font-medium text-gray-900">
            {filters.status !== "all" || filters.searchQuery
              ? "Aucune commande trouvée"
              : "Aucune commande"}
          </h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            {filters.status !== "all" || filters.searchQuery
              ? "Aucune commande ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              : "Vous n'avez pas encore passé de commande. Découvrez nos produits et faites votre premier achat !"}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {(filters.status !== "all" || filters.searchQuery) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Voir toutes les commandes
              </button>
            )}
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Home className="mr-2 h-4 w-4" />
              Découvrir nos produits
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = ORDER_STATUS_CONFIG[order.status].icon;
            const progress = getOrderProgress(order.status);
            const totalItems =
              order.order_items?.reduce(
                (sum, item) => sum + item.quantity,
                0
              ) || 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* En-tête de la commande */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          ORDER_STATUS_CONFIG[order.status].color
                        }`}
                      >
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Commande #{order.id.slice(-8).toUpperCase()}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              PAYMENT_STATUS_CONFIG[order.payment_status].color
                            }`}
                          >
                            {PAYMENT_STATUS_CONFIG[order.payment_status].label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {formatOrderDate(order.created_at)}
                          </span>
                          <span>
                            • {totalItems} article{totalItems > 1 ? "s" : ""}
                          </span>
                          <span>• {formatXOF(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-900">
                        {formatXOF(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Étape {progress.currentStep} sur {progress.totalSteps}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {ORDER_STATUS_CONFIG[order.status].label}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {progress.steps.map((step, index) => (
                      <div
                        key={step.status}
                        className="flex items-center flex-1"
                      >
                        <div
                          className={`w-3 h-3 rounded-full border-2 ${
                            step.completed
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white border-gray-300"
                          }`}
                        />
                        {index < progress.steps.length - 1 && (
                          <div
                            className={`flex-1 h-1 ${
                              progress.steps[index + 1].completed
                                ? "bg-indigo-600"
                                : "bg-gray-300"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Produits de la commande */}
                <div className="p-6">
                  <div className="grid gap-3 mb-4">
                    {order.order_items?.slice(0, 3).map((item: OrderItem) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={
                            item.product?.image_url || "/api/placeholder/80/80"
                          }
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.product?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatXOF(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatXOF(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.order_items && order.order_items.length > 3 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">
                          + {order.order_items.length - 3} autre
                          {order.order_items.length - 3 > 1 ? "s" : ""} article
                          {order.order_items.length - 3 > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => contactSupport(order)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Support
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de détails de commande */}
      <OrderDetailsModal
        order={selectedOrder!}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        supportPhone={supportPhone}
        onOrderUpdate={handleOrderUpdate}
      />
    </div>
  );
}
