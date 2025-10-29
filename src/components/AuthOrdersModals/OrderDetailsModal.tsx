import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Phone,
  Package,
  DollarSign,
  MessageCircle,
  Download,
  X,
  Printer,
  Clock,
  Truck,
} from "lucide-react";
import { Order } from "../../models";
import {
  generateInvoicePDF,
  generateAdvancedInvoicePDF,
} from "../../utils/invoiceGenerator";
import { useInvoiceSettings } from "../../hooks/useInvoiceSettings";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: Order["status"]) => void;
  onPaymentStatusChange: (
    orderId: string,
    paymentStatus: Order["payment_status"]
  ) => void;
  onPaymentProofUpload: (orderId: string, file: File) => void;
  onSendWhatsApp: (order: Order) => void;
  isUploadingProof: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  onOrderUpdate?: () => void;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
}

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
  onPaymentProofUpload,
  // onSendWhatsApp,
  isUploadingProof,
  currentUserRole,
  onOrderUpdate,
}: OrderDetailsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    invoiceSettings,
    loading: invoiceSettingsLoading,
    error: invoiceSettingsError,
  } = useInvoiceSettings();

  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  // Fonction pour rafraîchir les données de la commande
  const refreshOrderData = async () => {
    if (!onOrderUpdate) return;

    setIsRefreshing(true);
    try {
      await onOrderUpdate();
      setTimeout(() => setIsRefreshing(false), 500);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      setIsRefreshing(false);
    }
  };

  // Modifiez les handlers pour inclure le rafraîchissement
  const handleStatusChange = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      await onStatusChange(orderId, status);
      await refreshOrderData();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handlePaymentStatusChange = async (
    orderId: string,
    paymentStatus: Order["payment_status"]
  ) => {
    try {
      await onPaymentStatusChange(orderId, paymentStatus);
      await refreshOrderData();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handlePaymentProofUpload = async (orderId: string, file: File) => {
    try {
      await onPaymentProofUpload(orderId, file);
      setTimeout(() => refreshOrderData(), 1000);
    } catch (error) {
      console.error("Error uploading payment proof:", error);
    }
  };

  const getStatusColor = (status: Order["status"]): string => {
    switch (status) {
      case "confirmed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPaymentStatusColor = (status: Order["payment_status"]): string => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getStatusDisplayName = (status: Order["status"]): string => {
    const statusMap: Record<Order["status"], string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      cancelled: "Annulée",
      delivered: "Livrée",
      shipped: "",
    };
    return statusMap[status];
  };

  const getPaymentStatusDisplayName = (
    status: Order["payment_status"]
  ): string => {
    const statusMap: Record<Order["payment_status"], string> = {
      pending: "En attente",
      paid: "Payée",
      failed: "Échoué",
      refunded: "Remboursée",
    };
    return statusMap[status];
  };

  // const getPaymentMethodDisplayName = (method?: string): string => {
  //   const methodMap: Record<string, string> = {
  //     wave: "Wave",
  //     orange_money: "Orange Money",
  //     mobile_money: "Mobile Money",
  //     credit_card: "Carte de crédit",
  //     cash: "Espèces",
  //   };
  //   return method ? methodMap[method] || method : "Non spécifié";
  // };

  const handlePrintInvoice = (): void => {
    if (invoiceSettingsLoading) {
      console.warn("Paramètres de facturation pas encore chargés");
      return;
    }
    generateInvoicePDF(order, invoiceSettings);
  };

  const handleDownloadPDF = async (): Promise<void> => {
    if (invoiceSettingsLoading) {
      console.warn("Paramètres de facturation pas encore chargés");
      return;
    }
    try {
      await generateAdvancedInvoicePDF(order, invoiceSettings);
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  // Fonction pour envoyer sur WhatsApp vers le client
  const handleSendWhatsAppToClient = (order: Order): void => {
    if (!order.customer_phone) {
      alert("Aucun numéro de téléphone client disponible");
      return;
    }

    const itemsText =
      order.order_items
        ?.map(
          (item) =>
            `${item.quantity}x ${item.product?.name} - ${formatXOF(
              item.price * item.quantity
            )}`
        )
        .join("\n") || "Aucun produit";

    const message = `Bonjour ${order.customer_name || "Client"}!

📦 Votre commande #${order.id.slice(0, 8)}
    
📋 Détails de votre commande:
${itemsText}

💰 Total: ${formatXOF(order.total_amount)}
📞 Votre téléphone: ${order.customer_phone}
📅 Date: ${new Date(order.created_at).toLocaleDateString("fr-FR")}

🔄 Statut: ${getStatusDisplayName(order.status)}
💳 Paiement: ${getPaymentStatusDisplayName(order.payment_status)}

Merci pour votre confiance ! Nous vous tiendrons informé de l'avancement de votre commande.`;

    const cleanPhone = order.customer_phone.replace(/\s/g, "");
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  if (invoiceSettingsError) {
    console.error("Erreur de chargement des paramètres:", invoiceSettingsError);
  }

  const canModifyOrder = (order: Order): boolean => {
    return order.status !== "cancelled" && order.payment_status !== "refunded";
  };

  // Vérifie si l'utilisateur peut modifier le statut de la commande
  const canModifyOrderStatus = (order: Order, userRole?: string): boolean => {
    if (order.status === "cancelled") return false;
    if (userRole === "assistant") return false;
    if (userRole === "admin" && order.status === "confirmed") return false;
    if (userRole === "admin" && order.status === "delivered") return false;

    return true;
  };

  const canConfirmOrder = (order: Order): boolean => {
    return order.payment_status === "paid" && !!order.payment_proof;
  };

  const getAvailableStatusOptions = (userRole?: string): Order["status"][] => {
    const options: Order["status"][] = ["pending"];

    if (userRole === "admin") {
      options.push("confirmed");
    }

    if (userRole === "client") {
      options.push("cancelled");
    }
    if (userRole === "livreur") {
      options.push("delivered");
    }

    return options;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Commande #{currentOrder.id.slice(0, 8)}
                  {isRefreshing && (
                    <span className="ml-2 text-sm text-blue-500 animate-pulse">
                      (Actualisation...)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(currentOrder.created_at).toLocaleDateString(
                    "fr-FR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshOrderData}
                disabled={isRefreshing}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                title="Rafraîchir les données"
              >
                <svg
                  className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations Client */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations Client
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="text-sm font-medium text-gray-900">
                      {currentOrder.customer_name || "Non spécifié"}
                    </p>
                  </div>
                </div>
                {currentOrder.customer_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {currentOrder.customer_phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Adresse de livraison */}
              {currentOrder.shipping_address && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Adresse de Livraison
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {currentOrder.shipping_address.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentOrder.shipping_address.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {currentOrder.shipping_address.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentOrder.shipping_address.city}
                      </p>
                    </div>
                    {currentOrder.shipping_address.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes:</p>
                        <p className="text-sm text-gray-900">
                          {currentOrder.shipping_address.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Informations Assistant */}
              {(currentOrder.assistant_id || currentOrder.assistant_name) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Informations Assistant
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                    {currentOrder.assistant_name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-blue-400 mr-2" />
                        <div>
                          <p className="text-sm text-blue-600">
                            Nom de l'assistant
                          </p>
                          <p className="text-sm font-medium text-blue-900">
                            {currentOrder.assistant_name}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.assistant_id && (
                      <div className="flex items-center">
                        <div className="h-4 w-4 text-blue-400 mr-2 flex items-center justify-center">
                          <span className="text-xs">ID</span>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600">ID Assistant</p>
                          <p className="text-sm font-medium text-blue-900">
                            {currentOrder.assistant_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informations Livreur */}
              {(currentOrder.delivered_by ||
                currentOrder.delivered_by_name) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Informations Livreur
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg space-y-3">
                    {currentOrder.delivered_by_name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-green-400 mr-2" />
                        <div>
                          <p className="text-sm text-green-600">
                            Nom du livreur
                          </p>
                          <p className="text-sm font-medium text-green-900">
                            {currentOrder.delivered_by_name}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.delivered_by && (
                      <div className="flex items-center">
                        <div className="h-4 w-4 text-green-400 mr-2 flex items-center justify-center">
                          <span className="text-xs">ID</span>
                        </div>
                        <div>
                          <p className="text-sm text-green-600">ID Livreur</p>
                          <p className="text-sm font-medium text-green-900">
                            {currentOrder.delivered_by.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.delivered_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-green-400 mr-2" />
                        <div>
                          <p className="text-sm text-green-600">
                            Date de livraison
                          </p>
                          <p className="text-sm font-medium text-green-900">
                            {new Date(
                              currentOrder.delivered_at
                            ).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Statuts et Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gestion de la Commande
              </h3>
              {/* Statut de la commande */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de la commande
                </label>
                <select
                  value={currentOrder.status}
                  onChange={(e) =>
                    handleStatusChange(
                      currentOrder.id,
                      e.target.value as Order["status"]
                    )
                  }
                  disabled={
                    !canModifyOrderStatus(currentOrder, currentUserRole)
                  }
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                    !canModifyOrderStatus(currentOrder, currentUserRole)
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {getAvailableStatusOptions(currentUserRole).map((status) => (
                    <option key={status} value={status}>
                      {getStatusDisplayName(status)}
                    </option>
                  ))}
                </select>
                {currentOrder.status === "pending" &&
                  currentUserRole === "admin" &&
                  !canConfirmOrder(currentOrder) && (
                    <div className="mt-2 text-xs text-yellow-600">
                      ⚠️ Pour confirmer cette commande, le paiement doit être
                      marqué comme "Payé" 
                    </div>
                  )}
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                      currentOrder.status
                    )}`}
                  >
                    {getStatusDisplayName(currentOrder.status)}
                  </span>
                </div>
                {!canModifyOrder(currentOrder) && (
                  <div className="mt-2 text-xs text-red-600">
                    ⚠️ Commande annulée - modifications désactivées
                  </div>
                )}
                 {currentOrder.payment_status === "paid" &&
                  currentOrder.processed_by && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700">
                        ✅ Paiement confirmé par:{" "}
                        {currentOrder.processed_by?.full_name || "Assistant"}
                      </p>
                      <p className="text-xs text-green-600">
                        Le{" "}
                        {currentOrder.updated_at
                          ? new Date(
                              currentOrder.updated_at
                            ).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date non disponible"}
                      </p>
                    </div>
                  )}
              </div>

              {/* Statut de paiement */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de paiement
                </label>
                <select
                  value={currentOrder.payment_status}
                  onChange={(e) =>
                    handlePaymentStatusChange(
                      currentOrder.id,
                      e.target.value as Order["payment_status"]
                    )
                  }
                  disabled={!canModifyOrder(currentOrder)}
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm ${
                    !canModifyOrder(currentOrder)
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payée</option>
                  <option value="failed">Échoué</option>
                  <option value="refunded">Remboursée</option>
                </select>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(
                      currentOrder.payment_status
                    )}`}
                  >
                    {getPaymentStatusDisplayName(currentOrder.payment_status)}
                  </span>
                </div>
                {/* {currentOrder.payment_method && (
                  <div className="mt-2 text-sm text-gray-600">
                    Méthode:{" "}
                    {getPaymentMethodDisplayName(currentOrder.payment_method)}
                  </div>
                )} */}

               
              </div>

              {/* {currentOrder.processed_by && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ✅ Traitée par: {currentOrder.processed_by?.full_name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Le{" "}
                    {currentOrder.updated_at
                      ? new Date(currentOrder.updated_at).toLocaleDateString(
                          "fr-FR"
                        )
                      : "Date non disponible"}
                  </p>
                </div>
              )} */}
              {/* Upload de preuve de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preuve de paiement
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <button
                      onClick={() =>
                        handlePaymentProofUpload(currentOrder.id, selectedFile!)
                      }
                      disabled={isUploadingProof}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm"
                    >
                      {isUploadingProof ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Uploader la preuve
                        </>
                      )}
                    </button>
                  )}
                  {currentOrder.payment_proof && (
                    <a
                      href={currentOrder.payment_proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-center text-sm flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Voir la preuve de paiement
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Produits commandés */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produits Commandés
            </h3>
            <div className="space-y-3">
              {currentOrder.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.product?.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || "Produit non trouvé"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatXOF(item.price)}
                      </p>
                      {item.product && (
                        <p
                          className={`text-xs ${
                            item.product.stock_quantity < item.quantity
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          Stock: {item.product.stock_quantity}
                          {item.product.stock_quantity < item.quantity &&
                            " - Stock insuffisant"}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatXOF(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg space-y-3">
              {/* Sous-total */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-indigo-700">
                  Sous-total
                </span>
                <span className="text-sm font-medium text-indigo-900">
                  {formatXOF(
                    currentOrder.subtotal_amount || currentOrder.total_amount
                  )}
                </span>
              </div>

              {/* Frais de livraison */}
              {currentOrder.delivery_fee && currentOrder.delivery_fee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-indigo-700 flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Frais de livraison
                    {currentOrder.delivery_location_name && (
                      <span className="text-xs text-indigo-500 ml-1">
                        ({currentOrder.delivery_location_name})
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-indigo-900">
                    {formatXOF(currentOrder.delivery_fee)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                <span className="text-lg font-semibold text-indigo-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  Total
                </span>
                <span className="text-2xl font-bold text-indigo-900">
                  {formatXOF(currentOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handlePrintInvoice}
              disabled={invoiceSettingsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              {invoiceSettingsLoading ? "Chargement..." : "Imprimer Facture"}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={invoiceSettingsLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {invoiceSettingsLoading ? "Chargement..." : "Télécharger PDF"}
            </button>

            <button
              onClick={() => handleSendWhatsAppToClient(currentOrder)}
              disabled={!currentOrder.customer_phone}
              className={`px-4 py-2 text-white rounded-lg flex items-center justify-center text-sm transition-colors ${
                !currentOrder.customer_phone
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              title={
                !currentOrder.customer_phone
                  ? "Aucun numéro de téléphone client"
                  : "Envoyer au client sur WhatsApp"
              }
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {!currentOrder.customer_phone
                ? "Numéro manquant"
                : "WhatsApp Client"}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
