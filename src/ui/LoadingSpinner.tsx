// components/ui/LoadingSpinner.tsx
export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-pink-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
        </div>
        <p className="text-gray-600 mt-4 text-lg">Chargement des produits...</p>
        <p className="text-gray-400 text-sm mt-2">Préparez-vous à découvrir de merveilleux produits</p>
      </div>
    </div>
  );
};