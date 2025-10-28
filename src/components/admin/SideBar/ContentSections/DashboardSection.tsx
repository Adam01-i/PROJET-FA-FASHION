// src/components/admin/SideBar/ContentSections/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, ShoppingCart, Package, DollarSign, 
  Eye, ShoppingBag, ArrowUp, ArrowDown,
  MoreVertical, Download, Filter
} from 'lucide-react';
import { useProducts } from '../../../../hooks/useProducts';
import { useOrders } from '../../../../hooks/useOrders';
import { useUsers } from '../../../../hooks/useUsers';

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
  type: 'order' | 'user' | 'product';
  description: string;
  time: string;
  amount?: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export default function DashboardSection() {
  const { products } = useProducts();
  const { orders } = useOrders();
  const { users } = useUsers();
  
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    conversionRate: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  // Calcul des statistiques
  useEffect(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    // Calcul des croissance (simulées pour l'exemple)
    const revenueGrowth = 12.5;
    const ordersGrowth = 8.2;
    const usersGrowth = 15.7;
    const conversionRate = 3.2;

    setStats({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueGrowth,
      ordersGrowth,
      usersGrowth,
      conversionRate
    });

    // Génération des activités récentes
    const activities: RecentActivity[] = [
      ...orders.slice(0, 3).map(order => ({
        id: order.id,
        type: 'order' as const,
        description: `Nouvelle commande #${order.id.slice(0, 8)}`,
        time: new Date(order.created_at).toLocaleDateString('fr-FR'),
        amount: order.total_amount
      })),
      ...users.slice(0, 2).map(user => ({
        id: user.id,
        type: 'user' as const,
        description: `Nouvel utilisateur ${user.email}`,
        time: new Date(user.created_at).toLocaleDateString('fr-FR')
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    setRecentActivities(activities);

    // Génération des données de vente (simulées)
    const generatedSalesData: SalesData[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: Math.floor(Math.random() * 10000) + 5000,
        orders: Math.floor(Math.random() * 20) + 5
      };
    });

    setSalesData(generatedSalesData);
  }, [products, orders, users]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    growth: number;
    icon: React.ElementType;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-violet-500',
      orange: 'from-orange-500 to-amber-500'
    };

    const growthColor = growth >= 0 ? 'text-green-600' : 'text-red-600';
    const GrowthIcon = growth >= 0 ? ArrowUp : ArrowDown;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg group-hover:shadow-xl transition-shadow`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </h3>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' && title.includes('Revenue') ? formatXOF(value) : value}
            </p>
            <div className={`flex items-center text-sm font-medium ${growthColor}`}>
              <GrowthIcon className="h-3 w-3 mr-1" />
              {Math.abs(growth)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000`}
              style={{ width: `${Math.min(Math.abs(growth) * 8, 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec filtres */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Aperçu de votre performance commerciale</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === 'day' && 'Aujourd\'hui'}
                {range === 'week' && 'Semaine'}
                {range === 'month' && 'Mois'}
                {range === 'year' && 'Année'}
              </button>
            ))}
          </div>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </button>
          
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Grid des statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Total"
          value={stats.totalRevenue}
          growth={stats.revenueGrowth}
          icon={DollarSign}
          color="green"
        />
        
        <StatCard
          title="Commandes"
          value={stats.totalOrders}
          growth={stats.ordersGrowth}
          icon={ShoppingCart}
          color="blue"
        />
        
        <StatCard
          title="Utilisateurs"
          value={stats.totalUsers}
          growth={stats.usersGrowth}
          icon={Users}
          color="purple"
        />
        
        <StatCard
          title="Taux de Conversion"
          value={`${stats.conversionRate}%`}
          growth={2.1}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique des ventes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance des Ventes</h3>
              <p className="text-gray-600 text-sm">Aperçu des revenus et commandes</p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Revenus</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-600">Commandes</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bar chart simplifié */}
            <div className="flex items-end justify-between h-48">
              {salesData.map((day, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 flex-1 mx-1">
                  <div className="flex items-end space-x-1 h-32 w-full">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${(day.revenue / 15000) * 100}%` }}
                      title={`Revenu: ${formatXOF(day.revenue)}`}
                    />
                    <div 
                      className="w-full bg-green-500 rounded-t transition-all duration-500 hover:bg-green-600 cursor-pointer"
                      style={{ height: `${(day.orders / 25) * 100}%` }}
                      title={`Commandes: ${day.orders}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Activités Récentes</h3>
              <p className="text-gray-600 text-sm">Dernières actions sur la plateforme</p>
            </div>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`
                  p-2 rounded-lg flex-shrink-0
                  ${activity.type === 'order' ? 'bg-blue-100 text-blue-600' : ''}
                  ${activity.type === 'user' ? 'bg-purple-100 text-purple-600' : ''}
                  ${activity.type === 'product' ? 'bg-orange-100 text-orange-600' : ''}
                `}>
                  {activity.type === 'order' && <ShoppingBag className="h-4 w-4" />}
                  {activity.type === 'user' && <Users className="h-4 w-4" />}
                  {activity.type === 'product' && <Package className="h-4 w-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.time}
                  </p>
                  {activity.amount && (
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      {formatXOF(activity.amount)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors">
            Voir toutes les activités
          </button>
        </div>
      </div>

      {/* Métriques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Produits populaires */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits Populaires</h3>
          <div className="space-y-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <img 
                  src={product.image_url ?? undefined} 
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatXOF(product.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {product.stock}
                  </p>
                  <p className="text-xs text-gray-500">en stock</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Taux de conversion</span>
                <span className="font-semibold text-gray-900">{stats.conversionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.conversionRate * 10}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Panier moyen</span>
                <span className="font-semibold text-gray-900">
                  {formatXOF(stats.totalRevenue / Math.max(stats.totalOrders, 1))}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Objectifs */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Objectifs du Mois</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Objectif de revenus</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-blue-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nouveaux clients</span>
                <span>60%</span>
              </div>
              <div className="w-full bg-blue-400 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            
            <button className="w-full mt-4 py-2 text-sm bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Voir les détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}