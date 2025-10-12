import React, { useState } from "react";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Package,
  DollarSign,
  MessageCircle,
  Download,
  X,
  Printer,
} from "lucide-react";
import { Order } from "../types";
// Corrigez les imports - utilisez les fonctions depuis le fichier correct
import { generateInvoicePDF, downloadInvoicePDF, generateAdvancedInvoicePDF } from '../utils/invoiceGenerator'; 
import { useParsedSettings } from '../hooks/useSiteSettings';

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
  onSendWhatsApp,
  isUploadingProof,
}: OrderDetailsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { settings, loading: settingsLoading, error: settingsError } = useParsedSettings();

  const getStatusColor = (status: Order["status"]): string => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "confirmed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
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

  const handleUploadProof = (): void => {
    if (selectedFile) {
      onPaymentProofUpload(order.id, selectedFile);
      setSelectedFile(null);
    }
  };

  const getStatusDisplayName = (status: Order["status"]): string => {
    const statusMap: Record<Order["status"], string> = {
      pending: "En attente",
      confirmed: "Confirmée",
      processing: "En traitement",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
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

  const getPaymentMethodDisplayName = (method?: string): string => {
    const methodMap: Record<string, string> = {
      wave: "Wave",
      orange_money: "Orange Money",
      mobile_money: "Mobile Money",
      credit_card: "Carte de crédit",
      cash: "Espèces",
    };
    return method ? methodMap[method] || method : "Non spécifié";
  };

  const handlePrintInvoice = (): void => {
    if (settingsLoading) {
      console.warn("Paramètres pas encore chargés");
      return;
    }
    generateInvoicePDF(order, settings);
  };

  const handleDownloadPDF = async (): Promise<void> => {
    if (settingsLoading) {
      console.warn("Paramètres pas encore chargés");
      return;
    }
    try {
      await generateAdvancedInvoicePDF(order, settings);
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      alert("Erreur lors de la génération du PDF");
    }
  };

  const handleDownloadHTML = async (): Promise<void> => {
    if (settingsLoading) {
      console.warn("Paramètres pas encore chargés");
      return;
    }
    try {
      await downloadInvoicePDF(order, settings);
    } catch (error) {
      console.error("Erreur lors du téléchargement HTML:", error);
      alert("Erreur lors de la génération du HTML");
    }
  };

  if (settingsError) {
    console.error("Erreur de chargement des paramètres:", settingsError);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Commande #{order.id.slice(0, 8)}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
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
                      {order.user?.full_name || "Non spécifié"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user?.email || "Non spécifié"}
                    </p>
                  </div>
                </div>
                {order.user?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.user.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Adresse de livraison */}
              {order.shipping_address && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Adresse de Livraison
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.shipping_address.full_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_address.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {order.shipping_address.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_address.city}
                      </p>
                    </div>
                    {order.shipping_address.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes:</p>
                        <p className="text-sm text-gray-900">
                          {order.shipping_address.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Statuts et Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gestion de la Commande
              </h3>

              {/* Statut de la commande */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de la commande
                </label>
                <select
                  value={order.status}
                  onChange={(e) =>
                    onStatusChange(order.id, e.target.value as Order["status"])
                  }
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="processing">En traitement</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusDisplayName(order.status)}
                  </span>
                </div>
              </div>

              {/* Statut de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de paiement
                </label>
                <select
                  value={order.payment_status}
                  onChange={(e) =>
                    onPaymentStatusChange(
                      order.id,
                      e.target.value as Order["payment_status"]
                    )
                  }
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  <option value="pending">En attente</option>
                  <option value="paid">Payée</option>
                  <option value="failed">Échoué</option>
                  <option value="refunded">Remboursée</option>
                </select>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(
                      order.payment_status
                    )}`}
                  >
                    {getPaymentStatusDisplayName(order.payment_status)}
                  </span>
                </div>
                {order.payment_method && (
                  <div className="mt-2 text-sm text-gray-600">
                    Méthode: {getPaymentMethodDisplayName(order.payment_method)}
                  </div>
                )}
              </div>

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
                      onClick={handleUploadProof}
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
                  {order.payment_proof && (
                    <a
                      href={order.payment_proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-center text-sm flex items-center justify-center"
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
              {order.order_items?.map((item) => (
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /%3E%3C/svg%3E";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || "Produit non trouvé"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatXOF(item.price)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatXOF(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-indigo-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  Total
                </span>
                <span className="text-2xl font-bold text-indigo-900">
                  {formatXOF(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handlePrintInvoice}
              disabled={settingsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              {settingsLoading ? "Chargement..." : "Imprimer Facture"}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={settingsLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center text-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {settingsLoading ? "Chargement..." : "Télécharger PDF"}
            </button>

            <button
              onClick={handleDownloadHTML}
              disabled={settingsLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center text-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {settingsLoading ? "Chargement..." : "Télécharger HTML"}
            </button>
            
            <button
              onClick={() => onSendWhatsApp(order)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center text-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Envoyer sur WhatsApp
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