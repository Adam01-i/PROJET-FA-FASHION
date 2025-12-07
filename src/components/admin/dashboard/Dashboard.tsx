import React, { useState, useEffect } from "react";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
// Hooks pour récupérer les données
import { useProducts } from "../../../hooks/useProducts";
import { useOrders } from "../../../hooks/useOrders";
import { useUsers } from "../../../hooks/useUsers";
import { useProductSales } from "../../../hooks/useProductSales";
import { useDailySales } from "../../../hooks/useDailySales";

// Sections du dashboard
import RevenueSection from "./sections/RevenueSection";
import OrdersSection from "../../ordersSection/OrdersSection";
import UsersSection from "../sideBar/contentSections/UsersSection";
import ProductsSection from "../sideBar/contentSections/ProductsSection";
import SalesPerformanceSection from "./sections/SalesPerformanceSection";
import RecentActivitySection from "./sections/RecentActivitySection";
import PopularProductsSection from "./sections/PopularProductsSection";

// Types pour les données du dashboard
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: "order" | "user" | "product";
  description: string;
  time: string;
  amount?: number;
}

interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

export type DashboardSection =
  | "overview"
  | "revenue"
  | "orders"
  | "users"
  | "products"
  | "sales-performance"
  | "recent-activity"
  | "popular-products"
  | "performance"
  | "goals";

export default function Dashboard() {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { users } = useUsers();
  const { productSales } = useProductSales();
  const [searchTerm] = useState("");
  const [, setIsAddModalOpen] = useState(false);

  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    conversionRate: 0,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );

  const { dailySales, loading: dailySalesLoading } = useDailySales(timeRange);

  // Calcul des statistiques
  useEffect(() => {
    // Calcul des statistiques réelles
    const confirmedOrders = orders.filter(
      (order) => order.status === "confirmed" || order.status === "delivered"
    );
    const totalRevenue = confirmedOrders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const totalOrders = confirmedOrders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Calcul des croissances réelles (comparaison avec période précédente)
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(currentDate.getMonth() - 1);

    // Commandes du mois dernier
    const lastMonthOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return (
        orderDate >= lastMonthDate &&
        orderDate < currentDate &&
        order.status === "confirmed"
      );
    });

    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const lastMonthOrderCount = lastMonthOrders.length;

    // Calcul des pourcentages de croissance
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : totalRevenue > 0
        ? 100
        : 0;

    const ordersGrowth =
      lastMonthOrderCount > 0
        ? ((totalOrders - lastMonthOrderCount) / lastMonthOrderCount) * 100
        : totalOrders > 0
        ? 100
        : 0;

    // Croissance utilisateurs (simplifiée)
    const lastMonthUsers = users.filter((user) => {
      const userDate = new Date(user.created_at);
      return userDate >= lastMonthDate && userDate < currentDate;
    }).length;

    const usersGrowth =
      lastMonthUsers > 0
        ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100
        : totalUsers > 0
        ? 100
        : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      ordersGrowth: Number(ordersGrowth.toFixed(1)),
      usersGrowth: Number(usersGrowth.toFixed(1)),
      conversionRate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0,
    });

    // Génération des activités récentes
    const activities: RecentActivity[] = [
      ...confirmedOrders.slice(0, 3).map((order) => ({
        id: order.id,
        type: "order" as const,
        description: `Nouvelle commande #${order.id.slice(0, 8)}`,
        time: new Date(order.created_at).toLocaleDateString("fr-FR"),
        amount: order.total_amount,
      })),
      ...users.slice(0, 2).map((user) => ({
        id: user.id,
        type: "user" as const,
        description: `Nouvel utilisateur ${user.full_name || user.email}`,
        time: new Date(user.created_at).toLocaleDateString("fr-FR"),
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    setRecentActivities(activities);
  }, [products, orders, users]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  // Fonction utilitaire pour les données par défaut
  const getSafeDailySales = (sales: DailySale[]) => {
    if (sales.length > 0) return sales;

    // Données par défaut quand il n'y a pas de données
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        revenue: 0,
        orders: 0,
      };
    });
  };

  // Utiliser dans le graphique
  const safeDailySales = getSafeDailySales(dailySales);

  const StatCard = ({
    title,
    value,
    growth,
    icon: Icon,
    color = "blue",
    onClick,
  }: {
    title: string;
    value: string | number;
    growth: number;
    icon: React.ElementType;
    color?: "blue" | "green" | "purple" | "orange";
    onClick?: () => void;
  }) => {
    const colorClasses = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-green-500 to-emerald-500",
      purple: "from-purple-500 to-violet-500",
      orange: "from-orange-500 to-amber-500",
    };

    const growthColor = growth >= 0 ? "text-green-600" : "text-red-600";
    const GrowthIcon = growth >= 0 ? ArrowUp : ArrowDown;

    return (
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div
            className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-md sm:shadow-lg group-hover:shadow-lg sm:group-hover:shadow-xl transition-shadow`}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div
              className={`flex items-center text-xs sm:text-sm font-medium ${growthColor}`}
            >
              <GrowthIcon className="h-3 w-3 mr-0.5 sm:mr-1" />
              {Math.abs(growth)}%
            </div>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          <div className="flex items-end justify-between">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {typeof value === "number" && title.includes("Revenue")
                ? formatXOF(value)
                : value}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 sm:mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
            <div
              className={`h-1 sm:h-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000`}
              style={{ width: `${Math.min(Math.abs(growth) * 8, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Top produits basés sur les ventes
  const topProducts = productSales
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 3);

  // Fonction pour rendre la section active
  const renderActiveSection = () => {
    switch (activeSection) {
      case "revenue":
        return <RevenueSection />;
      case "orders":
        return <OrdersSection searchTerm={searchTerm} />;
      case "users":
        return <UsersSection searchTerm={searchTerm} />;
      case "products":
        return (
          <ProductsSection
            searchTerm={searchTerm}
            onAddClick={() => setIsAddModalOpen(true)}
          />
        );
      case "sales-performance":
        return <SalesPerformanceSection />;
      case "recent-activity":
        return <RecentActivitySection />;
      case "popular-products":
        return <PopularProductsSection />;
      case "overview":
      default:
        return renderOverview();
    }
  };

  // Gestion du loading
  if (dailySalesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header avec filtres */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["day", "week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range === "day" && "Auj."}
                {range === "week" && "Sem."}
                {range === "month" && "Mois"}
                {range === "year" && "Année"}
              </button>
            ))}
          </div>

          <button className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Filtres
          </button>

          <button className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Grid des statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Revenue Total"
          value={stats.totalRevenue}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="green"
          onClick={() => setActiveSection("revenue")}
        />

        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          growth={stats.ordersGrowth}
          icon={ShoppingCart}
          color="blue"
          onClick={() => setActiveSection("orders")}
        />

        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          growth={stats.usersGrowth}
          icon={Users}
          color="purple"
          onClick={() => setActiveSection("users")}
        />

        <StatCard
          title="Produits Populaires"
          value={
            topProducts.length > 0 ? `${topProducts[0].product_name}` : "Aucun"
          }
          growth={topProducts.length > 0 ? 15.8 : 0}
          icon={Package}
          color="orange"
          onClick={() => setActiveSection("popular-products")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Graphique des ventes */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Performance des Ventes
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Aperçu des revenus et commandes
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-1 sm:mr-2"></div>
                  <span className="text-gray-600">Revenus</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1 sm:mr-2"></div>
                  <span className="text-gray-600">Commandes</span>
                </div>
              </div>
              <button
                onClick={() => setActiveSection("sales-performance")}
                className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors self-start sm:self-auto"
              >
                Voir détails
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bar chart simplifié avec données réelles */}
            <div className="flex items-end justify-between h-32 sm:h-48">
              {safeDailySales.length > 0 ? (
                safeDailySales.slice(-7).map((day, index) => {
                  // Calcul dynamique des hauteurs basé sur les données réelles
                  const maxRevenue = Math.max(...safeDailySales.map(d => d.revenue), 1);
                  const maxOrders = Math.max(...safeDailySales.map(d => d.orders), 1);
                  
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1 mx-0.5 sm:mx-1"
                    >
                      <div className="flex items-end space-x-0.5 sm:space-x-1 h-20 sm:h-32 w-full justify-center">
                        <div
                          className="w-3/4 bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                          style={{ 
                            height: `${(day.revenue / maxRevenue) * 80}%`,
                            minHeight: '4px'
                          }}
                          title={`Revenu: ${formatXOF(day.revenue)}`}
                        />
                        <div
                          className="w-3/4 bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer"
                          style={{ 
                            height: `${(day.orders / maxOrders) * 80}%`,
                            minHeight: '4px'
                          }}
                          title={`Commandes: ${day.orders}`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {day.date}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  Aucune donnée de vente disponible
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Activités Récentes
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Dernières actions sur la plateforme
              </p>
            </div>
            <button
              onClick={() => setActiveSection("recent-activity")}
              className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors self-start sm:self-auto"
            >
              Tout voir
              <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => {
                  if (activity.type === "order") setActiveSection("orders");
                  else if (activity.type === "user") setActiveSection("users");
                  else if (activity.type === "product")
                    setActiveSection("products");
                }}
              >
                <div
                  className={`
                p-1.5 sm:p-2 rounded-lg flex-shrink-0
                ${activity.type === "order" ? "bg-blue-100 text-blue-600" : ""}
                ${
                  activity.type === "user"
                    ? "bg-purple-100 text-purple-600"
                    : ""
                }
                ${
                  activity.type === "product"
                    ? "bg-orange-100 text-orange-600"
                    : ""
                }
              `}
                >
                  {activity.type === "order" && (
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  {activity.type === "user" && (
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  {activity.type === "product" && (
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                    {activity.time}
                  </p>
                  {activity.amount && (
                    <p className="text-xs font-semibold text-green-600 mt-0.5 sm:mt-1">
                      {formatXOF(activity.amount)}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 sm:mt-1" />
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveSection("recent-activity")}
            className="w-full mt-3 sm:mt-4 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Voir toutes les activités
          </button>
        </div>
      </div>

      {/* Section produits à faible stock */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Alertes Stock
          </h3>
          <button
            onClick={() => setActiveSection("products")}
            className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors self-start sm:self-auto"
          >
            Gérer stock
            <ArrowRight className="h-3 w-3 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products
            .filter((product) => product.stock_quantity < 10)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product.id}
                className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer group"
                onClick={() => setActiveSection("products")}
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-orange-600 font-semibold">
                    Stock: {product.stock_quantity} unités
                  </p>
                </div>
                <ArrowRight className="h-3 w-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            ))}

          {products.filter((product) => product.stock_quantity < 10).length ===
            0 && (
            <div className="col-span-4 text-center py-3 sm:py-4">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 mx-auto mb-1 sm:mb-2" />
              <p className="text-xs sm:text-sm text-gray-500">
                Aucun produit en stock faible
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {activeSection !== "overview" && (
        <button
          onClick={() => setActiveSection("overview")}
          className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Retour au tableau de bord</span>
        </button>
      )}
      {renderActiveSection()}
    </div>
  );
}