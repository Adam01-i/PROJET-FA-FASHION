import { X, User, Phone, MapPin, Package, Calendar, Truck, CreditCard } from 'lucide-react';
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
  onMarkAsDelivered,
  canMarkAsDelivered,
}: DeliveryOrderDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full transform transition-all">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Commande #{order.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-blue-100 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Créée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body avec layout grid responsive */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Colonne gauche - Informations client et livraison */}
              <div className="space-y-6">
                {/* Carte Client */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      Informations client
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Nom complet</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {order.customer_name || "Non spécifié"}
                      </span>
                    </div>
                    {order.customer_phone && (
                      <div className="flex items-center justify-between py-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-green-600" />
                          Téléphone
                        </span>
                        <span className="font-medium text-gray-900 text-sm">
                          {order.customer_phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carte Livraison */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Truck className="h-4 w-4 mr-2 text-orange-600" />
                      Informations de livraison
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Lieu de livraison</span>
                      <span className="font-medium text-gray-900 text-sm text-right max-w-[150px]">
                        {order.delivery_location_name || "Non spécifié"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Frais de livraison</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {formatXOF(order.delivery_fee || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Articles et résumé */}
              <div className="space-y-6">
                {/* Carte Articles */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Package className="h-4 w-4 mr-2 text-purple-600" />
                      Articles commandés ({order.order_items?.length || 0})
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-4 space-y-3">
                      {order.order_items?.map((item, index) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {item.product?.name || "Produit non trouvé"}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.quantity} × {formatXOF(item.price)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">
                              {formatXOF(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Carte Résumé financier */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                      Résumé financier
                    </h4>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">Sous-total</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatXOF(order.subtotal_amount || order.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600">Frais de livraison</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatXOF(order.delivery_fee || 0)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatXOF(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statut de la commande */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Statut actuel</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.status === 'confirmed' && '✅ Confirmée - Prête pour la livraison'}
                      {order.status === 'shipped' && '🚚 En cours de livraison'}
                      {order.status === 'delivered' && '📦 Livrée'}
                    </p>
                  </div>
                </div>
                {order.delivered_at && (
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Livrée le</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.delivered_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer avec actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="text-sm text-gray-600">
              Dernière mise à jour: {order.updated_at ? new Date(order.updated_at).toLocaleDateString('fr-FR') : 'Non spécifié'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Fermer
              </button>
              {canMarkAsDelivered && (order.status === 'confirmed' || order.status === 'shipped') && (
                <button
                  onClick={() => onMarkAsDelivered(order)}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Marquer comme livrée
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}