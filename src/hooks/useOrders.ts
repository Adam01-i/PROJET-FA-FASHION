// hooks/useOrders.ts
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

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          user:profiles!user_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erreur de chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;
      
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

  const updatePaymentStatus = async (
    orderId: string, 
    paymentStatus: Order['payment_status'], 
    paymentProof?: string
  ): Promise<boolean> => {
    try {
      const updates: { payment_status: Order['payment_status']; payment_proof?: string } = { 
        payment_status: paymentStatus 
      };
      
      if (paymentProof) {
        updates.payment_proof = paymentProof;
      }

      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    updatePaymentStatus,
    refetch: fetchOrders
  };
}