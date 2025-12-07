// components/client/OrderDetailsModal.tsx
import { XCircle, MessageCircle, Trash2, AlertTriangle } from "lucide-react";
import { formatXOF } from "../../../lib/currency";
import { Order, OrderItem } from "../../../models";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmationModal from "../../../ui/ConfirmationModal";

// Configuration des statuts
const ORDER_STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
  shipped: { label: "Expédiée", color: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800" },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Payée", color: "bg-green-100 text-green-800" },
  failed: { label: "Échouée", color: "bg-red-100 text-red-800" },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-800" },
};

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  supportPhone: string;
  onOrderUpdate?: () => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  supportPhone,
  onOrderUpdate,
}: OrderDetailsModalProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen) return null;

  // ✅ Formater la date
  const formatOrderDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Vérifier si la commande peut être annulée
  const canCancelOrder = () => {
    // Les commandes peuvent être annulées si:
    // 1. Le statut est "pending" ou "confirmed"
    // 2. Le paiement n'est pas "paid" OU si payé mais pas encore confirmé par l'admin
    const cancellableStatuses: Order["status"][] = ["pending", "confirmed"];

    return (
      cancellableStatuses.includes(order.status) &&
      (order.payment_status !== "paid" || order.status === "pending")
    );
  };

  // ✅ Annuler la commande
  // ✅ Annuler la commande
  const cancelOrder = async () => {
    try {
      setIsCancelling(true);

      // Vérifier une dernière fois si la commande peut être annulée
      if (!canCancelOrder()) {
        alert(
          "Cette commande ne peut plus être annulée car elle a déjà été traitée."
        );
        return;
      }

      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
          // Si la commande était payée, remettre le statut de paiement à "refunded"
          payment_status:
            order.payment_status === "paid" ? "refunded" : order.payment_status,
        })
        .eq("id", order.id);

      if (error) {
        // Si l'erreur vient de la vue matérielle, on ignore et on continue
        if (error.message.includes("materialized view")) {
          console.warn(
            "Materialized view refresh error (ignored):",
            error.message
          );
          // On continue car la commande a quand même été mise à jour
        } else {
          throw error;
        }
      }

      // Rafraîchir les données
      if (onOrderUpdate) {
        onOrderUpdate();
      }

      setShowCancelConfirm(false);
      onClose();

      // Message de confirmation
      alert("Commande annulée avec succès !");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Erreur lors de l'annulation de la commande");
    } finally {
      setIsCancelling(false);
    }
  };

  // ✅ Ouvrir WhatsApp pour contacter le support
  const contactSupport = () => {
    const message = `Bonjour! Je souhaite avoir des informations sur ma commande #${order.id
      .slice(-8)
      .toUpperCase()}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${supportPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full transform transition-all max-h-[90vh] overflow-hidden">
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Détails de la commande #{order.id.slice(-8).toUpperCase()}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ORDER_STATUS_CONFIG[order.status].color
                    }`}
                  >
                    {ORDER_STATUS_CONFIG[order.status].label}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      PAYMENT_STATUS_CONFIG[order.payment_status].color
                    }`}
                  >
                    {PAYMENT_STATUS_CONFIG[order.payment_status].label}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XCircle className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid gap-6">
                {/* Informations de la commande */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Informations de la commande
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date de commande:</span>
                      <p className="font-medium">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <p className="font-medium">
                        {ORDER_STATUS_CONFIG[order.status].label}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut de paiement:</span>
                      <p className="font-medium">
                        {PAYMENT_STATUS_CONFIG[order.payment_status].label}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Méthode de paiement:
                      </span>
                      <p className="font-medium capitalize">
                        {order.payment_method || "Non spécifié"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Total:</span>
                      <p className="font-medium text-lg">
                        {formatXOF(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Produits */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Produits commandés
                  </h4>
                  <div className="space-y-3">
                    {order.order_items?.map((item: OrderItem) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <img
                          src={
                            item.product?.image_url || "/api/placeholder/80/80"
                          }
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatXOF(item.price)} × {item.quantity}
                          </p>
                          {item.product?.category?.name && (
                            <span className="inline-block mt-1 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                              {item.product.category.name}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatXOF(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adresse de livraison */}
                {order.shipping_address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Adresse de livraison
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm">
                      <p className="font-medium">
                        {order.shipping_address.full_name}
                      </p>
                      <p className="text-gray-600">
                        {order.shipping_address.phone}
                      </p>
                      <p className="text-gray-600">
                        {order.shipping_address.address}
                      </p>
                      <p className="text-gray-600">
                        {order.shipping_address.city}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                  {/* Bouton d'annulation */}
                  {canCancelOrder() && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isCancelling}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isCancelling ? "Annulation..." : "Annuler la commande"}
                    </button>
                  )}

                  {/* Bouton support */}
                  <button
                    onClick={contactSupport}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contacter le support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de confirmation d'annulation */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={cancelOrder}
        title="Annuler la commande"
        // Dans le ConfirmationModal, mettre à jour le message
        message={
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <p className="text-gray-700 mb-2">
              Êtes-vous sûr de vouloir annuler la commande{" "}
              <strong>#{order.id.slice(-8).toUpperCase()}</strong> ?
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {order.payment_status === "paid"
                ? "Le montant payé sera remboursé selon les conditions de votre méthode de paiement."
                : "Cette commande n'a pas encore été payée."}
            </p>
            <p className="text-xs text-gray-500">
              {order.status === "confirmed"
                ? "⚠️ Cette commande a déjà été confirmée, l'annulation nécessitera une validation."
                : "Vous pourrez annuler jusqu'à ce que la commande soit marquée comme expédiée."}
            </p>
          </div>
        }
        confirmText="Confirmer l'annulation"
        cancelText="Conserver la commande"
        variant="danger"
        isLoading={isCancelling}
      />
    </>
  );
}
