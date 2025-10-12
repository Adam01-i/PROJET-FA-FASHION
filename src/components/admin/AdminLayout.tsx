import { useState } from 'react';
import NavBar from './NavBar/NavBar';
import SideBar, { Tab } from './SideBar/SideBar';
import DashboardSection from './SideBar/ContentSections/DashboardSection';
import ProductsSection from './SideBar/ContentSections/ProductsSection';
import OrdersSection from './SideBar/ContentSections/OrdersSection';
import UsersSection from './SideBar/ContentSections/UsersSection';
import SettingsSection from './SideBar/ContentSections/SettingsSection';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [, setIsAddModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Tableau de bord';
      case 'products': return 'Gestion des produits';
      case 'orders': return 'Gestion des commandes';
      case 'users': return 'Gestion des utilisateurs';
      case 'settings': return 'Paramètres';
      default: return 'Tableau de bord';
    }
  };

  const showSearch = activeTab !== 'settings' && activeTab !== 'dashboard';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <SideBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 lg:ml-0 min-h-screen flex flex-col">
          {/* NavBar */}
          <NavBar
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showSearch={showSearch}
            title={getTabTitle()}
          />

          {/* Content Area */}
          <main className="flex-1 p-6">
            {activeTab === 'dashboard' && (
              <DashboardSection />
            )}
            
            {activeTab === 'products' && (
              <ProductsSection 
                searchTerm={searchTerm}
                onAddClick={() => setIsAddModalOpen(true)}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersSection searchTerm={searchTerm} />
            )}

            {activeTab === 'users' && (
              <UsersSection searchTerm={searchTerm} />
            )}

            {activeTab === 'settings' && (
              <SettingsSection />
            )}
          </main>
        </div>
      </div>

    </div>
  );
}