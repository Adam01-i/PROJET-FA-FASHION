import { X, User, Phone, MapPin, Package, DollarSign } from 'lucide-react';
import { Order } from '../../models';
import { formatXOF } from '../../lib/currency';

interface DeliveryOrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onMarkAsDelivered: (order: Order) => void;
  canMarkAsDelivered: boolean;
}

export default function DeliveryOrderDetailsModal({
  order,
  onClose,
//   onMarkAsDelivered,
//   canMarkAsDelivered
}: DeliveryOrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de la commande #{order.id.slice(0, 8)}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Créée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Informations client */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Informations client
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nom:</span>
                  <span className="font-medium">{order.customer_name || "Non spécifié"}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      Téléphone:
                    </span>
                    <span className="font-medium">{order.customer_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations livraison */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Informations de livraison
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lieu:</span>
                  <span className="font-medium">{order.delivery_location_name || "Non spécifié"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison:</span>
                  <span className="font-medium">{formatXOF(order.delivery_fee || 0)}</span>
                </div>
              </div>
            </div>

            {/* Articles commandés */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Articles commandés ({order.order_items?.length || 0})
              </h4>
              <div className="space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{formatXOF(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé financier */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Résumé
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span>{formatXOF(order.subtotal_amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frais de livraison:</span>
                  <span>{formatXOF(order.delivery_fee || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="font-medium text-gray-900">{formatXOF(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            {/* {canMarkAsDelivered && (order.status === 'confirmed' || order.status === 'shipped') && (
              <button
                onClick={() => onMarkAsDelivered(order)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Marquer comme livrée
              </button>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}