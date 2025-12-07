// components/client/ProductCard.tsx
import { useState } from "react";
// import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Eye,
  X,
  Plus,
  Minus,
  Heart,
  Share2,
  Tag,
} from "lucide-react";
import { formatXOF } from "../../../lib/currency";
import { Product, WholesaleTier } from "../../../models";
import { useToastContext } from "../../../hooks/ToastProvider";
import { useFavorites } from "../../../contexts/FavoritesContext";

// Étendre localement l'interface Product pour inclure wholesale_tiers
interface ProductWithWholesale extends Product {
  wholesale_tiers?: WholesaleTier[];
}

interface ProductCardProps {
  product: ProductWithWholesale;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { success } = useToastContext();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Fonction utilitaire pour récupérer les infos de prix en gros
  const getWholesaleInfo = (product: ProductWithWholesale) => {
    if (!product.wholesale_tiers || product.wholesale_tiers.length === 0) {
      return null;
    }

    // Filtrer les paliers actifs et trier par quantité minimale
    const activeTiers = product.wholesale_tiers
      .filter((tier: WholesaleTier) => tier.is_active)
      .sort(
        (a: WholesaleTier, b: WholesaleTier) => a.min_quantity - b.min_quantity
      );

    if (activeTiers.length === 0) return null;

    // Calculer le pourcentage de réduction pour le palier minimum
    const minTier = activeTiers[0];
    const discountPercentage = Math.round(
      ((product.price - minTier.wholesale_price) / product.price) * 100
    );

    return {
      hasWholesale: true,
      minQuantity: minTier.min_quantity,
      minPrice: minTier.wholesale_price,
      discountPercentage,
      tiers: activeTiers,
    };
  };

  const wholesaleInfo = getWholesaleInfo(product);

  // Gérer proprement la catégorie
  const categoryName =
    product.category?.name || product.category_name || "Non catégorisé";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    onAddToCart(product);

    // Afficher le toast de confirmation
    success("Produit ajouté !", `${product.name} a été ajouté au panier`, 3000);
  };

  const handleQuickAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }

    success(
      "Produit(s) ajouté(s) !",
      `${quantity} x ${product.name} ajouté(s) au panier`,
      3000
    );

    setShowModal(false);
    setQuantity(1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href + `/product/${product.id}`,
        });
        success("Partagé !", "Le produit a été partagé avec succès");
      } catch (error) {
        // console.log("Erreur de partage:", error);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(
        window.location.href + `/product/${product.id}`
      );
      success(
        "Lien copié !",
        "Le lien du produit a été copié dans le presse-papier"
      );
    }
  };

  const handleToggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newFavoriteState = !isFavorite(product.id);
    toggleFavorite(product);

    if (newFavoriteState) {
      success(
        "Ajouté aux favoris",
        `${product.name} a été ajouté à vos favoris`
      );
    } else {
      success(
        "Retiré des favoris",
        `${product.name} a été retiré de vos favoris`
      );
    }
  };

  // Déterminer le statut du stock
  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return {
        text: "Rupture",
        class: "bg-red-100 text-red-800",
        badgeClass: "bg-red-500",
      };
    } else if (product.stock_quantity < 5) {
      return {
        text: "Stock limité",
        class: "bg-orange-100 text-orange-800",
        badgeClass: "bg-orange-500",
      };
    } else {
      return {
        text: "En stock",
        class: "bg-green-100 text-green-800",
        badgeClass: "bg-green-500",
      };
    }
  };

  const stockStatus = getStockStatus();
  const favorite = isFavorite(product.id);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:translate-y-[-4px] border border-gray-100">
        <div
          className="relative overflow-hidden"
          onClick={() => setShowModal(true)}
        >
          <img
            src={product.image_url || "/api/placeholder/400/300"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badge de statut de stock */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${stockStatus.badgeClass}`}
            >
              {stockStatus.text}
            </span>
          </div>

          {/* Badge prix en gros - Positionné sous le badge de stock */}
          {wholesaleInfo && (
            <div className="absolute top-14 left-3 z-10">
              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                <Tag size={10} />
                <span>À partir de {wholesaleInfo.minQuantity}</span>
              </div>
            </div>
          )}

          {/* Bouton favori */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-10"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                favorite
                  ? "fill-pink-500 text-pink-500 scale-110"
                  : "text-gray-400 hover:text-pink-400"
              }`}
            />
          </button>

          {/* Overlay avec actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110"
              title="Voir les détails"
            >
              <Eye className="w-5 h-5 text-gray-700" /> 
            </button>

            {product.stock_quantity > 0 && (
              <button
                onClick={handleAddToCart}
                className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-pink-500 rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-110 text-white"
                title="Ajouter au panier"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* Catégorie */}
          <div className="mb-2">
            <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
              {categoryName}
            </span>
          </div>

          {/* Nom du produit */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-2 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description || "Description non disponible"}
          </p>

          {/* Prix et actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-pink-600">
                {formatXOF(product.price)}
              </span>

              {/* Affichage du prix en gros si disponible */}
              {wholesaleInfo && (
                <div className="text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600 font-semibold">
                      {formatXOF(wholesaleInfo.minPrice)}
                    </span>
                    <span className="text-xs text-gray-500">
                      à partir de {wholesaleInfo.minQuantity}
                    </span>
                    {wholesaleInfo.discountPercentage > 0 && (
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-1">
                        -{wholesaleInfo.discountPercentage}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              <span className="text-xs text-gray-500 mt-1">
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} disponibles`
                  : "Épuisé"}
              </span>
            </div>

            {/* Bouton d'ajout au panier */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                product.stock_quantity === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transform hover:scale-105"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">
                {product.stock_quantity === 0 ? "Épuisé" : "Ajouter"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de détails du produit */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Bouton fermer */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Image du produit */}
              <div className="relative h-86 sm:h-86 lg:h-96">
                <img
                  src={product.image_url || "/api/placeholder/800/600"}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all duration-300 ${
                        favorite
                          ? "fill-pink-500 text-pink-500 scale-110"
                          : "text-gray-600 hover:text-pink-500"
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110"
                  >
                    <Share2 className="w-5 h-5 text-gray-600 hover:text-pink-500 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal */}
              <div className="p-6">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                      {categoryName}
                    </span>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 mt-2 leading-relaxed">
                      {product.description ||
                        "Aucune description disponible pour ce produit."}
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl lg:text-4xl font-bold text-pink-600">
                      {formatXOF(product.price)}
                    </div>
                    <div
                      className={`text-sm font-semibold mt-2 px-3 py-1 rounded-full text-white ${stockStatus.badgeClass}`}
                    >
                      {stockStatus.text}
                    </div>
                  </div>
                </div>

                {/* Section prix en gros (si disponible) */}
                {wholesaleInfo && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 text-lg">
                      <Tag size={18} />
                      Prix en gros disponible
                    </h4>
                    <div className="space-y-3">
                      {wholesaleInfo.tiers.map(
                        (tier: WholesaleTier, index: number) => {
                          const tierDiscount = Math.round(
                            ((product.price - tier.wholesale_price) /
                              product.price) *
                              100
                          );
                          return (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 font-bold rounded-full">
                                  {tier.min_quantity}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-800">
                                    À partir de{" "}
                                    <strong>{tier.min_quantity}</strong> unités
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Prix unitaire
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-xl font-bold text-blue-700">
                                    {formatXOF(tier.wholesale_price)}
                                  </div>
                                  <div className="text-sm text-gray-500 line-through">
                                    {formatXOF(product.price)}
                                  </div>
                                </div>
                                <div
                                  className={`text-sm font-bold px-2 py-1 rounded ${
                                    tierDiscount >= 30
                                      ? "bg-red-100 text-red-800"
                                      : tierDiscount >= 20
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  -{tierDiscount}%
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Astuce :</strong> Plus vous achetez d'unités,
                        plus le prix baisse ! Le prix s'ajuste automatiquement
                        dans votre panier selon la quantité.
                      </p>
                    </div>
                  </div>
                )}

                {/* Informations détaillées */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      📦 Informations Stock
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Quantité disponible:
                        </span>
                        <span className="font-semibold">
                          {product.stock_quantity} unités
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span
                          className={`font-semibold ${
                            product.stock_quantity === 0
                              ? "text-red-600"
                              : product.stock_quantity < 5
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {stockStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      ⚡ Livraison
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Délai estimé:</span>
                        <span className="font-semibold">24-48h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retour gratuit:</span>
                        <span className="font-semibold text-green-600">
                          30 jours
                        </span>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Sélection quantité et ajout au panier */}
                {product.stock_quantity > 0 && (
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-semibold">
                          Quantité:
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setQuantity(Math.max(1, quantity - 1))
                            }
                            disabled={quantity <= 1}
                            className="w-10 h-10 rounded-full bg-white border border-pink-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-300 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-pink-600" />
                          </button>
                          <span className="w-12 text-center text-xl font-bold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              setQuantity(
                                Math.min(product.stock_quantity, quantity + 1)
                              )
                            }
                            disabled={quantity >= product.stock_quantity}
                            className="w-10 h-10 rounded-full bg-white border border-pink-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-300 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-pink-600" />
                          </button>
                        </div>
                        <span className="text-sm text-gray-500">
                          Max: {product.stock_quantity}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleQuickAddToCart}
                          className="flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Ajouter {quantity > 1 && `(${quantity})`}
                        </button>
                      </div>
                    </div>

                    {/* Indicateur de prix selon la quantité */}
                    {wholesaleInfo && (
                      <div className="mt-4 pt-4 border-t border-pink-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Prix pour {quantity} unité{quantity > 1 ? "s" : ""}{" "}
                            :
                          </span>
                          <div className="flex items-center gap-2">
                            {quantity >= wholesaleInfo.minQuantity ? (
                              <>
                                <span className="text-xl font-bold text-green-700">
                                  {formatXOF(wholesaleInfo.minPrice * quantity)}
                                </span>
                                <span className="text-gray-400 line-through">
                                  {formatXOF(product.price * quantity)}
                                </span>
                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Économie :{" "}
                                  {formatXOF(
                                    (product.price - wholesaleInfo.minPrice) *
                                      quantity
                                  )}
                                </span>
                              </>
                            ) : quantity > 1 ? (
                              <>
                                <span className="text-xl font-bold text-pink-600">
                                  {formatXOF(product.price * quantity)}
                                </span>
                                <div className="text-xs text-blue-600">
                                  Ajoutez {wholesaleInfo.minQuantity - quantity}{" "}
                                  pour avoir le prix en gros
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions supplémentaires */}
                {/* <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <Link
                    to={`/product/${product.id}`}
                    className="text-pink-600 hover:text-pink-700 font-semibold underline flex items-center gap-2"
                    onClick={() => setShowModal(false)}
                  >
                    Voir la page complète du produit →
                  </Link>

                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Partager
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
