import { useState } from 'react';
import NavBar from './NavBar/NavBar';
import SideBar, { Tab } from './SideBar/SideBar';
import DashboardSection from './SideBar/ContentSections/DashboardSection';
import ProductsSection from './SideBar/ContentSections/ProductsSection';
import OrdersSection from './SideBar/ContentSections/OrdersSection';
import UsersSection from './SideBar/ContentSections/UsersSection';
import SettingsSection from './SideBar/ContentSections/SettingsSection';
import ProductModal from './SideBar/Modals/ProductModal';
import { supabase } from '../../lib/supabase';
import { useToastContext } from '../../hooks/ToastProvider';

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { success, error: toastError } = useToastContext();

  // État pour le nouveau produit (corrigé pour correspondre au type attendu)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: '',
    image_url: ''
  });

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
  const showAddButton = activeTab === 'products';

  // Handler for submitting the new product (corrigé pour le type)
  const handleProductSubmit = async (productData: {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category_id: string;
    image_url: string;
  }) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          category_id: productData.category_id,
          image_url: productData.image_url
        }]);

      if (error) throw error;

      success("Produit ajouté", "Le produit a été ajouté avec succès");
      setIsAddModalOpen(false);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category_id: '',
        image_url: ''
      });

      // Recharger la page après un court délai pour voir le toast
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error('Error adding product:', error);
      toastError("Erreur", "Erreur lors de l'ajout du produit");
    }
  };

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
            showAddButton={showAddButton}
            onAddClick={() => setIsAddModalOpen(true)}
            addButtonLabel="Ajouter un produit"
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

      {/* Modal d'ajout de produit */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        product={newProduct}
        onProductChange={setNewProduct}
        onSubmit={handleProductSubmit}
        mode="add"
      />
    </div>
  );
}