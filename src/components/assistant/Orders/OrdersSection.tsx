// components/OrdersSection.tsx
import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  Eye, 
  Package,
  DollarSign,
  MessageCircle,
  User,
  Phone
} from 'lucide-react';
import { Order } from '../../../types';
import { useOrders } from '../../../hooks/useOrders';
import { useToastContext } from '../../../hooks/ToastProvider';
import OrderDetailsModal from '../../../Modals/OrderDetailsModal';

interface OrdersSectionProps {
  searchTerm: string;
}

function formatXOF(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
}

export default function OrdersSection({ searchTerm }: OrdersSectionProps) {
  const { orders, updateOrderStatus, updatePaymentStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const { success, error: toastError } = useToastContext();

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'confirmed': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPaymentStatusColor = (status: Order['payment_status']): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: Order['status']): JSX.Element => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDisplayName = (status: Order['status']): string => {
    const statusMap: Record<Order['status'], string> = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En traitement',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return statusMap[status];
  };

  const getPaymentStatusDisplayName = (status: Order['payment_status']): string => {
    const statusMap: Record<Order['payment_status'], string> = {
      'pending': 'En attente',
      'paid': 'Payée',
      'failed': 'Échoué',
      'refunded': 'Remboursée'
    };
    return statusMap[status];
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    try {
      await updateOrderStatus(orderId, status);
      success("Statut mis à jour", "Le statut de la commande a été mis à jour");
    } catch (error) {
      console.error('Error updating order status:', error);
      toastError("Erreur", "Erreur lors de la mise à jour du statut");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']): Promise<void> => {
    try {
      await updatePaymentStatus(orderId, paymentStatus);
      success("Statut paiement mis à jour", "Le statut de paiement a été mis à jour");
    } catch (error) {
      console.error('Error updating payment status:', error);
      toastError("Erreur", "Erreur lors de la mise à jour du statut de paiement");
    }
  };

  const handleSendWhatsApp = (order: Order): void => {
    const itemsText = order.order_items?.map(item => 
      `${item.quantity}x ${item.product?.name} - ${formatXOF(item.price * item.quantity)}`
    ).join('\n') || 'Aucun produit';

    const message = `Nouvelle commande #${order.id.slice(0, 8)}
    
📦 Produits commandés:
${itemsText}

💰 Total: ${formatXOF(order.total_amount)}
👤 Client: ${order.user?.full_name || 'Non spécifié'}
📞 Téléphone: ${order.user?.phone || 'Non spécifié'}

Merci de traiter cette commande.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handlePaymentProofUpload = async (orderId: string, file: File): Promise<void> => {
    if (!file) return;

    setIsUploadingProof(true);
    try {
      // Simuler l'upload (remplacer par votre logique Supabase)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici vous ajouteriez la logique d'upload vers Supabase Storage
      // const { error: uploadError } = await supabase.storage
      //   .from('order-documents')
      //   .upload(filePath, file);
      
      await updatePaymentStatus(orderId, 'paid');
      success("Preuve uploadée", "La preuve de paiement a été uploadée avec succès");
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toastError("Erreur", "Erreur lors de l'upload de la preuve de paiement");
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Statistiques
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <>
      {/* Statistiques - Responsive */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Commandes</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{pendingOrders}</p>
            </div>
            <div className="p-1 sm:p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Payées</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{paidOrders}</p>
            </div>
            <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Revenu Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatXOF(totalRevenue)}</p>
            </div>
            <div className="p-1 sm:p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">Aucune commande trouvée</p>
                      <p className="text-gray-600 mt-1">
                        {searchTerm ? "Aucune commande ne correspond à votre recherche" : "Aucune commande pour le moment"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id.slice(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.user?.full_name || 'Non spécifié'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email}
                      </div>
                      {order.user?.phone && (
                        <div className="text-xs text-gray-400 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatXOF(order.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                          {getStatusDisplayName(order.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                        {getPaymentStatusDisplayName(order.payment_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendWhatsApp(order)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors"
                          title="Envoyer sur WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>                      
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue Mobile/Tablette */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">Aucune commande trouvée</p>
            <p className="text-gray-600 mt-1">
              {searchTerm ? "Aucune commande ne correspond à votre recherche" : "Aucune commande pour le moment"}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-200">
              {/* En-tête de la carte */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Commande #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Voir détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(order)}
                    className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors"
                    title="Envoyer sur WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-3 w-3 mr-1" />
                    Client:
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {order.user?.full_name || 'Non spécifié'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Montant:
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatXOF(order.total_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(order.status)} flex items-center`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">
                      {getStatusDisplayName(order.status)}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Paiement:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                    {getPaymentStatusDisplayName(order.payment_status)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de détails de commande */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleUpdateOrderStatus}
          onPaymentStatusChange={handleUpdatePaymentStatus}
          onPaymentProofUpload={handlePaymentProofUpload}
          onSendWhatsApp={handleSendWhatsApp}
          isUploadingProof={isUploadingProof}
        />
      )}
    </>
  );
}