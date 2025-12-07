// components/dashboard/StatsDashboard.tsx
import {
//   Package,
  AlertTriangle,
//   DollarSign,
//   ShoppingCart,
//   Zap,
} from "lucide-react";
import { InventoryStats, LowStockAlert } from "../../../models";

interface StatsDashboardProps {
  stats: InventoryStats;
  lowStockAlerts: LowStockAlert[];
  loading?: boolean;
}

export default function StatsDashboard({
//   stats,
  lowStockAlerts,
  loading = false,
}: StatsDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

//   const statCards = [
//     {
//       title: "Valeur du Stock",
//       value: formatXOF(stats.totalValue),
//       icon: DollarSign,
//       color: "from-emerald-500 to-teal-600",
//       bgColor: "bg-emerald-50",
//       textColor: "text-emerald-700",
//       trend: "+12%",
//     },
//     {
//       title: "Ventes du Mois",
//       value: stats.currentMonthSales.toString(),
//       icon: ShoppingCart,
//       color: "from-blue-500 to-cyan-600",
//       bgColor: "bg-blue-50",
//       textColor: "text-blue-700",
//       trend: "+8%",
//     },
//     {
//       title: "Produits en Stock",
//       value: stats.totalProducts.toString(),
//       icon: Package,
//       color: "from-indigo-500 to-purple-600",
//       bgColor: "bg-indigo-50",
//       textColor: "text-indigo-700",
//       subtitle: `${stats.lowStockProducts} faible • ${stats.outOfStockProducts} rupture`,
//     },
//     {
//       title: "Ventes de la Semaine",
//       value: stats.currentWeekSales.toString(),
//       icon: Zap,
//       color: "from-amber-500 to-orange-600",
//       bgColor: "bg-amber-50",
//       textColor: "text-amber-700",
//       trend: "+15%",
//     },
//   ];

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques principales */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {card.trend && (
                  <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {card.trend}
                  </span>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:scale-105 transition-transform duration-200">
                {card.value}
              </h3>
              <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
              
              {card.subtitle && (
                <p className="text-xs text-gray-500">{card.subtitle}</p>
              )}
            </div>
          );
        })}
      </div> */}

      {/* Alertes de stock faible */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Alertes Stock Faible
                </h3>
                <p className="text-sm text-orange-700">
                  {lowStockAlerts.length} produit(s) nécessite(nt) une attention
                  immédiate
                </p>
              </div>
            </div>
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {lowStockAlerts.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockAlerts.slice(0, 6).map((alert) => (
              <div
                key={alert.product_id}
                className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {alert.product_name}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.urgency === "high"
                        ? "bg-red-100 text-red-800"
                        : alert.urgency === "medium"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {alert.current_stock} unités
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      alert.urgency === "high"
                        ? "bg-red-500 w-1/4"
                        : alert.urgency === "medium"
                        ? "bg-orange-500 w-1/2"
                        : "bg-yellow-500 w-3/4"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance des ventes */}
        {/* <div className="bg-white rounded-2xl p-6 border border-gray-200 lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Performance des Ventes</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-700">{stats.totalSales}</p>
              <p className="text-sm text-indigo-600">Ventes Totales</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{stats.assistantSales}</p>
              <p className="text-sm text-green-600">Ventes Assistants</p>
            </div>
          </div> */}
        {/* </div> */}

        {/* Statut du stock */}
        {/* <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Statut du Stock</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En stock</span>
              <span className="font-semibold text-green-600">
                {stats.totalProducts - stats.lowStockProducts - stats.outOfStockProducts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock faible</span>
              <span className="font-semibold text-yellow-600">{stats.lowStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En rupture</span>
              <span className="font-semibold text-red-600">{stats.outOfStockProducts}</span>
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </div>
  );
}

// function formatXOF(amount: number): string {
//   return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
// }
