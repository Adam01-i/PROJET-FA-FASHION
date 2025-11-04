// hooks/useMyOrders.ts - VERSION CORRIGÉE
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Order } from "../models";

export interface OrdersFilters {
  status?: Order["status"] | "all";
  paymentStatus?: Order["payment_status"] | "all";
  searchQuery?: string;
}

export interface OrdersStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  totalAmount: number;
}

// ✅ Fonction pour vérifier la connexion internet
const checkInternetConnection = (): boolean => {
  return navigator.onLine;
};

// ✅ Fonction pour attendre que Supabase soit initialisé
const waitForSupabase = async (timeout = 5000): Promise<boolean> => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const { error } = await supabase.auth.getSession();
      if (!error) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  return false;
};

export function useMyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrdersFilters>({
    status: "all",
    paymentStatus: "all",
    searchQuery: "",
  });
  const navigate = useNavigate();

  // ✅ Fetch des commandes avec gestion robuste des erreurs
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier la connexion internet
      if (!checkInternetConnection()) {
        setError("Problème de connexion internet. Vérifiez votre connexion et réessayez.");
        setOrders([]);
        return;
      }

      // Attendre que Supabase soit initialisé
      const isSupabaseReady = await waitForSupabase(5000);
      if (!isSupabaseReady) {
        setError("Service temporairement indisponible. Veuillez réessayer dans quelques instants.");
        setOrders([]);
        return;
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        if (sessionError.message.includes('NetworkError') || sessionError.message.includes('fetch')) {
          setError("Problème de connexion au serveur. Vérifiez votre internet et réessayez.");
        } else {
          setError("Erreur de session. Veuillez vous reconnecter.");
        }
        return;
      }

      if (!session) {
        setError("Utilisateur non connecté");
        setOrders([]);
        return;
      }

      console.log("User authenticated:", session.user.id);

      // ESSAYER D'ABORD LA VUE
      let ordersData: Order[] = [];
      let viewError = null;

      try {
        const { data, error: fetchError } = await supabase
          .from("user_orders_view")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.warn("View fetch error, trying fallback:", fetchError);
          viewError = fetchError;
        } else {
          console.log("Orders fetched successfully from view:", data?.length || 0);
          ordersData = data || [];
        }
      } catch (viewException) {
        console.warn("View exception, trying fallback:", viewException);
        viewError = viewException;
      }

      // SI LA VUE ÉCHoue, UTILISER LE FALLBACK
      if (viewError || ordersData.length === 0) {
        console.log("Using fallback query...");
        ordersData = await fetchOrdersFallback(session.user.id);
      }

      setOrders(ordersData);
      
    } catch (err) {
      console.error("Error in fetchOrders:", err);
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Erreur de connexion réseau. Vérifiez votre connexion internet.");
      } else if (err instanceof Error && err.message.includes('timeout')) {
        setError("Le serveur met trop de temps à répondre. Veuillez réessayer.");
      } else {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement des commandes";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback si la vue n'existe pas ou ne retourne pas de données
  const fetchOrdersFallback = async (userId: string): Promise<Order[]> => {
    try {
      console.log("Fetching orders with fallback for user:", userId);
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              description,
              image_url,
              price,
              category_id,
              stock_quantity,
              is_public,
              created_at,
              updated_at,
              category:categories(name)
            )
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fallback query error:", error);
        throw error;
      }

      console.log("Fallback orders fetched:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("Error in fallback fetch:", error);
      throw error;
    }
  };

  // ✅ Vérifier si l'utilisateur a des commandes dans la base
  // const checkUserHasOrders = async (userId: string): Promise<boolean> => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("orders")
  //       .select("id")
  //       .eq("user_id", userId)
  //       .limit(1);

  //     if (error) {
  //       console.error("Error checking user orders:", error);
  //       return false;
  //     }

  //     return (data?.length || 0) > 0;
  //   } catch (error) {
  //     console.error("Exception checking user orders:", error);
  //     return false;
  //   }
  // };

  // ✅ Appliquer les filtres (identique à votre version)
  // const applyFilters = (
  //   ordersList: Order[],
  //   currentFilters: OrdersFilters
  // ): Order[] => {
  //   let filtered = ordersList;

  //   if (currentFilters.status && currentFilters.status !== "all") {
  //     filtered = filtered.filter(
  //       (order) => order.status === currentFilters.status
  //     );
  //   }

  //   if (currentFilters.paymentStatus && currentFilters.paymentStatus !== "all") {
  //     filtered = filtered.filter(
  //       (order) => order.payment_status === currentFilters.paymentStatus
  //     );
  //   }

  //   if (currentFilters.searchQuery) {
  //     const searchLower = currentFilters.searchQuery.toLowerCase();
  //     filtered = filtered.filter(
  //       (order) =>
  //         order.id.toLowerCase().includes(searchLower) ||
  //         order.order_items?.some((item) =>
  //           item.product?.name.toLowerCase().includes(searchLower)
  //         )
  //     );
  //   }

  //   return filtered;
  // };

  // ✅ Rediriger vers la page de connexion
  const redirectToLogin = () => {
    navigate("/login");
  };

  // ✅ Mettre à jour les filtres
  const updateFilters = (newFilters: Partial<OrdersFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // ✅ Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      status: "all",
      paymentStatus: "all",
      searchQuery: "",
    });
  };

  // ✅ Obtenir les statistiques
  const getOrdersStats = (): OrdersStats => {
    const stats: OrdersStats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      totalAmount: 0,
    };

    orders.forEach((order) => {
      stats.totalAmount += order.total_amount;

      switch (order.status) {
        case "pending":
          stats.pending++;
          break;
        case "confirmed":
          stats.confirmed++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    });

    return stats;
  };

  // ✅ Formater la date
  const formatOrderDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Obtenir la progression
  const getOrderProgress = (status: Order["status"]) => {
    const statusOrder: Order["status"][] = [
      "pending",
      "confirmed",
    ];
    const currentIndex = statusOrder.indexOf(status);

    return {
      currentStep: currentIndex + 1,
      totalSteps: statusOrder.length,
      steps: statusOrder.map((s) => ({
        status: s,
        completed: statusOrder.indexOf(s) <= currentIndex,
      })),
    };
  };

  // ✅ Recharger
  const refetch = () => {
    fetchOrders();
  };

  // Chargement initial
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    stats: getOrdersStats(),
    refetch,
    formatOrderDate,
    getOrderProgress,
    redirectToLogin,
    getSupportPhone: async () => "221761994984", // Version simplifiée
    hasOrders: orders.length > 0,
  };
}