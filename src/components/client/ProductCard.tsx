// components/client/ProductCard.tsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { formatXOF } from '../../lib/currency';
import { Product } from '../../models';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  // Correction : gérer proprement la catégorie
  const categoryName = product.category?.name || 
                     product.category_name || 
                     'Non catégorisé';

  const handleAddToCart = () => {
    // Créer l'objet CartItem à partir du Product
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '',
      quantity: 1,
      stock_quantity: product.stock_quantity
    };
    
    // Appeler la fonction parent
    onAddToCart(product);
    
    // Debug: vérifier que l'item est bien créé
    console.log('Adding to cart:', cartItem);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative group">
        <img 
          src={product.image_url || '/api/placeholder/300/200'} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <Link 
            to={`/product/${product.id}`}
            className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all bg-white rounded-full p-2 shadow-lg"
          >
            <Eye className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
          <span className="text-indigo-600 font-bold text-lg">
            {formatXOF(product.price)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-3">
          {categoryName}
        </span>
        
        <div className="flex justify-between items-center">
          <span className={`text-sm ${
            product.stock_quantity > 5 ? 'text-green-600' : 
            product.stock_quantity > 0 ? 'text-orange-600' : 'text-red-600'
          }`}>
            Stock: {product.stock_quantity}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              product.stock_quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock_quantity === 0 ? 'Rupture' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;