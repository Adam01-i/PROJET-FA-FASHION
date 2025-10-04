import { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useProducts } from '../hooks/useProducts';
import { ShoppingBag } from 'lucide-react';
import Banner from '../components/Banner';

export default function Home() {
  const { products, loading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtre par terme de recherche
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégories sélectionnées
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Filtre par prix
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filtre par stock
    if (inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    return filtered;
  }, [products, searchTerm, selectedCategories, priceRange, inStock]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 py-8" id="products">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <Sidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              inStock={inStock}
              setInStock={setInStock}
              products={products}
            />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Nos Produits</h1>
              <p className="mt-2 text-gray-600">
                Découvrez notre sélection de produits de qualité
              </p>
              {(searchTerm || selectedCategories.length > 0 || inStock) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                      Recherche: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCategories.map(category => (
                    <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {category}
                      <button
                        onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {inStock && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      En stock uniquement
                      <button
                        onClick={() => setInStock(false)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategories([]);
                      setInStock(false);
                      setPriceRange([0, 2000]);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Effacer tous les filtres
                  </button>
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Essayez de modifier vos filtres de recherche.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}