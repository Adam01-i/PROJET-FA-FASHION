import { useState } from 'react';
import DeliveryNavbar from './DeliveryNavbar';
import DeliveryOrdersSection from './DeliveryOrdersSection';

export default function DeliveryLayout() {
  const [activeTab, setActiveTab] = useState<'orders' | 'delivered'>('orders');
  const [searchTerm, setSearchTerm] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <DeliveryOrdersSection searchTerm={searchTerm} />;
      case 'delivered':
        return <DeliveryOrdersSection searchTerm={searchTerm} showDeliveredOnly={true} />;
      default:
        return <DeliveryOrdersSection searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DeliveryNavbar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="flex-1 min-h-screen flex flex-col">
        <main className="flex-1 p-4 sm:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}