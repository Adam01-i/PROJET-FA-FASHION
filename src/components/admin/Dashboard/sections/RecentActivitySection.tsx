import { useState, useMemo } from 'react';
import { 
  Clock, 
  ShoppingBag, 
  User, 
  Package, 
  DollarSign,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { useOrders } from '../../../../hooks/useOrders';
import { useUsers } from '../../../../hooks/useUsers';
import { useProducts } from '../../../../hooks/useProducts';

interface Activity {
  id: string;
  type: 'order' | 'user' | 'product' | 'payment';
  action: string;
  description: string;
  user?: string;
  amount?: number;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

export default function RecentActivitySection() {
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();
  const { products, loading: productsLoading } = useProducts();
  const [activityFilter, setActivityFilter] = useState<'all' | 'order' | 'user' | 'product' | 'payment'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const recentActivities = useMemo((): Activity[] => {
    const activities: Activity[] = [];

    // Activités des commandes
    orders.slice(0, 10).forEach(order => {
      activities.push({
        id: order.id,
        type: 'order',
        action: 'new_order',
        description: `Nouvelle commande #${order.id.slice(0, 8)}`,
        user: order.user?.email,
        amount: order.total_amount,
        timestamp: order.created_at,
        status: order.status === 'cancelled' ? 'error' : 
                order.status === 'pending' ? 'warning' : 'success'
      });

      if (order.payment_status === 'paid') {
        activities.push({
          id: `${order.id}-payment`,
          type: 'payment',
          action: 'payment_received',
          description: `Paiement reçu pour la commande #${order.id.slice(0, 8)}`,
          user: order.user?.email,
          amount: order.total_amount,
          timestamp: order.updated_at || order.created_at,
          status: 'success'
        });
      }
    });

    // Activités des utilisateurs
    users.slice(0, 5).forEach(user => {
      activities.push({
        id: user.id,
        type: 'user',
        action: 'user_registered',
        description: `Nouvel utilisateur inscrit`,
        user: user.email,
        timestamp: user.created_at,
        status: 'success'
      });
    });

    // Activités des produits
    products.slice(0, 5).forEach(product => {
      if (product.stock_quantity < 10) {
        activities.push({
          id: product.id,
          type: 'product',
          action: 'low_stock',
          description: `Stock faible pour ${product.name}`,
          timestamp: product.updated_at || product.created_at,
          status: 'warning'
        });
      }
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [orders, users, products]);

  const filteredActivities = useMemo(() => {
    return recentActivities.filter(activity => {
      const matchesType = activityFilter === 'all' || activity.type === activityFilter;
      const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (activity.user && activity.user.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [recentActivities, activityFilter, searchTerm]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'user': return User;
      case 'product': return Package;
      case 'payment': return DollarSign;
      default: return Clock;
    }
  };

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return Clock;
      case 'error': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  if (ordersLoading || usersLoading || productsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Activité Récente</h1>
          <p className="text-gray-600 mt-1">Historique des activités récentes sur la plateforme</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </button>
        </div>
      </div>

      {/* Filtres d'activité */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActivityFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activityFilter === 'all'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Toutes ({recentActivities.length})
        </button>
        {[
          { type: 'order' as const, label: 'Commandes', count: recentActivities.filter(a => a.type === 'order').length },
          { type: 'user' as const, label: 'Utilisateurs', count: recentActivities.filter(a => a.type === 'user').length },
          { type: 'product' as const, label: 'Produits', count: recentActivities.filter(a => a.type === 'product').length },
          { type: 'payment' as const, label: 'Paiements', count: recentActivities.filter(a => a.type === 'payment').length },
        ].map(({ type, label, count }) => (
          <button
            key={type}
            onClick={() => setActivityFilter(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activityFilter === type
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Liste des activités */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dernières Activités
          </h3>
          
          <div className="space-y-4">
            {filteredActivities.slice(0, 20).map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const StatusIcon = getStatusIcon(activity.status);
              
              return (
                <div 
                  key={`${activity.id}-${index}`}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'user' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'product' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className="text-sm text-gray-500 mt-1">
                            par {activity.user}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {activity.amount && (
                          <span className="text-sm font-semibold text-green-600">
                            {formatXOF(activity.amount)}
                          </span>
                        )}
                        {activity.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {activity.status === 'success' && 'Succès'}
                            {activity.status === 'warning' && 'Attention'}
                            {activity.status === 'error' && 'Erreur'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white rounded-lg">
                    <Eye className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune activité trouvée</p>
              <p className="text-gray-400 text-sm mt-1">
                Aucune activité ne correspond à vos critères de recherche
              </p>
            </div>
          )}

          {filteredActivities.length > 20 && (
            <div className="text-center mt-6">
              <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                Charger plus d'activités
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistiques des activités */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-2">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentActivities.filter(a => a.type === 'order').length}
          </p>
          <p className="text-sm text-gray-600">Commandes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-2">
            <DollarSign className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentActivities.filter(a => a.type === 'payment').length}
          </p>
          <p className="text-sm text-gray-600">Paiements</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 text-purple-600 mb-2">
            <User className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentActivities.filter(a => a.type === 'user').length}
          </p>
          <p className="text-sm text-gray-600">Utilisateurs</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 text-orange-600 mb-2">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentActivities.filter(a => a.type === 'product').length}
          </p>
          <p className="text-sm text-gray-600">Produits</p>
        </div>
      </div>
    </div>
  );
}