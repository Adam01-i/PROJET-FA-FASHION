import DashboardItem from "./SideBarItems/DashboardItem";
import InventoryItem from "./SideBarItems/InventoryItem";
import ProductsItem from "./SideBarItems/ProductsItem";
import OrdersItem from "./SideBarItems/OrdersItem";
import UsersItem from "./SideBarItems/UsersItem";
import SettingsItem from "./SideBarItems/SettingsItem";
import DeliveryItem from "./SideBarItems/DeliveryItem";

export type Tab =
  | "dashboard"
  | "products"
  | "inventory"
  | "orders"
  | "deliveries"
  | "users"
  | "settings";

interface SideBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  deliveryTab?: 'orders' | 'delivered';
  onDeliveryTabChange?: (tab: 'orders' | 'delivered') => void;
}

export default function SideBar({
  activeTab,
  onTabChange,
  isMobileOpen = false,
  onCloseMobile,
  deliveryTab,
  onDeliveryTabChange
}: SideBarProps) {
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
  fixed lg:sticky top-0 inset-y-0 left-0 z-50
  w-64 bg-white shadow-xl border-r border-gray-200
  transform transition-transform duration-300 ease-in-out
  ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  h-screen
  `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 font-display">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-500">Tableau de bord</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <DashboardItem
            active={activeTab === "dashboard"}
            onClick={() => onTabChange("dashboard")}
            stats={{
              totalSales: 1250000,
              totalOrders: 342,
              totalUsers: 1245,
              totalProducts: 89,
            }}
          />
          <ProductsItem
            active={activeTab === "products"}
            onClick={() => onTabChange("products")}
          />
          <InventoryItem
            active={activeTab === "inventory"}
            onClick={() => onTabChange("inventory")}
          />

          <OrdersItem
            active={activeTab === "orders"}
            onClick={() => onTabChange("orders")}
          />

          <DeliveryItem
            active={activeTab === "deliveries"}
            onClick={() => onTabChange("deliveries")}
            deliveryTab={deliveryTab}
             onDeliveryTabChange={onDeliveryTabChange} // ← Passez directement la prop
          />


          <UsersItem
            active={activeTab === "users"}
            onClick={() => onTabChange("users")}
          />
          <SettingsItem
            active={activeTab === "settings"}
            onClick={() => onTabChange("settings")}
          />
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
            <p className="text-sm font-medium text-indigo-900">E-Shop Admin</p>
            <p className="text-xs text-indigo-600 mt-1">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}
