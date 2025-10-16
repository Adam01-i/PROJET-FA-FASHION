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
    currentUserRole?: string
  ): Promise<boolean> => {
    try {
      // Vérifications de sécurité selon le rôle
      if (currentUserRole === "assistant") {
        throw new Error(
          "Les assistants ne peuvent pas modifier le statut des commandes"
        );
      }

      if (currentUserRole === "admin" && status === "cancelled") {
        throw new Error(
          "Les administrateurs ne peuvent pas annuler les commandes"
        );
      }

      // Vérifier si on essaie de confirmer une commande
      if (status === "confirmed") {
        // Récupérer les infos de paiement de la commande
        const { data: order } = await supabase
          .from("orders")
          .select("payment_status, payment_proof")
          .eq("id", orderId)
          .single();

        if (order?.payment_status !== "paid") {
          throw new Error(
            "Impossible de confirmer une commande sans preuve de paiement et statut payé"
          );
        }
      }

      const updates: {
        status: Order["status"];
        updated_at: string;
        payment_status?: Order["payment_status"];
        processed_by?: string;
      } = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "cancelled") {
        updates.payment_status = "refunded";
      }

      if (processedBy) {
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
    refetch: fetchOrders,
  };
}
