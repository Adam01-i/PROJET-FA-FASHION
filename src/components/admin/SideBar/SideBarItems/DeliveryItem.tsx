import { Truck, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DeliveryItemProps {
  active: boolean;
  onClick: () => void;
  deliveryTab?: 'orders' | 'delivered';
  onDeliveryTabChange?: (tab: 'orders' | 'delivered') => void;
}

export default function DeliveryItem({ 
  active, 
  onClick, 
  deliveryTab = 'orders',
  onDeliveryTabChange 
}: DeliveryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTabChange = (tab: 'orders' | 'delivered') => {
    if (onDeliveryTabChange) {
      onDeliveryTabChange(tab);
    }
  };

  const handleMainClick = () => {
    onClick();
    if (active) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={`rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25' 
        : 'hover:bg-gray-50'
    }`}>
      <button
        onClick={handleMainClick}
        className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${
          active ? 'text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Truck className={`h-5 w-5 mr-3 transition-colors ${
          active ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'
        }`} />
        <span className="font-medium flex-1 text-left">Livraisons</span>
        
        <ChevronDown 
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded && active ? 'rotate-180' : ''
          } ${active ? 'text-white' : 'text-gray-400'}`} 
        />
      </button>

      {/* Sous-menu déroulant */}
      {active && isExpanded && (
        <div className="px-4 pb-3 space-y-1 animate-in fade-in duration-200">
          <button
            onClick={() => handleTabChange('orders')}
            className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 ${
              deliveryTab === 'orders' 
                ? 'bg-white text-indigo-600 font-medium shadow-sm' 
                : 'text-indigo-100 hover:bg-indigo-400 hover:text-white'
            }`}
          >
            À livrer
          </button>
          <button
            onClick={() => handleTabChange('delivered')}
            className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-200 ${
              deliveryTab === 'delivered' 
                ? 'bg-white text-indigo-600 font-medium shadow-sm' 
                : 'text-indigo-100 hover:bg-indigo-400 hover:text-white'
            }`}
          >
            Livrées
          </button>
        </div>
      )}
    </div>
  );
}