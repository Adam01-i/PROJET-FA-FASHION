import { useState, useMemo } from "react";
import {
  Clock,
  ShoppingBag,
  User,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Truck,
  TrendingUp,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { useOrders } from "../../../../hooks/useOrders";
import { useUsers } from "../../../../hooks/useUsers";
import { useProducts } from "../../../../hooks/useProducts";
import { useRevenueStats } from "../../../../hooks/useRevenueStats";
import { useProductSales } from "../../../../hooks/useProductSales";
import { useDailySales } from "../../../../hooks/useDailySales";
import { useSalesTrend } from "../../../../hooks/useSalesTrend";

interface Activity {
  id: string;
  type:
    | "order"
    | "user"
    | "product"
    | "payment"
    | "delivery"
    | "stock"
    | "sales"
    | "system";
  action: string;
  description: string;
  user?: string;
  amount?: number;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  metadata?: Record<string, any>;
}

export default function RecentActivitySection() {
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();
  const { products, loading: productsLoading } = useProducts();
  const { stats: revenueStats, loading: revenueLoading } =
    useRevenueStats("month");
  const { productSales, loading: salesLoading } = useProductSales();
  const { dailySales, loading: dailySalesLoading } = useDailySales("month");
  const { loading: trendLoading } = useSalesTrend();

  const [activityFilter, setActivityFilter] = useState<
    | "all"
    | "order"
    | "user"
    | "product"
    | "payment"
    | "delivery"
    | "stock"
    | "sales"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "custom"
  >("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Fonctions utilitaires - TOUTES LES FONCTIONS DOIVENT ÊTRE ICI AVANT LE useMemo
const getFilterDate = (range: string, start: string, end: string) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Fin de la journée actuelle
  
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // Début de la journée

  switch (range) {
    case 'today':
      // Déjà configuré par défaut
      break;
      
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
      
    case 'month':
      startDate.setDate(now.getDate() - 30);
      break;
      
    case 'custom':
      if (start && end) {
        try {
          // S'assurer que le format est correct
          const startDateObj = new Date(start + 'T00:00:00');
          const endDateObj = new Date(end + 'T23:59:59.999');
          
          if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            throw new Error('Dates invalides');
          }
          
          // Vérifier que la date de fin n'est pas après aujourd'hui
          if (endDateObj > now) {
            endDateObj.setTime(now.getTime());
          }
          
          return {
            start: startDateObj,
            end: endDateObj
          };
        } catch (error) {
          console.warn('Erreur dans les dates personnalisées, utilisation de la période par défaut');
          // Période par défaut : 7 derniers jours
          const defaultStart = new Date();
          defaultStart.setDate(now.getDate() - 7);
          defaultStart.setHours(0, 0, 0, 0);
          return {
            start: defaultStart,
            end: now
          };
        }
      }
      // Si pas de dates, retourner période par défaut
      const defaultStart = new Date();
      defaultStart.setDate(now.getDate() - 7);
      defaultStart.setHours(0, 0, 0, 0);
      return {
        start: defaultStart,
        end: now
      };
      
    default:
      // Par défaut : 7 derniers jours
      startDate.setDate(now.getDate() - 7);
  }
  
  return {
    start: startDate,
    end: now
  };
};

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "en attente",
      confirmed: "confirmée",
      shipped: "expédiée",
      delivered: "livrée",
      cancelled: "annulée",
    };
    return statusMap[status] || status;
  };

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  const formatTimeAgo = (timestamp: string): string => {
    try {
      const now = new Date();
      const time = new Date(timestamp);

      // Validation de la date
      if (isNaN(time.getTime())) {
        return "Date invalide";
      }

      const diffInMinutes = Math.floor(
        (now.getTime() - time.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "À l'instant";
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
      if (diffInMinutes < 1440)
        return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
      return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
    } catch (error) {
      return "Date invalide";
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "user":
        return User;
      case "product":
        return Package;
      case "payment":
        return DollarSign;
      case "delivery":
        return Truck;
      case "stock":
        return AlertTriangle;
      case "sales":
        return TrendingUp;
      default:
        return Clock;
    }
  };

  const getStatusIcon = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return XCircle;
      case "info":
        return BarChart3;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getActivityTypeColor = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-600";
      case "user":
        return "bg-purple-100 text-purple-600";
      case "product":
        return "bg-orange-100 text-orange-600";
      case "payment":
        return "bg-green-100 text-green-600";
      case "delivery":
        return "bg-indigo-100 text-indigo-600";
      case "stock":
        return "bg-red-100 text-red-600";
      case "sales":
        return "bg-emerald-100 text-emerald-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Fonction pour parser les dates en toute sécurité
  const safeParseDate = (dateString: string): Date | null => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const recentActivities = useMemo((): Activity[] => {
    const activities: Activity[] = [];
    const now = new Date();
    const filterDate = getFilterDate(dateRange, customStartDate, customEndDate);

    // Activités des commandes avec tous les statuts
    orders.forEach((order) => {
      const orderDate = safeParseDate(order.created_at);
      if (
        !orderDate ||
        orderDate < filterDate.start ||
        orderDate > filterDate.end
      )
        return;

      // Nouvelle commande
      activities.push({
        id: order.id,
        type: "order",
        action: "new_order",
        description: `Nouvelle commande #${order.id.slice(0, 8)}`,
        user: order.user?.email || order.customer_phone,
        amount: order.total_amount,
        timestamp: order.created_at,
        status:
          order.status === "cancelled"
            ? "error"
            : order.status === "pending"
            ? "warning"
            : "success",
        metadata: {
          orderId: order.id,
          status: order.status,
          itemsCount: order.order_items?.length || 0,
          paymentMethod: order.payment_method,
        },
      });

      // Changements de statut des commandes
      if (order.updated_at && order.updated_at !== order.created_at) {
        const updateDate = safeParseDate(order.updated_at);
        if (
          updateDate &&
          updateDate >= filterDate.start &&
          updateDate <= filterDate.end
        ) {
          activities.push({
            id: `${order.id}-status`,
            type: "order",
            action: "status_change",
            description: `Commande #${order.id.slice(0, 8)} ${getStatusText(
              order.status
            )}`,
            user: order.processed_by?.email || order.assistant_name,
            timestamp: order.updated_at,
            status:
              order.status === "delivered"
                ? "success"
                : order.status === "cancelled"
                ? "error"
                : "info",
            metadata: {
              orderId: order.id,
              fromStatus: "pending",
              toStatus: order.status,
              processedBy: order.processed_by?.full_name,
            },
          });
        }
      }

      // Paiements
      if (order.payment_status === "paid") {
        const paymentDate = order.updated_at || order.created_at;
        const parsedPaymentDate = safeParseDate(paymentDate);
        if (
          parsedPaymentDate &&
          parsedPaymentDate >= filterDate.start &&
          parsedPaymentDate <= filterDate.end
        ) {
          activities.push({
            id: `${order.id}-payment`,
            type: "payment",
            action: "payment_received",
            description: `Paiement reçu pour la commande #${order.id.slice(
              0,
              8
            )}`,
            user: order.user?.email || order.customer_phone,
            amount: order.total_amount,
            timestamp: paymentDate,
            status: "success",
            metadata: {
              orderId: order.id,
              paymentMethod: order.payment_method,
              paymentProof: order.payment_proof,
            },
          });
        }
      }

      // Livraisons
      if (order.status === "delivered" && order.delivered_at) {
        const deliveryDate = safeParseDate(order.delivered_at);
        if (
          deliveryDate &&
          deliveryDate >= filterDate.start &&
          deliveryDate <= filterDate.end
        ) {
          activities.push({
            id: `${order.id}-delivery`,
            type: "delivery",
            action: "order_delivered",
            description: `Commande #${order.id.slice(0, 8)} livrée`,
            user: order.delivered_by_name,
            timestamp: order.delivered_at,
            status: "success",
            metadata: {
              orderId: order.id,
              deliveredBy: order.delivered_by_name,
              location: order.delivery_location_name,
            },
          });
        }
      }
    });

    // Activités des utilisateurs
    users.forEach((user) => {
      const userDate = safeParseDate(user.created_at);
      if (!userDate || userDate < filterDate.start || userDate > filterDate.end)
        return;

      activities.push({
        id: user.id,
        type: "user",
        action: "user_registered",
        description: `Nouvel utilisateur inscrit - ${user.role}`,
        user: user.email,
        timestamp: user.created_at,
        status: "success",
        metadata: {
          userId: user.id,
          role: user.role,
          phone: user.phone,
        },
      });

      // Mises à jour de profil
      if (user.updated_at && user.updated_at !== user.created_at) {
        const updateDate = safeParseDate(user.updated_at);
        if (
          updateDate &&
          updateDate >= filterDate.start &&
          updateDate <= filterDate.end
        ) {
          activities.push({
            id: `${user.id}-update`,
            type: "user",
            action: "profile_updated",
            description: `Profil utilisateur mis à jour`,
            user: user.email,
            timestamp: user.updated_at,
            status: "info",
            metadata: {
              userId: user.id,
              changes: ["profile_update"],
            },
          });
        }
      }
    });

    // Activités des produits
    products.forEach((product) => {
      const productTimestamp = product.updated_at || product.created_at;
      const productDate = safeParseDate(productTimestamp);
      if (
        !productDate ||
        productDate < filterDate.start ||
        productDate > filterDate.end
      )
        return;

      // Alertes stock faible
      if (product.stock_quantity < 10) {
        activities.push({
          id: product.id,
          type: "stock",
          action: "low_stock",
          description: `Stock faible pour ${product.name}`,
          timestamp: productTimestamp,
          status: "warning",
          metadata: {
            productId: product.id,
            productName: product.name,
            currentStock: product.stock_quantity,
            threshold: 10,
          },
        });
      }

      // Produit épuisé
      if (product.stock_quantity === 0) {
        activities.push({
          id: `${product.id}-outofstock`,
          type: "stock",
          action: "out_of_stock",
          description: `${product.name} épuisé`,
          timestamp: productTimestamp,
          status: "error",
          metadata: {
            productId: product.id,
            productName: product.name,
          },
        });
      }

      // Nouveaux produits
      const isNewProduct =
        now.getTime() - productDate.getTime() < 7 * 24 * 60 * 60 * 1000;
      if (isNewProduct) {
        activities.push({
          id: `${product.id}-new`,
          type: "product",
          action: "product_added",
          description: `Nouveau produit ajouté: ${product.name}`,
          timestamp: product.created_at,
          status: "success",
          metadata: {
            productId: product.id,
            productName: product.name,
            price: product.price,
            category: product.category_name,
          },
        });
      }
    });

    // Activités de vente et statistiques
    if (revenueStats) {
      // Tendances de vente
      activities.push({
        id: "sales-trend",
        type: "sales",
        action: "revenue_update",
        description: `Revenu mensuel: ${formatXOF(
          revenueStats.monthlyRevenue
        )}`,
        timestamp: now.toISOString(),
        status: revenueStats.revenueGrowth > 0 ? "success" : "warning",
        metadata: {
          monthlyRevenue: revenueStats.monthlyRevenue,
          growth: revenueStats.revenueGrowth,
          totalOrders: revenueStats.totalOrders,
        },
      });

      // Meilleur produit du mois
      const bestSellingProduct = productSales[0];
      if (bestSellingProduct) {
        activities.push({
          id: "best-product",
          type: "sales",
          action: "best_seller",
          description: `Produit le plus vendu: ${bestSellingProduct.product_name}`,
          timestamp: now.toISOString(),
          status: "success",
          metadata: {
            productName: bestSellingProduct.product_name,
            quantitySold: bestSellingProduct.quantity_sold,
            revenue: bestSellingProduct.total_revenue,
          },
        });
      }
    }

    // Activités de vente quotidiennes - CORRECTION ICI
    dailySales.forEach((sale) => {
      if (sale.revenue > 0 && sale.date) {
        try {
          // Gestion sécurisée de la date des ventes quotidiennes
          let saleDate: Date;

          if (typeof sale.date === "string") {
            // Si c'est une chaîne de caractères, essayer de la parser
            saleDate = new Date(sale.date);
            if (isNaN(saleDate.getTime())) {
              // Si le parsing échoue, utiliser la date actuelle
              saleDate = new Date();
            }
          } else if ((sale.date as any) instanceof Date) {
            // Si c'est déjà un objet Date (cast to any to satisfy TS)
            saleDate = sale.date as Date;
          } else if (typeof sale.date === "number") {
            // Si la date est stockée en timestamp (nombre)
            saleDate = new Date(sale.date);
            if (isNaN(saleDate.getTime())) {
              saleDate = new Date();
            }
          } else {
            // Sinon, utiliser la date actuelle
            saleDate = new Date();
          }

          // Vérifier que la date est dans la période filtrée
          if (saleDate >= filterDate.start && saleDate <= filterDate.end) {
            activities.push({
              id: `daily-${saleDate.toISOString()}`,
              type: "sales",
              action: "daily_sales",
              description: `Ventes du ${saleDate.toLocaleDateString(
                "fr-FR"
              )}: ${formatXOF(sale.revenue)} (${sale.orders} commandes)`,
              timestamp: saleDate.toISOString(),
              status: "info",
              metadata: {
                date: saleDate.toLocaleDateString("fr-FR"),
                revenue: sale.revenue,
                orders: sale.orders,
              },
            });
          }
        } catch (error) {
          console.warn("Erreur de traitement des ventes quotidiennes:", error);
          // Ignorer cette entrée en cas d'erreur
        }
      }
    });

    return activities.sort((a, b) => {
      const dateA = safeParseDate(a.timestamp) || new Date(0);
      const dateB = safeParseDate(b.timestamp) || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [
    orders,
    users,
    products,
    revenueStats,
    productSales,
    dailySales,
    dateRange,
    customStartDate,
    customEndDate,
  ]);

  // Le reste du code reste inchangé...
  const filteredActivities = useMemo(() => {
    return recentActivities.filter((activity) => {
      const matchesType =
        activityFilter === "all" || activity.type === activityFilter;
      const matchesSearch =
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.user &&
          activity.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.metadata?.productName &&
          activity.metadata.productName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [recentActivities, activityFilter, searchTerm]);

  const loading =
    ordersLoading ||
    usersLoading ||
    productsLoading ||
    revenueLoading ||
    salesLoading ||
    dailySalesLoading ||
    trendLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Activité Récente
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Historique complet des activités sur la plateforme
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Sélecteur de période */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="custom">Période personnalisée</option>
          </select>

          {dateRange === "custom" && (
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  max={customEndDate || new Date().toISOString().split("T")[0]}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-600 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  max={new Date().toISOString().split("T")[0]}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Filtres d'activité */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <button
          onClick={() => setActivityFilter("all")}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
            activityFilter === "all"
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Toutes ({recentActivities.length})
        </button>
        {[
          {
            type: "order" as const,
            label: "Commandes",
            count: recentActivities.filter((a) => a.type === "order").length,
          },
          {
            type: "user" as const,
            label: "Utilisateurs",
            count: recentActivities.filter((a) => a.type === "user").length,
          },
          {
            type: "product" as const,
            label: "Produits",
            count: recentActivities.filter((a) => a.type === "product").length,
          },
          {
            type: "payment" as const,
            label: "Paiements",
            count: recentActivities.filter((a) => a.type === "payment").length,
          },
          {
            type: "delivery" as const,
            label: "Livraisons",
            count: recentActivities.filter((a) => a.type === "delivery").length,
          },
          {
            type: "stock" as const,
            label: "Stock",
            count: recentActivities.filter((a) => a.type === "stock").length,
          },
          {
            type: "sales" as const,
            label: "Ventes",
            count: recentActivities.filter((a) => a.type === "sales").length,
          },
        ].map(({ type, label, count }) => (
          <button
            key={type}
            onClick={() => setActivityFilter(type)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
              activityFilter === type
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Liste des activités */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Dernières Activités
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {filteredActivities.slice(0, 50).map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const StatusIcon = getStatusIcon(activity.status);

              return (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg ${getActivityTypeColor(
                        activity.type
                      )}`}
                    >
                      <ActivityIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                            par {activity.user}
                          </p>
                        )}
                        {/* Métadonnées supplémentaires */}
                        {activity.metadata && (
                          <div className="mt-1 space-y-0.5">
                            {activity.metadata.itemsCount && (
                              <span className="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs mr-1">
                                {activity.metadata.itemsCount} articles
                              </span>
                            )}
                            {activity.metadata.paymentMethod && (
                              <span className="inline-block bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-xs mr-1">
                                {activity.metadata.paymentMethod}
                              </span>
                            )}
                            {activity.metadata.currentStock !== undefined && (
                              <span className="inline-block bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">
                                Stock: {activity.metadata.currentStock}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                          {formatTimeAgo(activity.timestamp)} •
                          {new Date(activity.timestamp).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2 mt-1 sm:mt-0">
                        {activity.amount && (
                          <span className="text-xs sm:text-sm font-semibold text-green-600 whitespace-nowrap">
                            {formatXOF(activity.amount)}
                          </span>
                        )}
                        {activity.status && (
                          <span
                            className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(
                              activity.status
                            )}`}
                          >
                            <StatusIcon className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                            {activity.status === "success" && "Succès"}
                            {activity.status === "warning" && "Attention"}
                            {activity.status === "error" && "Erreur"}
                            {activity.status === "info" && "Info"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-lg flex-shrink-0 mt-0.5 sm:mt-0"
                    title="Voir les détails"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2 sm:mb-4" />
              <p className="text-gray-500 text-sm sm:text-lg">
                Aucune activité trouvée
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Aucune activité ne correspond à vos critères de recherche
              </p>
            </div>
          )}

          {filteredActivities.length > 50 && (
            <div className="text-center mt-4 sm:mt-6">
              <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                Charger plus d'activités ({filteredActivities.length - 50}{" "}
                restantes)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques détaillées des activités */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-blue-100 text-blue-600 mb-1 sm:mb-2">
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "order").length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Commandes</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-green-100 text-green-600 mb-1 sm:mb-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "payment").length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Paiements</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-purple-100 text-purple-600 mb-1 sm:mb-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "user").length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Utilisateurs</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-orange-100 text-orange-600 mb-1 sm:mb-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "product").length}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">Produits</p>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 mb-2">
            <Truck className="h-4 w-4" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "delivery").length}
          </p>
          <p className="text-xs text-gray-600">Livraisons</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 mb-2">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "stock").length}
          </p>
          <p className="text-xs text-gray-600">Alertes Stock</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 mb-2">
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {recentActivities.filter((a) => a.type === "sales").length}
          </p>
          <p className="text-xs text-gray-600">Statistiques</p>
        </div>
      </div>
    </div>
  );
}
