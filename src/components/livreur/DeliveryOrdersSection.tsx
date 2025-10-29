import { useEffect, useState } from "react";
import {
  Truck,
  PackageCheck,
  MapPin,
  Phone,
  User,
  Filter,
  Calendar,
  DollarSign,
  ChevronDown,
  Users,
} from "lucide-react";
import { Order } from "../../models";
import { useOrders } from "../../hooks/useOrders";
import { useToastContext } from "../../hooks/ToastProvider";
import { supabase } from "../../lib/supabaseClient";
import ConfirmationModal from "../../ui/ConfirmationModal";
import DeliveryOrderDetailsModal from "./DeliveryOrderDetailsModal";

interface DeliveryOrdersSectionProps {
  searchTerm: string;
  showDeliveredOnly?: boolean;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function DeliveryOrdersSection({
  searchTerm,
  showDeliveredOnly = false,
}: DeliveryOrdersSectionProps) {
  const { orders, updateOrderStatus, refetch } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToMark, setOrderToMark] = useState<Order | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { success, error: toastError } = useToastContext();
  const [currentUserId, setCurrentUserId] = useState<string>();
  const [currentUserName, setCurrentUserName] = useState<string>();
  const [currentUserRole, setCurrentUserRole] = useState<string>();

  // États pour les filtres
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customMonth, setCustomMonth] = useState<string>("");
  const [customYear, setCustomYear] = useState<string>("");
  const [deliveryManFilter, setDeliveryManFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Données pour les filtres
  const [deliveryMen, setDeliveryMen] = useState<string[]>([]);
  const [deliveryLocations, setDeliveryLocations] = useState<string[]>([]);

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        setCurrentUserName(profile?.full_name);
        setCurrentUserRole(profile?.role);
      }
    };
    getUserInfo();
  }, []);

  // Récupérer la liste des livreurs et lieux de livraison
  useEffect(() => {
    const fetchFilterData = () => {
      // Livreurs uniques
      const uniqueDeliveryMen = Array.from(
        new Set(
          orders
            .filter((order) => order.delivered_by_name)
            .map((order) => order.delivered_by_name)
        )
      ).filter(Boolean) as string[];

      // Lieux de livraison uniques
      const uniqueLocations = Array.from(
        new Set(
          orders
            .filter((order) => order.delivery_location_name)
            .map((order) => order.delivery_location_name)
        )
      ).filter(Boolean) as string[];

      setDeliveryMen(uniqueDeliveryMen);
      setDeliveryLocations(uniqueLocations);
    };

    fetchFilterData();
  }, [orders]);

  const canMarkAsDelivered =
    currentUserRole &&
    ["livreur", "admin", "assistant"].includes(currentUserRole);
  const isAdmin = currentUserRole === "admin";

  // Fonction de filtrage avancée
  const filteredOrders = orders.filter((order) => {
    // Filtre de recherche
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);

    // Filtre principal (livrées vs à livrer)
    const matchesMainFilter = showDeliveredOnly
      ? order.status === "delivered"
      : order.status === "confirmed" || order.status === "shipped"; // ← AJOUTER shipped

    // Filtre par livreur (seulement pour l'admin et les commandes livrées)
    const matchesDeliveryManFilter =
      deliveryManFilter === "all" ||
      (showDeliveredOnly && order.delivered_by_name === deliveryManFilter) ||
      (!showDeliveredOnly && deliveryManFilter === "all");

    // Filtre par lieu de livraison
    const matchesLocationFilter =
      locationFilter === "all" ||
      order.delivery_location_name === locationFilter;

    // Filtre de date avancé
    const matchesDateFilter = (() => {
      if (dateFilter === "all") return true;

      const orderDate = new Date(order.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      switch (dateFilter) {
        case "today":
          return orderDate.toDateString() === today.toDateString();
        case "yesterday":
          return orderDate.toDateString() === yesterday.toDateString();
        case "week": {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        }
        case "custom": {
          if (!customMonth || !customYear) return true;
          const filterDate = new Date(
            parseInt(customYear),
            parseInt(customMonth) - 1
          );
          return (
            orderDate.getMonth() === filterDate.getMonth() &&
            orderDate.getFullYear() === filterDate.getFullYear()
          );
        }
        default:
          return true;
      }
    })();

    return (
      matchesSearch &&
      matchesMainFilter &&
      matchesDeliveryManFilter &&
      matchesLocationFilter &&
      matchesDateFilter
    );
  });

  const handleMarkAsDelivered = async (): Promise<void> => {
    if (!orderToMark || !currentUserId || !currentUserName) return;

    setIsConfirming(true);
    try {
      await updateOrderStatus(
        orderToMark.id,
        "delivered",
        currentUserId,
        "livreur",
        currentUserName
      );
      success(
        "Commande livrée",
        "La commande a été marquée comme livrée avec succès"
      );
      setOrderToMark(null);
      refetch();
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      toastError(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour du statut"
      );
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusColor = (status: Order["status"]): string => {
    switch (status) {
      case "confirmed":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
      case "delivered":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusDisplayName = (status: Order["status"]): string => {
    const statusMap: Record<Order["status"], string> = {
      pending: "⏳ En attente",
      confirmed: "✅ Confirmée",
      delivered: "📦 Livrée",
      cancelled: "❌ Annulée",
      shipped: "",
    };
    return statusMap[status];
  };

  // Générer les options d'années et mois
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Janvier" },
    { value: "2", label: "Février" },
    { value: "3", label: "Mars" },
    { value: "4", label: "Avril" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juin" },
    { value: "7", label: "Juillet" },
    { value: "8", label: "Août" },
    { value: "9", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ];

  // Statistiques
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {showDeliveredOnly
                ? "📦 Commandes Livrées"
                : "🚚 Commandes à Livrer"}
            </h1>
            <p className="text-blue-100 mt-1">
              {showDeliveredOnly
                ? "Historique des commandes livrées"
                : "Commandes confirmées en attente de livraison"}
              {deliveryManFilter !== "all" &&
                ` - Livreur: ${deliveryManFilter}`}
              {locationFilter !== "all" && ` - Lieu: ${locationFilter}`}
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredOrders.length}</div>
              <div className="text-blue-200 text-sm">Commandes</div>
            </div>
            {!showDeliveredOnly ? (
              <>
                <div className="w-px h-8 bg-blue-500/50"></div>
                <div className="text-center">
                  <div className="text-xl font-bold">{confirmedOrders}</div>
                  <div className="text-blue-200 text-sm">À livrer</div>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-8 bg-blue-500/50"></div>
                <div className="text-center">
                  <div className="text-xl font-bold">{deliveredOrders}</div>
                  <div className="text-blue-200 text-sm">Livrées</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Barre de filtres avancée */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
              <ChevronDown
                className={`h-4 w-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFilters && (
              <div className="flex flex-wrap gap-3">
                {/* Filtre date */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="yesterday">Hier</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="custom">Mois/Année spécifique</option>
                </select>

                {/* Sélection mois/année pour filtre custom */}
                {dateFilter === "custom" && (
                  <>
                    <select
                      value={customMonth}
                      onChange={(e) => setCustomMonth(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Mois</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={customYear}
                      onChange={(e) => setCustomYear(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Année</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {/* Filtre par livreur (seulement pour admin et commandes livrées) */}
                {isAdmin && showDeliveredOnly && (
                  <select
                    value={deliveryManFilter}
                    onChange={(e) => setDeliveryManFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tous les livreurs</option>
                    {deliveryMen.map((deliveryMan) => (
                      <option key={deliveryMan} value={deliveryMan}>
                        {deliveryMan}
                      </option>
                    ))}
                  </select>
                )}

                {/* Filtre par lieu de livraison */}
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les lieux</option>
                  {deliveryLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {filteredOrders.length} commande
            {filteredOrders.length > 1 ? "s" : ""} trouvée
            {filteredOrders.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              Aucune commande {showDeliveredOnly ? "livrée" : "à livrer"}
            </p>
            <p className="text-gray-600 mt-1">
              {searchTerm ||
              dateFilter !== "all" ||
              deliveryManFilter !== "all" ||
              locationFilter !== "all"
                ? "Aucune commande ne correspond à vos critères de filtrage"
                : showDeliveredOnly
                ? "Aucune commande livrée pour le moment"
                : "Toutes les commandes sont livrées !"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Informations principales */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Commande #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        {/* Afficher le livreur pour les commandes livrées */}
                        {showDeliveredOnly && order.delivered_by_name && (
                          <p className="text-sm text-green-600 mt-1 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Livré par: {order.delivered_by_name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusDisplayName(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Client */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {order.customer_name || "Non spécifié"}
                          </p>
                          {order.customer_phone && (
                            <p className="text-gray-600 text-sm flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {order.customer_phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Livraison */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {order.delivery_location_name || "Non spécifié"}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {formatXOF(order.delivery_fee || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Montant */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            Total
                          </p>
                          <p className="text-gray-600 text-sm font-semibold">
                            {formatXOF(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 lg:items-end">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      Voir détails
                    </button>

                    {!showDeliveredOnly && order.status === "confirmed" && (
                      <button
                        onClick={() => setOrderToMark(order)}
                        disabled={!canMarkAsDelivered}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center ${
                          canMarkAsDelivered
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        title={
                          !canMarkAsDelivered
                            ? "Seuls les livreurs, assistants et administrateurs peuvent marquer une commande comme livrée"
                            : ""
                        }
                      >
                        <PackageCheck className="h-4 w-4 mr-2" />
                        {canMarkAsDelivered ? "Marquer livrée" : "Non autorisé"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={!!orderToMark}
        onClose={() => setOrderToMark(null)}
        onConfirm={handleMarkAsDelivered}
        title="Confirmer la livraison"
        message={
          orderToMark ? (
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir marquer cette commande comme livrée ?
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-900">
                  Commande #{orderToMark.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Client: {orderToMark.customer_name || "Non spécifié"}
                </p>
                <p className="text-sm text-gray-600">
                  Lieu: {orderToMark.delivery_location_name || "Non spécifié"}
                </p>
                <p className="text-sm font-medium text-blue-600 mt-2">
                  Total: {formatXOF(orderToMark.total_amount)}
                </p>
              </div>
              <p className="text-sm text-red-600 font-medium flex items-center">
                ⚠️ Cette action est irréversible
              </p>
            </div>
          ) : (
            ""
          )
        }
        confirmText="Confirmer la livraison"
        variant="primary"
        isLoading={isConfirming}
      />

      {selectedOrder && (
        <DeliveryOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onMarkAsDelivered={(order) => setOrderToMark(order)}
          canMarkAsDelivered={Boolean(!showDeliveredOnly && canMarkAsDelivered)}
        />
      )}
    </div>
  );
}
