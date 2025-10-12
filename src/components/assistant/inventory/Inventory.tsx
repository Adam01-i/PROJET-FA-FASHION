import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import NavbarAssistant from '../components/assistant/NavbarAssistant';
import InventoryStats from '../components/assistant/inventory/InventoryStats';
import ProductsTable from '../components/assistant/inventory/ProductsTable';
import StockModal from '../components/assistant/inventory/StockModal';
import ProductModal from '../components/assistant/inventory/ProductModal';

type StockAlertLevel = 'low' | 'out' | 'normal';
type SortField = 'name' | 'stock' | 'price' | 'sales' | 'updated';
type SortDirection = 'asc' | 'desc';

interface StockStatus {
  level: StockAlertLevel;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Interface pour les catégories qui peuvent être des objets
interface CategoryObject {
  name: string;
  id?: string;
}

export default function Inventory() {
  const { products, loading, updateProductStock, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockAlertLevel | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // CORRECTION : Extraire les noms de catégories proprement
  const categories = useMemo(() => {
    const categoryNames = products
      .map(p => p.category)
      .filter(Boolean)
      .map(cat => {
        // Si la catégorie est un objet, extraire le nom
        if (typeof cat === 'object' && cat !== null && 'name' in cat) {
          return (cat as CategoryObject).name || '';
        }
        return cat as string;
      })
      .filter(name => name && name !== '');

    const uniqueCategories = [...new Set(categoryNames)];
    return ['all', ...uniqueCategories] as string[];
  }, [products]);

  // Fonction pour extraire le nom de catégorie d'un produit
  const getProductCategoryName = (category: Product['category']): string => {
    if (typeof category === 'object' && category !== null && 'name' in category) {
      return (category as CategoryObject).name || '';
    }
    return category as string || '';
  };

  // Filtrer et trier les produits
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product: Product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // CORRECTION : Gérer les catégories qui peuvent être des objets
      const productCategory = getProductCategoryName(product.category);
      
      const matchesCategory = 
        selectedCategory === 'all' || productCategory === selectedCategory;
      
      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'low' && product.stock_quantity > 0 && product.stock_quantity <= (product.low_stock_threshold || 5)) ||
        (stockFilter === 'out' && product.stock_quantity === 0) ||
        (stockFilter === 'normal' && product.stock_quantity > (product.low_stock_threshold || 5));

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Trier les produits
    filtered.sort((a: Product, b: Product) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.stock_quantity;
          bValue = b.stock_quantity;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'sales':
          aValue = a.sales_count || 0;
          bValue = b.sales_count || 0;
          break;
        case 'updated':
          aValue = new Date(a.updated_at || a.created_at);
          bValue = new Date(b.updated_at || b.created_at);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, stockFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updateProductStock(productId, newStock);
      setIsStockModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleProductUpdate = async (productId: string, updates: Partial<Product>) => {
    try {
      await updateProduct(productId, updates);
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const getStockStatus = (product: Product): StockStatus => {
    if (product.stock_quantity === 0) {
      return {
        level: 'out',
        label: 'Rupture',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle
      };
    }
    
    if (product.stock_quantity <= (product.low_stock_threshold || 5)) {
      return {
        level: 'low',
        label: 'Stock faible',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertTriangle
      };
    }
    
    return {
      level: 'normal',
      label: 'En stock',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarAssistant />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Chargement de l'inventaire...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarAssistant />
      
      {/* 🎯 CONTENU PRINCIPAL - LES CARTES APPARAISSENT IMMÉDIATEMENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* 🔥 LES CARTES STATISTIQUES EN PREMIER */}
        <InventoryStats products={products} />

        {/* SECTION DE GESTION AVEC EN-TÊTE ET FILTRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {/* En-tête de section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
              <p className="text-gray-600 mt-1">
                Recherchez, filtrez et géz votre inventaire
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProduct(null);
                setIsProductModalOpen(true);
              }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Nouveau Produit</span>
            </button>
          </div>

          {/* Filtres et recherche */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Barre de recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit par nom, description ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Filtre par catégorie */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="all">Toutes les catégories</option>
                {categories
                  .filter(cat => cat !== 'all')
                  .map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>

            {/* Filtre par stock */}
            <div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockAlertLevel | 'all')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="all">Tous les stocks</option>
                <option value="normal">Stock normal</option>
                <option value="low">Stock faible</option>
                <option value="out">Rupture</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <ProductsTable
          products={filteredAndSortedProducts}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onEditStock={(product) => {
            setSelectedProduct(product);
            setIsStockModalOpen(true);
          }}
          onEditProduct={(product) => {
            setSelectedProduct(product);
            setIsProductModalOpen(true);
          }}
          getStockStatus={getStockStatus}
        />

        {/* Modals */}
        {isStockModalOpen && selectedProduct && (
          <StockModal
            product={selectedProduct}
            onClose={() => {
              setIsStockModalOpen(false);
              setSelectedProduct(null);
            }}
            onSave={handleStockUpdate}
          />
        )}

        {isProductModalOpen && (
          <ProductModal
            product={selectedProduct}
            onClose={() => {
              setIsProductModalOpen(false);
              setSelectedProduct(null);
            }}
            onSave={handleProductUpdate}
          />
        )}
      </div>
    </div>
  );
}