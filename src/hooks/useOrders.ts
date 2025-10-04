import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface Order
      const formattedOrders = (data || []).map(order => ({
        ...order,
        payment_method: order.payment_method || 'non spécifié',
        order_items: order.order_items || []
      }));
      
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Mettre à jour l'état local
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders
  };
}