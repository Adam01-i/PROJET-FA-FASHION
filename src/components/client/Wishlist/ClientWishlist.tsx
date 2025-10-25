// components/client/Wishlist.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { Product } from '../../../models';
import { useToastContext } from '../../../hooks/ToastProvider';
import ProductCard from '../Views/ProductCard';
import { useCart } from '../../../contexts/CartContext';
import { useFavorites } from '../../../hooks/FavoritesContext';
import ConfirmationModal from '../../../ui/ConfirmationModal';

export default function Wishlist() {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const { success } = useToastContext();
  const { addToCart } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);

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
    success('Produit ajouté !', `${product.name} a été ajouté au panier`);
  };

  const handleRemoveFromFavorites = (product: Product) => {
    removeFromFavorites(product.id);
  };

  const handleClearFavorites = () => {
    clearFavorites();
    setShowClearModal(false);
  };

  const handleAddAllToCart = () => {
    const availableProducts = favorites.filter(product => product.stock_quantity > 0);
    
    if (availableProducts.length === 0) {
      success('Aucun produit disponible', 'Aucun de vos favoris n\'est actuellement en stock');
      return;
    }

    availableProducts.forEach(product => {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || '',
        quantity: 1,
        stock_quantity: product.stock_quantity
      };
      addToCart(cartItem);
    });

    success(
      'Favoris ajoutés au panier !',
      `${availableProducts.length} produit(s) ont été ajoutés à votre panier`,
      4000
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            {/* <Link
              to="/"
              className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors bg-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à l'accueil
            </Link> */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">💖 Mes Favoris</h1>
              <p className="text-gray-600 mt-2">
                Retrouvez tous vos produits préférés au même endroit
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold shadow-lg">
              {favorites.length} produit(s) favori(s)
            </div>
            
            {favorites.length > 0 && (
              <>
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  title="Ajouter tous les disponibles au panier"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Tout ajouter</span>
                </button>
                
                <button
                  onClick={() => setShowClearModal(true)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  title="Vider tous les favoris"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Vider</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Liste des favoris */}
        {favorites.length > 0 ? (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-pink-100">
                <div className="text-2xl font-bold text-pink-600">{favorites.length}</div>
                <div className="text-gray-600 text-sm">Total des favoris</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {favorites.filter(p => p.stock_quantity > 0).length}
                </div>
                <div className="text-gray-600 text-sm">Produits disponibles</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">
                  {favorites.filter(p => p.stock_quantity === 0).length}
                </div>
                <div className="text-gray-600 text-sm">Produits épuisés</div>
              </div>
            </div>

            {/* Grille des produits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                  {/* Bouton de suppression rapide */}
                  <button
                    onClick={() => handleRemoveFromFavorites(product)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 z-20"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Aucun favori pour le moment
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              Commencez à ajouter des produits à vos favoris en cliquant sur le cœur ♥<br />
              Ils apparaîtront ici pour un accès rapide !
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              🛍️ Découvrir tous les produits
            </Link>
          </div>
        )}
      </div>

      {/* Modal de confirmation pour vider les favoris */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearFavorites}
        title="Vider les favoris"
        message="Êtes-vous sûr de vouloir retirer tous vos produits favoris ? Cette action est irréversible."
        confirmText="Oui, vider"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}