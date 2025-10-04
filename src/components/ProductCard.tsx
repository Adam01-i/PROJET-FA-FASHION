import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { formatXOF } from '../lib/currency';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="relative h-48">
        <img 
          src={product.image_url || 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
            Rupture de stock
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
          <span className="text-sm font-medium text-gray-500">{product.category}</span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600">{formatXOF(product.price)}</span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              product.stock > 0
                ? 'bg-indigo-500 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  );
}