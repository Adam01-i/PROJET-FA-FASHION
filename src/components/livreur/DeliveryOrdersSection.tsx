import { useEffect, useState } from "react";
import { Truck, PackageCheck, MapPin, Phone, User, Clock } from "lucide-react";
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

  useEffect(() => {
    const getUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setCurrentUserName(profile?.full_name);
      }
    };
    getUserInfo();
  }, []);

  // Filtrer les commandes selon le statut et la recherche
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);

    if (showDeliveredOnly) {
      return matchesSearch && order.status === "delivered";
    } else {
      return (
        matchesSearch &&
        (order.status === "confirmed" || order.status === "shipped")
      );
    }
  });

  const handleMarkAsDelivered = async (): Promise<void> => {
    if (!orderToMark || !currentUserId || !currentUserName) return;

    setIsConfirming(true);
    try {
      // Utiliser la fonction principale avec les vérifications de rôle
      await updateOrderStatus(
        orderToMark.id,
        "delivered",
        currentUserId,
        "livreur",
        currentUserName
      );

      // Ou utiliser la fonction dédiée (au choix)
      // await markOrderAsDelivered(orderToMark.id, currentUserId, currentUserName);

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
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusDisplayName = (status: Order["status"]): string => {
    const statusMap: Record<Order["status"], string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      shipped: "En cours de livraison",
      delivered: "Livrée",
      cancelled: "Annulée",
    };
    return statusMap[status];
  };

  // Statistiques
  const ordersToDeliver = orders.filter(
    (o) => o.status === "confirmed" || o.status === "shipped"
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {showDeliveredOnly ? "Commandes Livrées" : "Commandes à Livrer"}
        </h1>
        <p className="text-gray-600 mt-1">
          {showDeliveredOnly
            ? "Historique des commandes livrées"
            : "Commandes en attente de livraison"}
        </p>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {showDeliveredOnly ? "Total Livrées" : "À Livrer"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {showDeliveredOnly ? deliveredOrders : ordersToDeliver}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              {showDeliveredOnly ? (
                <PackageCheck className="h-6 w-6 text-green-600" />
              ) : (
                <Truck className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              Aucune commande {showDeliveredOnly ? "livrée" : "à livrer"}
            </p>
            <p className="text-gray-600 mt-1">
              {searchTerm
                ? "Aucune commande ne correspond à votre recherche"
                : showDeliveredOnly
                ? "Aucune commande livrée pour le moment"
                : "Toutes les commandes sont livrées !"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Commande #{order.id.slice(0, 8)}
                    </h3>
                    <span
                      className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusDisplayName(order.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {/* Informations client */}
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer_name || "Non spécifié"}
                        </p>
                        {order.customer_phone && (
                          <p className="text-gray-600 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.customer_phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Lieu de livraison */}
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.delivery_location_name || "Lieu non spécifié"}
                        </p>
                        <p className="text-gray-600">
                          Frais: {formatXOF(order.delivery_fee || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Montant */}
                    <div className="flex items-center">
                      <p className="text-gray-600">Total:</p>
                      <p className="ml-2 font-semibold text-gray-900">
                        {formatXOF(order.total_amount)}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <p className="text-gray-600">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Voir les détails
                </button>

                {!showDeliveredOnly &&
                  (order.status === "confirmed" ||
                    order.status === "shipped") && (
                    <button
                      onClick={() => setOrderToMark(order)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center"
                    >
                      <PackageCheck className="h-4 w-4 mr-2" />
                      Marquer comme livrée
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmation de livraison */}
      <ConfirmationModal
        isOpen={!!orderToMark}
        onClose={() => setOrderToMark(null)}
        onConfirm={handleMarkAsDelivered}
        title="Confirmer la livraison"
        message={
          orderToMark ? (
            <div className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir marquer cette commande comme livrée ?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">
                  Commande #{orderToMark.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-600">
                  Client: {orderToMark.customer_name || "Non spécifié"}
                </p>
                <p className="text-sm text-gray-600">
                  Lieu: {orderToMark.delivery_location_name || "Non spécifié"}
                </p>
              </div>
              <p className="text-sm text-red-600 font-medium">
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

      {/* Modal de détails de commande */}
      {selectedOrder && (
        <DeliveryOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onMarkAsDelivered={(order) => setOrderToMark(order)}
          canMarkAsDelivered={!showDeliveredOnly}
        />
      )}
    </>
  );
}
