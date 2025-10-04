import React from 'react';
import { Sliders } from 'lucide-react';
import { Product } from '../types';
import { formatXOF } from '../lib/currency';

interface SidebarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  inStock: boolean;
  setInStock: (inStock: boolean) => void;
  products: Product[];
}

export default function Sidebar({
  setSearchTerm,
  priceRange,
  setPriceRange,
  selectedCategories,
  setSelectedCategories,
  inStock,
  setInStock,
  products
}: SidebarProps) {
  // Extraire les catégories uniques des produits
  const categories = React.useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [products]);

  // Calculer le prix maximum des produits
  const maxPrice = React.useMemo(() => {
    return Math.max(...products.map(p => p.price), 2000);
  }, [products]);

  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <div className="w-64 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <Sliders className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
      </div>

      <div className="space-y-6">
        {/* Barre de recherche */}
        

        {/* Filtre par catégorie */}
        {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Catégories</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
                <span className="ml-auto text-xs text-gray-500">
                  ({products.filter(p => p.category === category).length})
                </span>
              </label>
            ))}
          </div>
        </div>
        )}

        {/* Filtre par prix */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Prix</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
              />
              <span className="text-sm text-gray-500">F CFA</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatXOF(priceRange[0])}</span>
              <span>{formatXOF(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Filtre par disponibilité */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">En stock uniquement</span>
            <span className="ml-auto text-xs text-gray-500">
              ({products.filter(p => p.stock > 0).length})
            </span>
          </label>
        </div>

        {/* Bouton de réinitialisation */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategories([]);
              setInStock(false);
              setPriceRange([0, maxPrice]);
            }}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
    </div>
  );
}