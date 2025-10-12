import { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Search,
  Plus,
  Minus,
  Eye,
  Grid3X3,
  List,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  Product,
  InventoryStats,
  LowStockAlert,
  InventoryFilters,
} from "../../models";
import { useToastContext } from "../../hooks/ToastProvider";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useProductSales } from "../../hooks/useProductSales";
import { useInventoryStats } from "../../hooks/useInventoryStats";

export default function InventorySection() {
  const {
    products,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
    updateProductStock,
  } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { productSales, loading: salesLoading } = useProductSales();
  const { stats: inventoryStats, loading: statsLoading } = useInventoryStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<InventoryFilters>({
    category: "all",
    stockStatus: "all",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [, setSelectedProduct] = useState<Product | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const { success, error: toastError } = useToastContext();

  const loading =
    productsLoading || categoriesLoading || salesLoading || statsLoading;

  // Utiliser les stats dynamiques depuis le hook
  const stats: InventoryStats = useMemo(() => {
    if (inventoryStats) {
      return inventoryStats;
    }

    // Fallback local si les stats ne sont pas encore chargées
    const totalProducts = products.length;
    const lowStockProducts = products.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
    ).length;
    const outOfStockProducts = products.filter(
      (p) => p.stock_quantity === 0
    ).length;
    const totalValue = products.reduce(
      (sum, product) => sum + product.price * product.stock_quantity,
      0
    );
    const totalSales = productSales.reduce(
      (sum, sale) => sum + sale.quantity_sold,
      0
    );
    const assistantSales = productSales.reduce(
      (sum, sale) => sum + sale.quantity_sold,
      0
    );

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      totalSales,
      assistantSales,
    };
  }, [inventoryStats, products, productSales]);

  // Alertes de stock faible dynamiques
  const lowStockAlerts: LowStockAlert[] = useMemo(() => {
    return products
      .filter(
        (product) => product.stock_quantity > 0 && product.stock_quantity <= 10
      )
      .map((product) => ({
        product_id: product.id,
        product_name: product.name,
        current_stock: product.stock_quantity,
        threshold: 10,
        urgency:
          product.stock_quantity <= 3
            ? "high"
            : product.stock_quantity <= 5
            ? "medium"
            : ("low" as const),
      }));
  }, [products]);

  // Produits filtrés et triés
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtre par catégorie
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === filters.category
      );
    }

    // Filtre par statut de stock
    switch (filters.stockStatus) {
      case "in_stock":
        filtered = filtered.filter((product) => product.stock_quantity > 5);
        break;
      case "low_stock":
        filtered = filtered.filter(
          (product) => product.stock_quantity > 0 && product.stock_quantity <= 5
        );
        break;
      case "out_of_stock":
        filtered = filtered.filter((product) => product.stock_quantity === 0);
        break;
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (filters.sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "stock":
          aValue = a.stock_quantity;
          bValue = b.stock_quantity;
          break;
        case "sales": {
          const aSales =
            productSales.find((s) => s.product_id === a.id)?.quantity_sold || 0;
          const bSales =
            productSales.find((s) => s.product_id === b.id)?.quantity_sold || 0;
          aValue = aSales;
          bValue = bSales;
          break;
        }
        case "revenue": {
          const aRevenue =
            productSales.find((s) => s.product_id === a.id)?.total_revenue || 0;
          const bRevenue =
            productSales.find((s) => s.product_id === b.id)?.total_revenue || 0;
          aValue = aRevenue;
          bValue = bRevenue;
          break;
        }
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchTerm, filters, productSales]);

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  const getStockStatusColor = (quantity: number): string => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity <= 5) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getStockStatusText = (quantity: number): string => {
    if (quantity === 0) return "Rupture";
    if (quantity <= 5) return "Stock faible";
    return "En stock";
  };

  const handleUpdateStock = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    setIsUpdatingStock(true);
    try {
      await updateProductStock(productId, newQuantity);
      success("Stock mis à jour", "La quantité a été mise à jour avec succès");
    } catch (err: unknown) {
      console.error("Erreur mise à jour stock:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour du stock";
      toastError("Erreur", errorMessage);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleExportInventory = () => {
    // Créer un CSV des produits
    const headers = [
      "Nom",
      "Description",
      "Prix",
      "Stock",
      "Catégorie",
      "Statut",
    ];
    const csvData = filteredProducts.map((product) => [
      product.name,
      product.description || "",
      formatXOF(product.price),
      product.stock_quantity.toString(),
      categories.find((c) => c.id === product.category_id)?.name ||
        "Non catégorisé",
      getStockStatusText(product.stock_quantity),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventaire-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success("Export réussi", "L'inventaire a été exporté avec succès");
  };

  const handleRefresh = async () => {
    await refetchProducts();
    success("Actualisé", "Les données ont été actualisées");
  };

  // Gestion des changements de filtres avec typage correct
  const handleFilterChange = <K extends keyof InventoryFilters>(
    key: K,
    value: InventoryFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (productsError) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600 mb-4">{productsError}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex space-x-3 mt-4 lg:mt-0">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec titre et actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Gestion de l'inventaire
          </h1>
          <p className="text-gray-600 mt-1">
            Suivi et gestion des stocks de vos produits
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={handleExportInventory}
            disabled={filteredProducts.length === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={isUpdatingStock}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isUpdatingStock ? "animate-spin" : ""}`}
            />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques dynamiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Produits
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.lowStockProducts}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventes Total</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalSales}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
              <p className="text-lg font-bold text-purple-600">
                {formatXOF(stats.totalValue)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertes de stock faible dynamiques */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">
                Alertes Stock Faible
              </h3>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
              {lowStockAlerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {lowStockAlerts.map((alert) => (
              <div
                key={alert.product_id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-yellow-100"
              >
                <span className="text-sm font-medium text-gray-900">
                  {alert.product_name}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.urgency === "high"
                      ? "bg-red-100 text-red-800"
                      : alert.urgency === "medium"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {alert.current_stock} unités restantes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Filtres et vue */}
          <div className="flex items-center space-x-4">
            {/* Sélecteur de catégorie */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Toutes catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sélecteur de statut de stock */}
            <select
              value={filters.stockStatus}
              onChange={(e) =>
                handleFilterChange(
                  "stockStatus",
                  e.target.value as InventoryFilters["stockStatus"]
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tous les stocks</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Rupture</option>
            </select>

            {/* Sélecteur de tri */}
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange(
                  "sortBy",
                  e.target.value as InventoryFilters["sortBy"]
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="name">Nom</option>
              <option value="stock">Stock</option>
              <option value="sales">Ventes</option>
              <option value="revenue">Revenu</option>
            </select>

            {/* Sélecteur d'ordre de tri */}
            <select
              value={filters.sortOrder}
              onChange={(e) =>
                handleFilterChange(
                  "sortOrder",
                  e.target.value as InventoryFilters["sortOrder"]
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="asc">Croissant</option>
              <option value="desc">Décroissant</option>
            </select>

            {/* Boutons de vue */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const productSale = productSales.find(
              (s) => s.product_id === product.id
            );
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image du produit */}
                <div className="h-48 bg-gray-100 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : null}
                  {!product.image_url && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(
                      product.stock_quantity
                    )}`}
                  >
                    {getStockStatusText(product.stock_quantity)}
                  </div>
                </div>

                {/* Informations du produit */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Prix:</span>
                      <span className="font-semibold text-gray-900">
                        {formatXOF(product.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900">
                        {product.stock_quantity} unités
                      </span>
                    </div>
                    {productSale && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ventes:</span>
                          <span className="font-semibold text-green-600">
                            {productSale.quantity_sold}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Revenu:</span>
                          <span className="font-semibold text-green-600">
                            {formatXOF(productSale.total_revenue)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vue liste */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const productSale = productSales.find(
                    (s) => s.product_id === product.id
                  );
                  const category = categories.find(
                    (c) => c.id === product.category_id
                  );
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {category?.name || "Non catégorisé"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatXOF(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(
                            product.stock_quantity
                          )}`}
                        >
                          {product.stock_quantity} unités
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {productSale?.quantity_sold || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        {formatXOF(productSale?.total_revenue || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateStock(
                                product.id,
                                product.stock_quantity - 1
                              )
                            }
                            disabled={
                              product.stock_quantity === 0 || isUpdatingStock
                            }
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {product.stock_quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateStock(
                                product.id,
                                product.stock_quantity + 1
                              )
                            }
                            disabled={isUpdatingStock}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message vide */}
      {filteredProducts.length === 0 && !loading && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Aucun produit ne correspond à votre recherche"
              : "Aucun produit dans l'inventaire"}
          </p>
        </div>
      )}
    </div>
  );
}
