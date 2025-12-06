import { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Search,
  Grid3X3,
  List,
  Download,
  RefreshCw,
  // Tag,
  // Percent,
  Eye,
} from "lucide-react";
import {
  InventoryStats,
  InventoryFilters,
  ProductWithWholesale
} from "../../models";
import { useToastContext } from "../../hooks/ToastProvider";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { useProductSales } from "../../hooks/useProductSales";
import { useInventoryStats } from "../../hooks/useInventoryStats";
import WholesaleModal from "../admin/Modals/WholesaleModal";
import { formatXOF } from "../../lib/currency";

export default function InventorySection() {
  // TOUTES LES FONCTIONNALITÉS EXISTANTES PRÉSERVÉES
  const {
    products,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
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
  const [isUpdatingStock] = useState(false);
  const { success } = useToastContext();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // NOUVEAUX ÉTATS POUR LES PRIX EN GROS (AJOUTÉS SANS TOUCHER AU RESTE)
  const [wholesaleFilter, setWholesaleFilter] = useState<'all' | 'with_wholesale' | 'without_wholesale'>('all');
  const [isWholesaleModalOpen, setIsWholesaleModalOpen] = useState(false);
  const [selectedProductForWholesale, setSelectedProductForWholesale] = useState<ProductWithWholesale | null>(null);
  const [wholesaleModalMode, setWholesaleModalMode] = useState<'add' | 'edit'>('add');

  const loading =
    productsLoading || categoriesLoading || salesLoading || statsLoading;

  // TOUTES LES STATISTIQUES EXISTANTES PRÉSERVÉES
  const stats: InventoryStats = useMemo(() => {
    if (inventoryStats) {
      return inventoryStats;
    }

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
      currentMonthSales: 0,
      currentWeekSales: 0,
    } as InventoryStats;
  }, [inventoryStats, products, productSales]);

  // FONCTION UTILITAIRE POUR LES PRIX EN GROS (AJOUTÉE)
  const getProductWithWholesaleInfo = (product: any): ProductWithWholesale => {
    // Pour l'instant, retourner le produit sans info de prix en gros
    // Vous devrez adapter cette fonction selon votre structure de données
    return {
      ...product,
      has_wholesale: false,
      wholesale_tiers: [],
    };
  };

  // PRODUITS FILTRÉS AVEC TOUS LES FILTRES EXISTANTS + NOUVEAU FILTRE WHOLESALE
  const filteredProducts = useMemo(() => {
    // FILTRAGE EXISTANT PRÉSERVÉ
    let filtered = products.filter((product) => product.is_public === true);

    // Filtre par mois (EXISTANT)
    if (selectedMonth !== "all") {
      const selectedDate = new Date(selectedMonth + "-01");
      const monthStart = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      const monthEnd = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      );

      filtered = filtered.filter((product) => {
        const productDate = new Date(product.created_at);
        return productDate >= monthStart && productDate <= monthEnd;
      });
    }

    // NOUVEAU FILTRE POUR PRIX EN GROS (AJOUTÉ)
    if (wholesaleFilter !== "all") {
      filtered = filtered.filter((product) => {
        const productWithWholesale = getProductWithWholesaleInfo(product);
        if (wholesaleFilter === "with_wholesale") {
          return productWithWholesale.has_wholesale;
        } else {
          return !productWithWholesale.has_wholesale;
        }
      });
    }

    // Filtre de recherche (EXISTANT)
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie (EXISTANT)
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.category_id === filters.category
      );
    }

    // Filtre par statut de stock (EXISTANT)
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

    // Tri (EXISTANT)
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
  }, [products, selectedMonth, wholesaleFilter, searchTerm, filters, productSales]);

  // TOUTES LES FONCTIONS EXISTANTES PRÉSERVÉES
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

  const getLast12Months = () => {
    const months = [];
    months.push({ value: "all", label: "Tous les mois" });

    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleString("fr-FR", {
        month: "long",
        year: "numeric",
      });
      months.push({ value, label });
    }

    return months;
  };

  // FONCTION D'EXPORT EXISTANTE PRÉSERVÉE
  const handleExportInventory = () => {
    let periodLabel = "Tous les mois";
    let fileName = "inventaire-complet";

    if (selectedMonth !== "all") {
      const selectedDate = new Date(selectedMonth + "-01");
      const month = selectedDate.toLocaleString("fr-FR", { month: "long" });
      const year = selectedDate.getFullYear();
      periodLabel = `${month} ${year}`;
      fileName = `inventaire-${month}-${year}`;
    }

    const formattedDate = new Date().toLocaleDateString("fr-FR");

    const headers = [
      "ID Produit",
      "Nom du Produit",
      "Description",
      "Catégorie",
      "Prix Unitaire (XOF)",
      "Stock Actuel",
      "Statut Stock",
      "Niveau Urgence",
      "Ventes Total",
      "Revenu Total (XOF)",
      "Date de Création",
      "Dernière Mise à Jour",
    ];

    const csvData = filteredProducts.map((product) => {
      const productSale = productSales.find((s) => s.product_id === product.id);
      const category = categories.find((c) => c.id === product.category_id);

      let urgencyLevel = "Normal";
      if (product.stock_quantity === 0) {
        urgencyLevel = "Rupture";
      } else if (product.stock_quantity <= 3) {
        urgencyLevel = "Critique";
      } else if (product.stock_quantity <= 5) {
        urgencyLevel = "Faible";
      } else if (product.stock_quantity <= 10) {
        urgencyLevel = "Attention";
      }

      return [
        product.id,
        product.name,
        product.description || "N/A",
        category?.name || "Non catégorisé",
        product.price.toString().replace(".", ","),
        product.stock_quantity.toString(),
        getStockStatusText(product.stock_quantity),
        urgencyLevel,
        (productSale?.quantity_sold || 0).toString(),
        (productSale?.total_revenue || 0).toString().replace(".", ","),
        new Date(product.created_at).toLocaleDateString("fr-FR"),
        product.updated_at
          ? new Date(product.updated_at).toLocaleDateString("fr-FR")
          : "N/A",
      ];
    });

    const totalStockValue = filteredProducts.reduce(
      (sum, product) => sum + product.price * product.stock_quantity,
      0
    );
    const totalRevenue = filteredProducts.reduce((sum, product) => {
      const productSale = productSales.find((s) => s.product_id === product.id);
      return sum + (productSale?.total_revenue || 0);
    }, 0);
    const totalUnitsSold = filteredProducts.reduce((sum, product) => {
      const productSale = productSales.find((s) => s.product_id === product.id);
      return sum + (productSale?.quantity_sold || 0);
    }, 0);

    const summaryRow1 = ["", "", "", "", "", "", "", "", "", "", "", ""];
    const summaryRow2 = [
      "RÉSUMÉ INVENTAIRE",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ];
    const summaryRow3 = [
      `Total Produits: ${filteredProducts.length}`,
      "",
      `Stock Faible: ${
        filteredProducts.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
        ).length
      }`,
      "",
      `Rupture: ${
        filteredProducts.filter((p) => p.stock_quantity === 0).length
      }`,
      "",
      `Ventes Total: ${totalUnitsSold} unités`,
      "",
      `Revenu Total: ${formatXOF(totalRevenue).replace("CFA", "XOF")}`,
      "",
      `Valeur Stock: ${formatXOF(totalStockValue).replace("CFA", "XOF")}`,
      "",
    ];
    const summaryRow4 = [
      "INFORMATIONS EXPORT",
      "",
      `Date: ${formattedDate}`,
      "",
      `Période: ${periodLabel}`,
      "",
      `Généré automatiquement`,
      "",
      "",
      "",
      "",
      "",
    ];

    const csvContent = [
      [`INVENTAIRE ${periodLabel.toUpperCase()}`],
      [""],
      headers,
      ...csvData,
      summaryRow1,
      summaryRow2,
      summaryRow3,
      summaryRow4,
    ]
      .map((row) => row.map((field) => `"${field}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 100);

    success(
      "Export réussi",
      `L'inventaire ${periodLabel.toLowerCase()} a été exporté avec succès`
    );
  };

  const handleRefresh = async () => {
    await refetchProducts();
    success("Actualisé", "Les données ont été actualisées");
  };

  const handleFilterChange = <K extends keyof InventoryFilters>(
    key: K,
    value: InventoryFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // NOUVELLES FONCTIONS POUR LES PRIX EN GROS (AJOUTÉES)
  const openWholesaleModal = (product: any, mode: 'add' | 'edit' = 'add') => {
    const productWithWholesale = getProductWithWholesaleInfo(product);
    setSelectedProductForWholesale(productWithWholesale);
    setWholesaleModalMode(mode);
    setIsWholesaleModalOpen(true);
  };

  const handleWholesaleSave = async (
    productId: string,
    minQuantity: number,
    wholesalePrice: number,
    mode: 'add' | 'edit',
    wholesaleId?: string
  ) => {
    try {
      // Implémentez cette fonction selon votre backend
      console.log("Saving wholesale price:", { productId, minQuantity, wholesalePrice, mode, wholesaleId });
      
      // Exemple d'implémentation :
      // if (mode === 'add') {
      //   await supabase.from('wholesale_pricing').insert({
      //     product_id: productId,
      //     min_quantity: minQuantity,
      //     wholesale_price: wholesalePrice,
      //     is_active: true,
      //   });
      // } else if (mode === 'edit' && wholesaleId) {
      //   await supabase
      //     .from('wholesale_pricing')
      //     .update({
      //       min_quantity: minQuantity,
      //       wholesale_price: wholesalePrice,
      //       updated_at: new Date().toISOString(),
      //     })
      //     .eq('id', wholesaleId);
      // }
      
      success('Succès', 'Prix en gros mis à jour');
      setIsWholesaleModalOpen(false);
      setSelectedProductForWholesale(null);
    } catch (err: any) {
      console.error('Error saving wholesale price:', err);
    }
  };

  // AFFICHAGE DES ERREURS (EXISTANT)
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

  // LOADING STATE (EXISTANT)
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
      {/* EN-TÊTE AVEC TOUTES LES ACTIONS EXISTANTES + NOUVELLE ACTION */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 lg:mt-0">
          {/* Sélecteur de mois (EXISTANT) */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="month-select"
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Période:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {getLast12Months().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* NOUVEAU FILTRE POUR PRIX EN GROS (AJOUTÉ) */}
          <select
            value={wholesaleFilter}
            onChange={(e) => setWholesaleFilter(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Tous les produits</option>
            <option value="with_wholesale">Avec prix en gros</option>
            <option value="without_wholesale">Sans prix en gros</option>
          </select>

          {/* Bouton d'export (EXISTANT) */}
          <button
            onClick={handleExportInventory}
            disabled={filteredProducts.length === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>
              Exporter{" "}
              {selectedMonth !== "all"
                ? `(${new Date(selectedMonth + "-01").toLocaleString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })})`
                : "(Tous les mois)"}
            </span>
          </button>

          {/* Bouton d'actualisation (EXISTANT) */}
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

      {/* STATISTIQUES DYNAMIQUES - PRÉSERVÉES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedMonth === "all" ? (
          <>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Ventes du Mois
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.currentMonthSales}
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
                  <p className="text-sm font-medium text-gray-600">
                    Ventes de la Semaine
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.currentWeekSales}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventes Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalSales}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {formatXOF(stats.totalValue)}
                  </p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Produits du Mois
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredProducts.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedMonth + "-01").toLocaleString("fr-FR", { 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Stock Faible
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {filteredProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Attention requise
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
                  <p className="text-sm font-medium text-gray-600">En Rupture</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredProducts.filter(p => p.stock_quantity === 0).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Réapprovisionnement
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {formatXOF(filteredProducts.reduce((sum, product) => sum + product.price * product.stock_quantity, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Valeur du mois
                  </p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BARRE DE FILTRES AMÉLIORÉE */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Recherche (EXISTANT) */}
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

          {/* Filtres et vue (EXISTANTS) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {/* Sélecteur de catégorie (EXISTANT) */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Toutes catégories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sélecteur de statut de stock (EXISTANT) */}
              <select
                value={filters.stockStatus}
                onChange={(e) =>
                  handleFilterChange(
                    "stockStatus",
                    e.target.value as InventoryFilters["stockStatus"]
                  )
                }
                className="flex-1 min-w-[140px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">Tous les stocks</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Sélecteur de tri (EXISTANT) */}
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange(
                    "sortBy",
                    e.target.value as InventoryFilters["sortBy"]
                  )
                }
                className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="name">Nom</option>
                <option value="stock">Stock</option>
                <option value="sales">Ventes</option>
                <option value="revenue">Revenu</option>
              </select>

              {/* Sélecteur d'ordre de tri (EXISTANT) */}
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange(
                    "sortOrder",
                    e.target.value as InventoryFilters["sortOrder"]
                  )
                }
                className="flex-1 min-w-[120px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </select>

              {/* Boutons de vue (EXISTANTS) */}
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
      </div>

      {/* VUE GRID AMÉLIORÉE */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const productSale = productSales.find(
              (s) => s.product_id === product.id
            );
            const productWithWholesale = getProductWithWholesaleInfo(product);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                {/* Image du produit (EXISTANT) */}
                <div className="h-40 sm:h-48 bg-gray-100 relative">
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
                      <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badge de statut de stock (EXISTANT) */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(
                      product.stock_quantity
                    )}`}
                  >
                    {getStockStatusText(product.stock_quantity)}
                  </div>
                  
                  {/* NOUVEAU BADGE POUR PRIX EN GROS (AJOUTÉ) */}
                  {productWithWholesale.has_wholesale && (
                    <div className="absolute top-2 left-2">
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                        Prix en gros
                      </div>
                    </div>
                  )}
                </div>

                {/* Informations du produit (EXISTANT) */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
                    {product.name}
                    {productWithWholesale.has_wholesale && (
                      <span className="ml-2 text-xs text-emerald-600 font-medium">
                        • Gros
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Prix:</span>
                      <span className="font-semibold text-gray-900">
                        {formatXOF(product.price)}
                      </span>
                    </div>
                    
                    {/* NOUVEAU : PRIX EN GROS SI DISPONIBLE (AJOUTÉ) */}
                    {productWithWholesale.wholesale_tiers && productWithWholesale.wholesale_tiers.length > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-emerald-600 font-medium">
                          {productWithWholesale.wholesale_tiers[0].min_quantity}+ unités:
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {formatXOF(productWithWholesale.wholesale_tiers[0].wholesale_price)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Stock:</span>
                      <span className="font-semibold text-gray-900">
                        {product.stock_quantity} unités
                      </span>
                    </div>
                    {productSale && (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Ventes:</span>
                          <span className="font-semibold text-green-600">
                            {productSale.quantity_sold}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Revenu:</span>
                          <span className="font-semibold text-green-600">
                            {formatXOF(productSale.total_revenue)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* NOUVEAU : BOUTON POUR GÉRER LES PRIX EN GROS (AJOUTÉ) */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openWholesaleModal(
                        product, 
                        productWithWholesale.has_wholesale ? 'edit' : 'add'
                      )}
                      className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                        productWithWholesale.has_wholesale
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {productWithWholesale.has_wholesale ? (
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Gérer
                        </span>
                      ) : (
                        "Ajouter prix gros"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VUE LISTE AMÉLIORÉE */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Régulier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix en Gros
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const productWithWholesale = getProductWithWholesaleInfo(product);
                  const productSale = productSales.find(
                    (s) => s.product_id === product.id
                  );
                  const category = categories.find(
                    (c) => c.id === product.category_id
                  );

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                              {productWithWholesale.has_wholesale && (
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                                  Gros
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {category?.name || "Non catégorisé"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {formatXOF(product.price)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {productWithWholesale.has_wholesale && 
                         productWithWholesale.wholesale_tiers && 
                         productWithWholesale.wholesale_tiers.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-emerald-700">
                              {formatXOF(productWithWholesale.wholesale_tiers[0].wholesale_price)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {productWithWholesale.wholesale_tiers[0].min_quantity}+ unités
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Non configuré</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(
                            product.stock_quantity
                          )}`}
                        >
                          {product.stock_quantity} unités
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {productSale?.quantity_sold || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openWholesaleModal(
                              product, 
                              productWithWholesale.has_wholesale ? 'edit' : 'add'
                            )}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              productWithWholesale.has_wholesale
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {productWithWholesale.has_wholesale ? 'Gérer' : 'Ajouter'}
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

      {/* MESSAGE VIDE (EXISTANT) */}
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
          {wholesaleFilter !== "all" && (
            <p className="text-sm text-gray-500 mt-2">
              Essayez de changer le filtre "Prix en gros"
            </p>
          )}
        </div>
      )}

      {/* MODAL DE GESTION DES PRIX EN GROS (NOUVEAU) */}
      {isWholesaleModalOpen && selectedProductForWholesale && (
        <WholesaleModal
          isOpen={isWholesaleModalOpen}
          onClose={() => {
            setIsWholesaleModalOpen(false);
            setSelectedProductForWholesale(null);
          }}
          mode={wholesaleModalMode}
          regularProducts={[selectedProductForWholesale]}
          selectedProduct={selectedProductForWholesale}
          onProductSelect={() => {}}
          wholesaleProduct={selectedProductForWholesale.wholesale_tiers?.[0]}
          onSave={handleWholesaleSave}
        />
      )}
    </div>
  );
}