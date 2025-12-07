// components/dashboard/sections/RevenueSection.tsx
import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  BarChart3,
  Users,
} from "lucide-react";
import { useProductSales } from "../../../../hooks/useProductSales";
import { useRevenueStats } from "../../../../hooks/useRevenueStats";

export default function RevenueSection() {
  const { productSales, loading: salesLoading } = useProductSales();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const { stats, loading: statsLoading, error } = useRevenueStats(timeRange);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  if (statsLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Erreur de chargement des données de revenue</p>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Calculer les hauteurs pour le graphique basé sur les données réelles
  const maxRevenue = Math.max(...stats.dailyTrend.map((d) => d.revenue), 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">
            Revenue et Finances
          </h1>
          <p className="text-gray-600 mt-1 text-xs xs:text-sm sm:text-base">
            Analyse détaillée des revenus et performances financières
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 w-full xs:w-auto">
            {(["day", "week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 xs:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
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

          <button className="flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md w-full xs:w-auto">
            <Download className="h-3 w-3 mr-1" />
            Exporter
          </button>
        </div>
      </div>

      {/* Métriques principales - Version vraiment mobile-first */}
      <div className="grid grid-cols-1 xs:grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Revenue Total */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm sm:shadow-md lg:shadow-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <span
              className={`flex items-center text-xs font-medium ${
                stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(stats.revenueGrowth)}%
            </span>
          </div>
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
            Revenue Total
          </h3>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">
            {formatXOF(stats.totalRevenue)}
          </p>
        </div>

        {/* Panier Moyen */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm sm:shadow-md lg:shadow-lg w-fit mb-2 sm:mb-3 lg:mb-4">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
            Panier Moyen
          </h3>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
            {formatXOF(stats.averageOrderValue)}
          </p>
        </div>

        {/* Revenue Mensuel */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 shadow-sm sm:shadow-md lg:shadow-lg w-fit mb-2 sm:mb-3 lg:mb-4">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
            Revenue Mensuel
          </h3>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
            {formatXOF(stats.monthlyRevenue)}
          </p>
        </div>

        {/* Clients */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="p-1.5 sm:p-2 lg:p-3 rounded-md sm:rounded-lg lg:rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm sm:shadow-md lg:shadow-lg w-fit mb-2 sm:mb-3 lg:mb-4">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
          </div>
          <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
            Clients
          </h3>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">
            {stats.totalCustomers}
          </p>
        </div>
      </div>

      {/* Graphiques et répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Répartition par catégorie */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3">
            Répartition par Catégorie
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {stats.revenueByCategory.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-700 truncate flex-1 mr-2 max-w-[100px] xs:max-w-[140px] sm:max-w-none">
                    {category.category}
                  </span>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-gray-900 whitespace-nowrap text-xs">
                      {formatXOF(category.revenue)}
                    </span>
                    <span className="text-gray-500 text-xs hidden xs:inline">
                      ({category.orderCount})
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                    style={{
                      width: `${
                        (category.revenue / stats.totalRevenue) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Évolution du revenue */}
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3">
            Évolution du Revenue
          </h3>
          <div className="space-y-3">
            <div className="flex items-end justify-between h-20 xs:h-24 sm:h-32 lg:h-40 pt-2">
              {stats.dailyTrend.slice(-7).map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-1 flex-1 mx-0.5"
                >
                  <div
                    className="w-3/4 xs:w-4/5 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all duration-500 hover:from-green-600 hover:to-emerald-500 cursor-pointer"
                    style={{
                      height: `${(day.revenue / maxRevenue) * 70}%`,
                      minHeight: "2px",
                    }}
                    title={`${day.date}: ${formatXOF(day.revenue)}`}
                  />
                  <span className="text-[10px] xs:text-xs text-gray-500 font-medium truncate">
                    {day.date.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-gray-500">
              {stats.dailyTrend.length} jours de données
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des meilleurs produits */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3">
          Top Produits par Revenue
        </h3>
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full min-w-[400px] sm:min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-sm sm:text-base lg:text-lg font-medium text-gray-600 whitespace-nowrap">
                  Produit
                </th>
                <th className="text-left py-2 px-1 text-sm sm:text-base lg:text-lg font-medium text-gray-600 whitespace-nowrap hidden xs:table-cell">
                  Catégorie
                </th>
                <th className="text-left py-2 px-1 text-sm sm:text-base lg:text-lg font-medium text-gray-600 whitespace-nowrap">
                  Qté
                </th>
                <th className="text-left py-2 px-1 text-sm sm:text-base lg:text-lg font-medium text-gray-600 whitespace-nowrap">
                  Revenue
                </th>
                <th className="text-left py-2 px-1 text-sm sm:text-base lg:text-lgfont-medium text-gray-600 whitespace-nowrap">
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
                  <td className="py-2 px-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      {sale.image_url && (
                        <img
                          src={sale.image_url}
                          alt={sale.product_name}
                          className="w-5 h-5 xs:w-6 xs:h-6 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <span className="font-medium text-gray-900 text-sm sm:text-basetruncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                        {sale.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-1 hidden xs:table-cell">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] xs:text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-[60px]">
                      {sale.category}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-gray-600 text-xs text-center whitespace-nowrap">
                    {sale.quantity_sold}
                  </td>
                  <td className="py-2 px-1 font-semibold text-gray-900 text-xs whitespace-nowrap">
                    {formatXOF(sale.total_revenue)}
                  </td>
                  <td className="py-2 px-1">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] xs:text-xs font-medium ${
                        sale.stock_quantity > 10
                          ? "bg-green-100 text-green-800"
                          : sale.stock_quantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sale.stock_quantity}
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
