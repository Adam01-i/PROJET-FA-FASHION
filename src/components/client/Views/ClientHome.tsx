// components/client/ClientHome.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useCart } from "../../../contexts/CartContext";
import { supabase } from "../../../lib/supabase";
import { Product, Category, StoreSettings } from "../../../models";
import { useToastContext } from "../../../hooks/ToastProvider";
import { LoadingSpinner } from "../../../ui/LoadingSpinner";
import { EmptyState } from "../../../ui/EmptyState";

export default function ClientHome() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { success } = useToastContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // console.log('🔄 Début du chargement des données...');
        
        // Récupérer les produits
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .gt('stock_quantity', 0)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (productsError) throw productsError;

        // Récupérer TOUTES les catégories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .limit(6);

        if (categoriesError) {
          console.warn('⚠️ Erreur catégories:', categoriesError);
        }

        // Récupérer les paramètres du store
        const { data: settingsData, error: settingsError } = await supabase
          .from('store_settings')
          .select('*')
          .single();

        if (settingsError) {
          console.warn('⚠️ Paramètres store non trouvés:', settingsError);
        }

        setProducts(productsData || []);
        setCategories(categoriesData || []);
        setFeaturedProducts(productsData?.slice(0, 4) || []);
        setStoreSettings(settingsData);
        
      } catch (error) {
        console.error('❌ Erreur fetching data:', error);
        setError('Erreur lors du chargement des données');
        success(
          'Erreur de chargement',
          'Impossible de charger les produits. Veuillez réessayer.',
          5000
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [success]);

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1,
      stock_quantity: product.stock_quantity
    };
    addToCart(cartItem);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">😔</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oups !</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section avec couleurs rose */}
      <section className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-300 rounded-full translate-x-1/3 translate-y-1/3 opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {storeSettings?.name || "Boutique en Ligne"}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 opacity-95 max-w-4xl mx-auto leading-relaxed">
              {storeSettings?.description || "Découvrez une sélection exclusive de produits de qualité supérieure"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/products"
                className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                🛍️ Explorer la Boutique
              </Link>
              <Link
                to="#featured"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-pink-600 transition-all duration-300 transform hover:scale-105 text-lg"
              >
                ⭐ Produits Populaires
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Catégories */}
      {categories.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-white to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Nos Catégories
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Explorez notre univers de produits soigneusement sélectionnés
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group text-center p-6 bg-white rounded-2xl hover:bg-pink-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-100 hover:border-pink-200 hover:translate-y-[-8px]"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-pink-200 group-hover:to-rose-200 transition-all duration-300 shadow-inner">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-pink-600 text-xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors text-sm lg:text-base">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Produits */}
      <section id="featured" className="py-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {products.length > 0 ? "✨ Nos Produits" : "📦 Aucun Produit Disponible"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {products.length > 0 
                ? "Découvrez nos coups de cœur et dernières nouveautés" 
                : "Notre collection arrive bientôt ! Restez à l'affût"
              }
            </p>
          </div>

          {products.length > 0 ? (
            <>
              {/* Produits en vedette */}
              <div className="mb-16">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    🏆 Produits Vedettes
                  </h3>
                  <Link
                    to="/products?featured=true"
                    className="text-pink-600 hover:text-pink-700 font-semibold text-lg flex items-center gap-2"
                  >
                    Voir plus <span>→</span>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>

              {/* Tous les produits */}
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    🛒 Tous les Produits
                  </h3>
                  <Link
                    to="/products"
                    className="text-pink-600 hover:text-pink-700 font-semibold text-lg flex items-center gap-2"
                  >
                    Tout explorer <span>→</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Boutique en préparation"
              message="Nous travaillons dur pour vous proposer une sélection exceptionnelle. Revenez très bientôt !"
              actionText="Découvrir nos catégories"
              actionLink="/categories"
            />
          )}
        </div>
      </section>

      {/* Section Newsletter */}
      {/* <section className="py-16 bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            💌 Restez Connecté
          </h2>
          <p className="text-xl lg:text-2xl opacity-95 mb-8 max-w-2xl mx-auto">
            Soyez les premiers informés de nos nouveautés et offres exclusives
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre plus belle adresse email ✨"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-pink-300 text-lg placeholder-gray-400"
            />
            <button className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg">
              S'abonner 🎁
            </button>
          </div>
          <p className="text-pink-100 text-sm mt-4">
            Promis, pas de spam ! Uniquement du contenu de qualité.
          </p>
        </div>
      </section> */}
    </div>
  );
}