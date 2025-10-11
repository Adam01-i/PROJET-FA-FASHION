import React from 'react';
import { X } from 'lucide-react';
import { Order } from '../../types';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, onUpdateStatus }) => {
  const formatXOF = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Commande #{order.id.slice(0, 8)}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Informations Client</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">ID Client</p>
                <p className="text-sm font-medium text-gray-900">{order.user_id}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Statut</h3>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Méthode de Paiement</h3>
              <p className="text-sm text-gray-900 capitalize">{order.payment_method || 'Non spécifié'}</p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">
                  {formatXOF(order.total_amount)}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Changer le Statut</h3>
              <select
                value={order.status}
                onChange={(e) => {
                  onUpdateStatus(order.id, e.target.value as Order['status']);
                  onClose();
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">En attente</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;