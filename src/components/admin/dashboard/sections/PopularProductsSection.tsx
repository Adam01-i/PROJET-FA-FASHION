import { useState, useMemo } from 'react';
import { 
  Star, 
  TrendingUp, 
  ShoppingCart, 
  Package,
  Search,
  Download,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { useProductSales } from '../../../../hooks/useProductSales';
import { useProducts } from '../../../../hooks/useProducts';

interface ProductPerformance {
  product_id: string;
  product_name: string;
  image_url?: string;
  category?: string;
  price: number;
  quantity_sold: number;
  total_revenue: number;
  stock_quantity: number;
  popularity_score: number;
  conversion_rate: number;
}

export default function PopularProductsSection() {
  const { productSales, loading: salesLoading } = useProductSales();
  const { products, loading: productsLoading } = useProducts();
  const [sortBy, setSortBy] = useState<'revenue' | 'quantity' | 'popularity' | 'price'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const productPerformance = useMemo((): ProductPerformance[] => {
    return productSales.map(sale => {
      const product = products.find(p => p.id === sale.product_id);
      const popularity_score = (sale.quantity_sold * 0.4) + (sale.total_revenue * 0.6) / 1000;
      const conversion_rate = Math.min((sale.quantity_sold / Math.max(sale.stock_quantity + sale.quantity_sold, 1)) * 100, 100);
      
      return {
        ...sale,
        price: product?.price || 0,
        popularity_score,
        conversion_rate
      };
    });
  }, [productSales, products]);

  const sortedProducts = useMemo(() => {
    return [...productPerformance].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'revenue':
          aValue = a.total_revenue;
          bValue = b.total_revenue;
          break;
        case 'quantity':
          aValue = a.quantity_sold;
          bValue = b.quantity_sold;
          break;
        case 'popularity':
          aValue = a.popularity_score;
          bValue = b.popularity_score;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        default:
          aValue = a.total_revenue;
          bValue = b.total_revenue;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [productPerformance, sortBy, sortOrder]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter(product => {
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [sortedProducts, categoryFilter, searchTerm]);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(productPerformance.map(p => p.category).filter(Boolean))] as string[];
    return ['all', ...uniqueCategories];
  }, [productPerformance]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  const getPopularityLevel = (score: number) => {
    if (score > 80) return { level: 'Très élevée', color: 'bg-red-100 text-red-800' };
    if (score > 60) return { level: 'Élevée', color: 'bg-orange-100 text-orange-800' };
    if (score > 40) return { level: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' };
    if (score > 20) return { level: 'Faible', color: 'bg-blue-100 text-blue-800' };
    return { level: 'Très faible', color: 'bg-gray-100 text-gray-800' };
  };

  if (salesLoading || productsLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Produits Populaires</h1>
          <p className="text-gray-600 mt-1">Analyse des performances et popularité des produits</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres et tris */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les catégories</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Trier par:</span>
          <select
            value={sortBy}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="revenue">Revenue</option>
            <option value="quantity">Quantité vendue</option>
            <option value="popularity">Popularité</option>
            <option value="price">Prix</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cartes de produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.slice(0, 12).map((product, index) => {
          const popularity = getPopularityLevel(product.popularity_score);
          
          return (
            <div key={product.product_id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Image du produit */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.product_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Badge de classement */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black bg-opacity-75 text-white">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    #{index + 1}
                  </span>
                </div>
                
                {/* Badge de popularité */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${popularity.color}`}>
                    {popularity.level}
                  </span>
                </div>
              </div>
              
              {/* Contenu */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.product_name}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix:</span>
                    <span className="font-semibold text-gray-900">{formatXOF(product.price)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendus:</span>
                    <span className="font-semibold text-gray-900">{product.quantity_sold} unités</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-semibold text-green-600">{formatXOF(product.total_revenue)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-semibold ${
                      product.stock_quantity > 10 ? 'text-green-600' :
                      product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.stock_quantity} unités
                    </span>
                  </div>
                </div>
                
                {/* Barre de progression de la popularité */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Popularité</span>
                    <span>{Math.round(product.popularity_score)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                      style={{ width: `${product.popularity_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tableau détaillé pour les vues mobiles/tablettes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:hidden">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liste des Produits</h3>
        <div className="space-y-4">
          {filteredProducts.slice(0, 10).map((product) => (
            <div key={product.product_id} className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.product_name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.product_name}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatXOF(product.total_revenue)}</p>
                <p className="text-sm text-gray-500">{product.quantity_sold} vendus</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Revenue Total
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatXOF(filteredProducts.reduce((sum, p) => sum + p.total_revenue, 0))}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg w-fit mb-4">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Total Vendus
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {filteredProducts.reduce((sum, p) => sum + p.quantity_sold, 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg w-fit mb-4">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Produits Actifs
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {filteredProducts.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg w-fit mb-4">
            <Star className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            Score Moyen
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(filteredProducts.reduce((sum, p) => sum + p.popularity_score, 0) / Math.max(filteredProducts.length, 1))}%
          </p>
        </div>
      </div>
    </div>
  );
}