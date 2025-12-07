import { ShoppingBag } from 'lucide-react';

interface OrdersItemProps {
  active: boolean;
  onClick: () => void;
}

export default function OrdersItem({ active, onClick }: OrdersItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all duration-200 group
        ${active
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
      `}
    >
      <ShoppingBag className={`h-5 w-5 mr-3 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
      <span className="font-medium">Commandes</span>
      
      {active && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80"></div>
      )}
    </button>
  );
}