import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BarChart3,
  PieChart,
} from "lucide-react";
import { useOrders } from "../../../../hooks/useOrders";
import { useProductSales } from "../../../../hooks/useProductSales";

interface RevenueStats {
  totalRevenue: number;
  averageOrderValue: number;
  revenueGrowth: number;
  monthlyRevenue: number;
  revenueByCategory: { category: string; revenue: number }[];
}

export default function RevenueSection() {
  const { orders, loading: ordersLoading } = useOrders();
  const { productSales } = useProductSales();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);

  useEffect(() => {
    if (orders.length > 0) {
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );
      const averageOrderValue = totalRevenue / orders.length;

      // Calculs simulés pour la croissance
      const revenueGrowth = 12.5;
      const monthlyRevenue = totalRevenue * 0.3; // 30% du total pour le mois

      // Données simulées par catégorie
      const revenueByCategory = [
        { category: "Électronique", revenue: totalRevenue * 0.4 },
        { category: "Mode", revenue: totalRevenue * 0.3 },
        { category: "Maison", revenue: totalRevenue * 0.2 },
        { category: "Autres", revenue: totalRevenue * 0.1 },
      ];

      setRevenueStats({
        totalRevenue,
        averageOrderValue,
        revenueGrowth,
        monthlyRevenue,
        revenueByCategory,
      });
    }
  }, [orders]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  if (ordersLoading || !revenueStats) {
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
            Revenue et Finances
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Analyse détaillée des revenus et performances financières
          </p>
        </div>

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

          <button className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-md sm:shadow-lg">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <span
              className={`flex items-center text-xs sm:text-sm font-medium ${
                revenueStats.revenueGrowth >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {revenueStats.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              )}
              {Math.abs(revenueStats.revenueGrowth)}%
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
            Revenue Total
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatXOF(revenueStats.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md sm:shadow-lg w-fit mb-3 sm:mb-4">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
            Panier Moyen
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatXOF(revenueStats.averageOrderValue)}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 shadow-md sm:shadow-lg w-fit mb-3 sm:mb-4">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
            Revenue Mensuel
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatXOF(revenueStats.monthlyRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-md sm:shadow-lg w-fit mb-3 sm:mb-4">
            <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2">
            Commandes
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {orders.length}
          </p>
        </div>
      </div>

      {/* Graphiques et répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Répartition par Catégorie
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {revenueStats.revenueByCategory.map((category) => (
              <div key={category.category} className="space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium text-gray-700 truncate mr-2">
                    {category.category}
                  </span>
                  <span className="text-gray-900 whitespace-nowrap">
                    {formatXOF(category.revenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="h-1.5 sm:h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                    style={{
                      width: `${
                        (category.revenue / revenueStats.totalRevenue) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Évolution du revenue */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Évolution du Revenue
          </h3>
          <div className="space-y-4">
            {/* Graphique simplifié */}
            <div className="flex items-end justify-between h-32 sm:h-48 pt-3 sm:pt-4">
              {[65, 45, 80, 60, 75, 90, 85].map((height, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1 mx-0.5 sm:mx-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all duration-500 hover:from-green-600 hover:to-emerald-500 cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des meilleurs produits */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Top Produits par Revenue
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">
                  Produit
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">
                  Quantité
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">
                  Revenue
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-600">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {productSales.slice(0, 5).map((sale) => (
                <tr
                  key={sale.product_id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {sale.image_url && (
                        <img
                          src={sale.image_url}
                          alt={sale.product_name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                        {sale.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">
                    {sale.quantity_sold}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 text-xs sm:text-sm">
                    {formatXOF(sale.total_revenue)}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sale.stock_quantity > 10
                          ? "bg-green-100 text-green-800"
                          : sale.stock_quantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sale.stock_quantity} unités
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
