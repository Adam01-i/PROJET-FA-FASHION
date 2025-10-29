import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Order } from "../models";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
        *,
        order_items (
          *,
          product:products (*)
        ),
        user:profiles!user_id (*),
        processed_by:profiles!processed_by (id, full_name, email)
      `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Erreur de chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  processedBy?: string,
  currentUserRole?: string,
  userName?: string
): Promise<boolean> => {
  try {
    // Vérifications de sécurité selon le rôle
    if (currentUserRole === "assistant") {
      throw new Error(
        "Les assistants ne peuvent pas modifier le statut des commandes"
      );
    }

    // Récupérer la commande complète avec ses items
    const { data: order } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq("id", orderId)
      .single();

    if (!order) {
      throw new Error("Commande non trouvée");
    }

    // Vérifier les stocks avant confirmation
    if (status === "confirmed") {
      for (const item of order.order_items) {
        if (item.product.stock_quantity < item.quantity) {
          throw new Error(
            `Stock insuffisant pour ${item.product.name}. Stock disponible: ${item.product.stock_quantity}, Quantité demandée: ${item.quantity}`
          );
        }
      }
    }

    // Mettre à jour les stocks si la commande est confirmée
    if (status === "confirmed") {
      for (const item of order.order_items) {
        const newStock = item.product.stock_quantity - item.quantity;
        
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.product_id);

        if (stockError) {
          console.error("Error updating product stock:", stockError);
          throw new Error(`Erreur de mise à jour du stock pour ${item.product.name}`);
        }
      }
    }

    // Restaurer les stocks si la commande est annulée
    if (status === "cancelled" && order.status === "confirmed") {
      for (const item of order.order_items) {
        const newStock = item.product.stock_quantity + item.quantity;
        
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", item.product_id);

        if (stockError) {
          console.error("Error restoring product stock:", stockError);
          throw new Error(`Erreur de restauration du stock pour ${item.product.name}`);
        }
      }
    }

    // Vérifications supplémentaires pour les livreurs
    if (currentUserRole === "livreur") {
      if (status !== "delivered") {
        throw new Error(
          "Les livreurs ne peuvent que marquer les commandes comme livrées"
        );
      }

      if (order.status !== "confirmed" && order.status !== "shipped") {
        throw new Error(
          `Impossible de livrer une commande avec le statut "${order.status}"`
        );
      }

      if (order.payment_status !== "paid") {
        throw new Error("Impossible de livrer une commande non payée");
      }
    }

    // Vérifier la confirmation de commande
    if (status === "confirmed" && order.payment_status !== "paid") {
      throw new Error(
        "⚠️ Pour confirmer cette commande, le paiement doit être marqué comme Payé "
      );
    }

    const updates: {
      status: Order['status'];
      updated_at: string;
      payment_status?: Order['payment_status'];
      delivered_by?: string;
      delivered_by_name?: string;
      delivered_at?: string;
      processed_by?: string;
    } = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Gestion spécifique pour l'annulation
    if (status === "cancelled") {
      updates.payment_status = "refunded";
    }

    // Gestion spécifique pour la livraison
    if (status === "delivered" && processedBy && userName) {
      updates.delivered_by = processedBy;
      updates.delivered_by_name = userName;
      updates.delivered_at = new Date().toISOString();
      updates.payment_status = "paid";
    }

    if (processedBy && status !== "delivered") {
      updates.processed_by = processedBy;
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (error) throw error;

    return true;
  } catch (err) {
    console.error("Error updating order:", err);
    throw err;
  }
};

  // Fonction dédiée pour les livreurs
const markOrderAsDelivered = async (
  orderId: string,
  deliveredBy: string,
  deliveredByName: string
): Promise<boolean> => {
  try {
    const updates = {
      status: 'delivered' as Order['status'],
      delivered_by: deliveredBy,
      delivered_by_name: deliveredByName,
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw error;
    
    // Mettre à jour le cache local
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
    
    return true;
  } catch (err) {
    console.error('Error marking order as delivered:', err);
    throw err;
  }
};

  // Remplacer la fonction updatePaymentStatus existante par :
  const updatePaymentStatus = async (
    orderId: string,
    paymentStatus: Order["payment_status"],
    paymentProof?: string
  ): Promise<boolean> => {
    try {
      // Vérifier d'abord si la commande est annulée
      const { data: order } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (order?.status === "cancelled") {
        throw new Error(
          "Impossible de modifier le statut de paiement d'une commande annulée"
        );
      }

      const updates: {
        payment_status: Order["payment_status"];
        payment_proof?: string;
      } = {
        payment_status: paymentStatus,
      };

      if (paymentProof) {
        updates.payment_proof = paymentProof;
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error("Error updating payment status:", err);
      throw err;
    }
  };

  const createOrder = async (orderData: {
    user_id: string;
    total_amount: number;
    shipping_address?: Order["shipping_address"];
    payment_method?: Order["payment_method"];
    order_items: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
  }) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: orderData.user_id,
            total_amount: orderData.total_amount,
            shipping_address: orderData.shipping_address,
            payment_method: orderData.payment_method,
            status: "pending",
            payment_status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Créer les order_items
      const orderItems = orderData.order_items.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Erreur de création de commande");
    }
  };

const createAssistantOrder = async (orderData: {
  customer_phone: string;
  customer_name?: string;
  subtotal_amount: number;
  delivery_fee: number;
  total_amount: number;
  delivery_location_id: string;
  delivery_location_name: string;
  order_items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  assistant_id?: string;
  assistant_name?: string;
}): Promise<{id: string}> => {
  try {
    const { data, error } = await supabase.rpc('create_assistant_order_with_delivery', {
      customer_phone: orderData.customer_phone,
      customer_name: orderData.customer_name || null,
      subtotal_amount: orderData.subtotal_amount,
      delivery_fee: orderData.delivery_fee,
      total_amount: orderData.total_amount,
      delivery_location_id: orderData.delivery_location_id,
      delivery_location_name: orderData.delivery_location_name,
      order_items: orderData.order_items,
      assistant_id: orderData.assistant_id || null,
      assistant_name: orderData.assistant_name || null
    });

    if (error) {
      console.error('RPC Error details:', error);
      throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
    }

    if (!data) {
      throw new Error('Aucun ID de commande retourné');
    }

    return { id: data };
  } catch (err) {
    console.error('Error in createAssistantOrder:', err);
    throw err;
  }
};

  // Remplacer l'abonnement existant dans useEffect par :
  useEffect(() => {
    fetchOrders();

    // Abonnement optimisé en temps réel
    const subscription = supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // Mise à jour optimisée - seulement les champs modifiés
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id
                ? {
                    ...order,
                    ...payload.new,
                    // Garder les relations existantes pour éviter de recharger
                    order_items: order.order_items,
                    user: order.user,
                    processed_by: order.processed_by,
                  }
                : order
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          // Pour les nouvelles commandes, charger avec relations
          const { data: newOrder } = await supabase
            .from("orders")
            .select(
              `
            *,
            order_items (
              *,
              product:products (*)
            ),
            user:profiles!user_id (*),
            processed_by:profiles!processed_by (id, full_name, email)
          `
            )
            .eq("id", payload.new.id)
            .single();

          if (newOrder) {
            setOrders((prev) => [newOrder, ...prev]);
          }
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
    createAssistantOrder,
    refetch: fetchOrders,
    markOrderAsDelivered,
  };
}
