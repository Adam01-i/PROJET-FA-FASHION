import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { useCart } from "../../contexts/CartContext";
import { supabase } from "../../lib/supabase";
import { Product } from "../../models";

// const images = [
//   "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1920&q=80",
// ];

export default function Home() {
  // const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .gt('stock_quantity', 0)
          .eq('is_public', true)
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prev) => (prev + 1) % images.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1,
      stock_quantity: product.stock_quantity
    });
  };

  return (
    <div className="min-h-screen">
      {/* Bannière */}
      {/* <div
        className="relative w-full h-screen flex items-center justify-center text-white pt-16 overflow-hidden"
        style={{
          backgroundImage: `url('${images[currentIndex]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          transition: "background-image 1s ease-in-out",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl">
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Bienvenue sur{" "}
            <span className="text-indigo-400">Fa-Fashion</span>
          </motion.h1>

          <motion.p
            className="mt-4 text-indigo-200 text-lg max-w-2xl mx-auto drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            KoundoulShop, votre boutique en ligne au Sénégal. Livraison rapide,
            paiement sécurisé (Wave, Orange Money).
          </motion.p>

          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-indigo-500 text-white font-semibold rounded-md shadow-lg hover:bg-indigo-600 transition"
            >
              Découvrir les produits
            </Link>
          </motion.div>

          <div className="flex justify-center mt-10 space-x-4">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`w-4 h-4 rounded-full cursor-pointer ${
                  currentIndex === idx ? "bg-indigo-400" : "bg-indigo-200/60"
                } shadow-lg`}
                aria-label={`Image ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </div> */}

      {/* Section produits */}
      <section id="products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Produits Populaires
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez notre sélection exclusive de produits de qualité
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun produit disponible pour le moment.
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}