import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Target,
  Zap,
  Clock,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useOrders } from "../../../../hooks/useOrders";
import { useUsers } from "../../../../hooks/useUsers";
import { useProducts } from "../../../../hooks/useProducts";
import { useProductSales } from "../../../../hooks/useProductSales";

interface PerformanceMetrics {
  conversionRate: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  cartAbandonmentRate: number;
  customerAcquisitionCost: number;
  retentionRate: number;
  salesVelocity: number;
  inventoryTurnover: number;
}
 type ColorType =
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "red"
    | "yellow"
    | "indigo"
    | "cyan";

export default function PerformanceMetricsSection() {
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();
  const { products, loading: productsLoading } = useProducts();
  const { productSales, loading: salesLoading } = useProductSales();
  const [timeRange, setTimeRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

 

  const performanceMetrics = useMemo((): PerformanceMetrics => {
    // Calculs basés sur les données réelles et simulées
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Métriques calculées
    const conversionRate = 3.2; // Simulation
    const averageOrderValue = totalRevenue / Math.max(totalOrders, 1);
    const customerLifetimeValue =
      (totalRevenue / Math.max(totalUsers, 1)) * 0.3; // Simulation
    const cartAbandonmentRate = 68.5; // Simulation
    const customerAcquisitionCost = 4500; // Simulation en XOF
    const retentionRate = 72.3; // Simulation
    const salesVelocity = totalOrders / 30; // Commandes par jour (simulation sur 30 jours)
    const inventoryTurnover =
      productSales.reduce((sum, sale) => sum + sale.quantity_sold, 0) /
      Math.max(totalProducts, 1);

    return {
      conversionRate,
      averageOrderValue,
      customerLifetimeValue,
      cartAbandonmentRate,
      customerAcquisitionCost,
      retentionRate,
      salesVelocity,
      inventoryTurnover,
    };
  }, [orders, users, products, productSales]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  const getTrendIndicator = (
    value: number,
    benchmark: number
  ): { direction: "up" | "down" | "stable"; color: string; text: string } => {
    const difference = value - benchmark;
    const percentage = (difference / benchmark) * 100;

    if (percentage > 10)
      return {
        direction: "up",
        color: "text-green-600",
        text: `+${percentage.toFixed(1)}%`,
      };
    if (percentage < -10)
      return {
        direction: "down",
        color: "text-red-600",
        text: `${percentage.toFixed(1)}%`,
      };
    return { direction: "stable", color: "text-yellow-600", text: "Stable" };
  };

  if (ordersLoading || usersLoading || productsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Métriques de Performance
          </h1>
          <p className="text-gray-600 mt-1">
            Indicateurs clés de performance commerciale
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["week", "month", "quarter", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range === "week" && "Semaine"}
                {range === "month" && "Mois"}
                {range === "quarter" && "Trimestre"}
                {range === "year" && "Année"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Taux de Conversion"
          value={`${performanceMetrics.conversionRate}%`}
          description="Visiteurs convertis en clients"
          icon={Target}
          color="blue"
          trend={getTrendIndicator(performanceMetrics.conversionRate, 2.8)}
        />

        <MetricCard
          title="Panier Moyen"
          value={formatXOF(performanceMetrics.averageOrderValue)}
          description="Valeur moyenne par commande"
          icon={DollarSign}
          color="green"
          trend={getTrendIndicator(performanceMetrics.averageOrderValue, 25000)}
        />

        <MetricCard
          title="Valeur Client à Vie"
          value={formatXOF(performanceMetrics.customerLifetimeValue)}
          description="Revenue moyen par client"
          icon={Users}
          color="purple"
          trend={getTrendIndicator(
            performanceMetrics.customerLifetimeValue,
            15000
          )}
        />

        <MetricCard
          title="Taux de Rétention"
          value={`${performanceMetrics.retentionRate}%`}
          description="Clients récurrents"
          icon={TrendingUp}
          color="orange"
          trend={getTrendIndicator(performanceMetrics.retentionRate, 70)}
        />
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Coût d'Acquisition"
          value={formatXOF(performanceMetrics.customerAcquisitionCost)}
          description="Coût par nouveau client"
          icon={Zap}
          color="red"
          trend={getTrendIndicator(
            performanceMetrics.customerAcquisitionCost,
            5000
          )}
        />

        <MetricCard
          title="Abandon de Panier"
          value={`${performanceMetrics.cartAbandonmentRate}%`}
          description="Paniers non finalisés"
          icon={ShoppingCart}
          color="yellow"
          trend={getTrendIndicator(performanceMetrics.cartAbandonmentRate, 65)}
        />

        <MetricCard
          title="Vitesse de Vente"
          value={`${performanceMetrics.salesVelocity.toFixed(1)}/jour`}
          description="Commandes par jour"
          icon={Clock}
          color="indigo"
          trend={getTrendIndicator(performanceMetrics.salesVelocity, 5)}
        />

        <MetricCard
          title="Rotation du Stock"
          value={`${performanceMetrics.inventoryTurnover.toFixed(1)}x`}
          description="Rotation des produits"
          icon={Package}
          color="cyan"
          trend={getTrendIndicator(performanceMetrics.inventoryTurnover, 2)}
        />
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance au fil du temps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Évolution des Métriques Clés
          </h3>
          <div className="space-y-6">
            {[
              {
                label: "Taux de Conversion",
                value: performanceMetrics.conversionRate,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: "Panier Moyen",
                value: performanceMetrics.averageOrderValue / 1000,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: "Taux de Rétention",
                value: performanceMetrics.retentionRate,
                color: "from-purple-500 to-violet-500",
              },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <span className="text-gray-900">
                    {metric.label.includes("Panier")
                      ? formatXOF(metric.value * 1000)
                      : `${metric.value}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000`}
                    style={{
                      width: `${Math.min(
                        metric.value *
                          (metric.label.includes("Panier") ? 0.4 : 1),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparaison avec les objectifs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Performance vs Objectifs
          </h3>
          <div className="space-y-6">
            {[
              {
                metric: "Conversion",
                current: performanceMetrics.conversionRate,
                target: 4.0,
              },
              {
                metric: "Rétention",
                current: performanceMetrics.retentionRate,
                target: 80,
              },
              {
                metric: "Panier Moyen",
                current: performanceMetrics.averageOrderValue / 1000,
                target: 30,
              },
              {
                metric: "Acquisition",
                current: performanceMetrics.customerAcquisitionCost / 1000,
                target: 4,
              },
            ].map((item) => {
              const percentage = (item.current / item.target) * 100;
              const isOnTarget = percentage >= 90;
              const isClose = percentage >= 75;

              return (
                <div key={item.metric} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {item.metric}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">
                        {item.metric === "Panier Moyen"
                          ? formatXOF(item.current * 1000)
                          : item.metric === "Acquisition"
                          ? formatXOF(item.current * 1000)
                          : `${item.current.toFixed(1)}%`}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500">
                        {item.metric === "Panier Moyen"
                          ? formatXOF(item.target * 1000)
                          : item.metric === "Acquisition"
                          ? formatXOF(item.target * 1000)
                          : `${item.target}%`}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        isOnTarget
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : isClose
                          ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                          : "bg-gradient-to-r from-red-500 to-pink-500"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progression</span>
                    <span
                      className={
                        isOnTarget
                          ? "text-green-600"
                          : isClose
                          ? "text-yellow-600"
                          : "text-red-600"
                      }
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Recommandations</h3>
        <div className="space-y-3">
          {performanceMetrics.cartAbandonmentRate > 60 && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-3 w-3" />
              </div>
              <p className="text-sm">
                <strong>
                  Abandon de panier élevé (
                  {performanceMetrics.cartAbandonmentRate}%)
                </strong>{" "}
                - Envisagez des emails de relance et une simplification du
                processus de paiement.
              </p>
            </div>
          )}

          {performanceMetrics.conversionRate < 3 && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Target className="h-3 w-3" />
              </div>
              <p className="text-sm">
                <strong>
                  Taux de conversion bas ({performanceMetrics.conversionRate}%)
                </strong>{" "}
                - Optimisez votre tunnel de vente et proposez des incitations à
                l'achat.
              </p>
            </div>
          )}

          {performanceMetrics.customerAcquisitionCost > 5000 && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3" />
              </div>
              <p className="text-sm">
                <strong>
                  Coût d'acquisition élevé (
                  {formatXOF(performanceMetrics.customerAcquisitionCost)})
                </strong>{" "}
                - Concentrez-vous sur le marketing de contenu et le
                référencement naturel.
              </p>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <TrendingUp className="h-3 w-3" />
            </div>
            <p className="text-sm">
              <strong>Performance globale</strong> - Votre entreprise montre une
              croissance saine. Continuez à optimiser l'expérience client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant de carte de métrique réutilisable
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: ColorType; // Utiliser le type spécifique ici
  trend: {
    direction: "up" | "down" | "stable";
    color: string;
    text: string;
  };
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  trend,
}: MetricCardProps) {
  const colorClasses: Record<ColorType, string> = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-amber-500",
    red: "from-red-500 to-pink-500",
    yellow: "from-yellow-500 to-amber-500",
    indigo: "from-indigo-500 to-blue-500",
    cyan: "from-cyan-500 to-blue-500",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className={`text-sm font-medium ${trend.color}`}>
          {trend.text}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {/* Barre de progression */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000`}
            style={{ width: `${Math.random() * 60 + 40}%` }} // Simulation de progression
          />
        </div>
      </div>
    </div>
  );
}
