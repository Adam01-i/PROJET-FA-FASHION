import { useState } from "react";
import NavBar from "./navBar/NavBar";
import SideBar, { Tab } from "./sideBar/SideBar";
import Dashboard from "./dashboard/Dashboard";
import InventorySection from "../Inventory/InventorySection";
import ProductsSection from "./sideBar/contentSections/ProductsSection";
import WholeSaleProductsSection from "./sideBar/contentSections/WholeSaleProductsSection";
import OrdersSection from "../ordersSection/OrdersSection";
import UsersSection from "./sideBar/contentSections/UsersSection";
import SettingsSection from "./sideBar/contentSections/SettingsSection";
import DeliveryOrdersSection from "../livreur/DeliveryOrdersSection";
import MyAccountSection from "./sideBar/contentSections/MyAccountSection";

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
      case "myAccount":
        return "Mon compte";
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

            {activeTab === "myAccount" && <MyAccountSection />}
          </main>
        </div>
      </div>
    </div>
  );
}
