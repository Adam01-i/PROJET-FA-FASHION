import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../models';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      return true;
    } catch (err) {
      console.error('Error updating payment status:', err);
      throw err;
    }
  };

  const createOrder = async (orderData: {
    user_id: string;
    total_amount: number;
    shipping_address?: Order['shipping_address'];
    payment_method?: Order['payment_method'];
    order_items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: orderData.user_id,
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Créer les order_items
      const orderItems = orderData.order_items.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erreur de création de commande');
    }
  };

  useEffect(() => {
    fetchOrders();

    // Abonnement en temps réel aux commandes
    const subscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          // Pour les mises à jour, recharger les données complètes
          if (payload.eventType === 'UPDATE') {
            // Recharger la commande mise à jour avec ses relations
            const { data: updatedOrder } = await supabase
              .from('orders')
              .select(`
                *,
                order_items (
                  *,
                  product:products (*)
                ),
                user:profiles!user_id (*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (updatedOrder) {
              setOrders(prev => 
                prev.map(order => 
                  order.id === payload.new.id ? updatedOrder : order
                )
              );
            }
          } else if (payload.eventType === 'INSERT') {
            // Charger la nouvelle commande avec ses relations
            const { data: newOrder } = await supabase
              .from('orders')
              .select(`
                *,
                order_items (
                  *,
                  product:products (*)
                ),
                user:profiles!user_id (*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (newOrder) {
              setOrders(prev => [newOrder, ...prev]);
            }
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        () => {
          // Recharger les commandes quand les items changent
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    updatePaymentStatus,
    createOrder,
    refetch: fetchOrders
  };
}