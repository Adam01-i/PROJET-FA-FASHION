import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types'; 
import NavbarAssistant from '.././components/NavbarAssistant';
import OrderStats from '../components/assistant/OrderStats';
import OrderSearch from '../components/assistant/OrderSearch';
import OrdersTable from '../components/assistant/OrdersTable';
import OrderModal from '../components/assistant/OrderModal';

export default function Assistant() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { orders, updateOrderStatus } = useOrders();

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      alert('Statut de la commande mis à jour avec succès');
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar Assistant */}
      <NavbarAssistant />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
            <p className="text-gray-600 mt-2">Interface Assistant - Suivi et mise à jour des commandes</p>
          </div>
          <OrderSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        <OrderStats orders={orders} />

        <OrdersTable
          orders={filteredOrders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onViewOrder={setSelectedOrder}
        />

        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </div>
    </div>
  );
}