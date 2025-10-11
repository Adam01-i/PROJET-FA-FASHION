import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import Sidebar from './Sidebar';
import ProductCard from './ProductCard';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category?: {
    name: string;
  };
  stock_quantity: number;
}

const Home = () => {
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
          .gt('stock_quantity', 0); // Seulement les produits en stock

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nos Produits
            </h1>
            <p className="text-gray-600">
              Découvrez notre sélection exclusive de produits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={`product-${product.id}`}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun produit disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;