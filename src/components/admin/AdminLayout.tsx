import { useState } from "react";
import NavBar from "./NavBar/NavBar";
import SideBar, { Tab } from "./SideBar/SideBar";
import Dashboard from "./Dashboard/Dashboard";
import InventorySection from "../Inventory/InventorySection";
import ProductsSection from "./SideBar/ContentSections/ProductsSection";
import WholeSaleProductsSection from "./SideBar/ContentSections/WholeSaleProductsSection";
import OrdersSection from "../AuthOrdersSection/OrdersSection";
import UsersSection from "./SideBar/ContentSections/UsersSection";
import SettingsSection from "./SideBar/ContentSections/SettingsSection";
import DeliveryOrdersSection from "../livreur/DeliveryOrdersSection";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [, setIsAddModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deliveryTab, setDeliveryTab] = useState<"orders" | "delivered">(
    "orders"
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Tableau de bord";
      case "products":
        return "Gestion des produits";
      case "wholeSaleproducts":
        return "Gestion des produits en Gros";
      case "inventory":
        return "Gestion des inventaire";
      case "orders":
        return "Gestion des commandes";
      case "deliveries":
        return "";
      case "users":
        return "Gestion des utilisateurs";
      case "settings":
        return "Paramètres";
      default:
        return "Tableau de bord";
    }
  };

  const showSearch =
    activeTab !== "settings" &&
    activeTab !== "dashboard" &&
    activeTab !== "inventory";

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="flex">
        {/* Sidebar */}
        <SideBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          deliveryTab={deliveryTab}
          onDeliveryTabChange={setDeliveryTab}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* NavBar */}
          <NavBar
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showSearch={showSearch}
            title={getTabTitle()}
          />

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-y-auto">
            {activeTab === "dashboard" && <Dashboard />}


            {activeTab === "products" && (
              <ProductsSection
                searchTerm={searchTerm}
                onAddClick={() => setIsAddModalOpen(true)}
              />
            )}


            {activeTab === "wholeSaleproducts" && (
              <WholeSaleProductsSection
                searchTerm={searchTerm}
                onAddClick={() => setIsAddModalOpen(true)}
              />
            )}
            
            {activeTab === "inventory" && <InventorySection />}

            {activeTab === "orders" && (
              <OrdersSection searchTerm={searchTerm} />
            )}

            {activeTab === "deliveries" && (
              <DeliveryOrdersSection
                searchTerm={searchTerm}
                showDeliveredOnly={deliveryTab === "delivered"}
              />
            )}

            {activeTab === "users" && <UsersSection searchTerm={searchTerm} />}

            {activeTab === "settings" && <SettingsSection />}
          </main>
        </div>
      </div>
    </div>
  );
}
