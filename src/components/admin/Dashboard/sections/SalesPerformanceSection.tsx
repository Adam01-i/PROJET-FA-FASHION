import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Download,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { useProductSales } from '../../../../hooks/useProductSales';
import { useOrders } from '../../../../hooks/useOrders';

interface SalesPerformanceData {
  dailySales: { date: string; revenue: number; orders: number }[];
  topCategories: { category: string; revenue: number; percentage: number }[];
  salesTrend: number;
  averageOrderValue: number;
  conversionRate: number;
}


export default function SalesPerformanceSection() {
  const { productSales, loading: salesLoading } = useProductSales();
  const { orders, loading: ordersLoading } = useOrders();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const performanceData = useMemo((): SalesPerformanceData => {
    // Générer des données de vente quotidiennes simulées
    const dailySales = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue: Math.floor(Math.random() * 100000) + 50000,
        orders: Math.floor(Math.random() * 50) + 10
      };
    });

    // Calculer les catégories principales
    const categoryRevenue = productSales.reduce((acc, sale) => {
      const category = sale.category || 'Non catégorisé';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += sale.total_revenue;
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = Object.values(categoryRevenue).reduce((sum, revenue) => sum + revenue, 0);
    const topCategories = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: (revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculer les métriques
    const totalOrdersRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const salesTrend = 12.5; // Simulation
    const averageOrderValue = totalOrdersRevenue / Math.max(orders.length, 1);
    const conversionRate = 3.2; // Simulation

    return {
      dailySales,
      topCategories,
      salesTrend,
      averageOrderValue,
      conversionRate
    };
  }, [productSales, orders]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  if (salesLoading || ordersLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Performance des Ventes</h1>
          <p className="text-gray-600 mt-1">Analyse détaillée des performances commerciales</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === 'week' && 'Semaine'}
                {range === 'month' && 'Mois'}
                {range === 'quarter' && 'Trimestre'}
                {range === 'year' && 'Année'}
              </button>
            ))}
          </div>
          
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              {performanceData.salesTrend}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Croissance des Ventes
          </h3>
          <p className="text-2xl font-bold text-gray-900">{performanceData.salesTrend}%</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg w-fit mb-4">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Panier Moyen
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatXOF(performanceData.averageOrderValue)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg w-fit mb-4">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Taux de Conversion
          </h3>
          <p className="text-2xl font-bold text-gray-900">{performanceData.conversionRate}%</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg w-fit mb-4">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Commandes
          </h3>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des ventes quotidiennes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ventes Quotidiennes
          </h3>
          <div className="space-y-4">
            <div className="flex items-end justify-between h-48">
              {performanceData.dailySales.slice(-7).map((day, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1 mx-1">
                  <div className="flex items-end space-x-1 h-32 w-full justify-center">
                    <div 
                      className="w-3/4 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-cyan-500 cursor-pointer"
                      style={{ height: `${(day.revenue / 150000) * 100}%` }}
                      title={`Revenue: ${formatXOF(day.revenue)}`}
                    />
                    <div 
                      className="w-3/4 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t transition-all duration-500 hover:from-green-600 hover:to-emerald-500 cursor-pointer"
                      style={{ height: `${(day.orders / 60) * 100}%` }}
                      title={`Commandes: ${day.orders}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{day.date}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Commandes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition par catégorie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Répartition par Catégorie
          </h3>
          <div className="space-y-4">
            {performanceData.topCategories.map((category, index) => {
              const colors = [
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-purple-500 to-violet-500',
                'from-orange-500 to-amber-500',
                'from-red-500 to-pink-500'
              ];
              
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{formatXOF(category.revenue)}</span>
                      <span className="text-gray-500">({category.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full bg-gradient-to-r ${colors[index]} transition-all duration-1000`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top produits performants */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Top 10 des Produits Performants
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Produit</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Catégorie</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Quantité Vendue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock Restant</th>
              </tr>
            </thead>
            <tbody>
              {productSales.slice(0, 10).map((product) => (
                <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.product_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.product_name}</p>
                        <p className="text-sm text-gray-500">#{product.product_id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {product.category || 'Non catégorisé'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 font-medium">{product.quantity_sold}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {formatXOF(product.total_revenue)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock_quantity > 20 
                        ? 'bg-green-100 text-green-800'
                        : product.stock_quantity > 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock_quantity} unités
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