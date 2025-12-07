import { useState } from "react";
import Navbar from "./navBar/Navbar";
import OrdersSection from "../ordersSection/OrdersSection";
import InventorySection from "../Inventory/InventorySection";
import MyAccountSection from "../admin/sideBar/contentSections/MyAccountSection";

export default function AssistantLayout() {
  const [activeTab, setActiveTab] = useState<
    "orders" | "support" | "inventory" | "validate" | "myAccount"
  >("orders");
  const [searchTerm] = useState("");

  const renderContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersSection searchTerm={searchTerm} />;
      case "inventory":
        return <InventorySection />;
      case "myAccount":
        return <MyAccountSection />;
      default:
        return <OrdersSection searchTerm={searchTerm} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NavBar avec sa propre logique */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Content Area - Chaque section gère sa propre logique */}
        <main className="flex-1 p-4 sm:p-6">{renderContent()}</main>
      </div>
    </div>
  );
}
