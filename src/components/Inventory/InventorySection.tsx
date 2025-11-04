import { useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  // DollarSign,
  Search,
  // Plus,
  // Minus,
  // Eye,
  Grid3X3,
  List,
  Download,
  RefreshCw,
} from "lucide-react";
import {
  // Product,
  InventoryStats,
  // LowStockAlert,
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
  const [isUpdatingStock,] = useState(false);
  const { success, } = useToastContext();
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // "all" pour tous les mois par défaut

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

    // Fournir toutes les propriétés attendues par InventoryStats, avec des valeurs par défaut
    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      totalSales,
      assistantSales,
      // Valeurs par défaut pour les métriques temporelles (peuvent être calculées plus finement si des dates sont disponibles)
      currentMonthSales: 0,
      currentWeekSales: 0,
    } as InventoryStats;
  }, [inventoryStats, products, productSales]);

  // Alertes de stock faible dynamiques
  // const lowStockAlerts: LowStockAlert[] = useMemo(() => {
  //   return products
  //     .filter(
  //       (product) => product.stock_quantity > 0 && product.stock_quantity <= 10
  //     )
  //     .map((product) => ({
  //       product_id: product.id,
  //       product_name: product.name,
  //       current_stock: product.stock_quantity,
  //       threshold: 10,
  //       urgency:
  //         product.stock_quantity <= 3
  //           ? "high"
  //           : product.stock_quantity <= 5
  //           ? "medium"
  //           : ("low" as const),
  //     }));
  // }, [products]);

  // Produits filtrés et triés avec filtre par mois
  const filteredProducts = useMemo(() => {
    // Filtrer UNIQUEMENT les produits publics (is_public === true)
    let filtered = products.filter((product) => product.is_public === true);

    // Appliquer le filtre par mois si sélectionné
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

    // Ensuite appliquer le filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
  }, [products, selectedMonth, searchTerm, filters, productSales]);

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

  // const handleUpdateStock = async (productId: string, newQuantity: number) => {
  //   if (newQuantity < 0) return;

  //   setIsUpdatingStock(true);
  //   try {
  //     await updateProductStock(productId, newQuantity);
  //     success("Stock mis à jour", "La quantité a été mise à jour avec succès");
  //   } catch (err: unknown) {
  //     console.error("Erreur mise à jour stock:", err);
  //     const errorMessage =
  //       err instanceof Error
  //         ? err.message
  //         : "Erreur lors de la mise à jour du stock";
  //     toastError("Erreur", errorMessage);
  //   } finally {
  //     setIsUpdatingStock(false);
  //   }
  // };

  // Fonction pour générer les 12 derniers mois + option "Tous les mois"
  const getLast12Months = () => {
    const months = [];

    // Option "Tous les mois"
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

    // En-têtes professionnels pour Excel
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

    // Données des produits avec calculs réels
    const csvData = filteredProducts.map((product) => {
      const productSale = productSales.find((s) => s.product_id === product.id);
      const category = categories.find((c) => c.id === product.category_id);

      // Déterminer le niveau d'urgence du stock
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

    // Ligne de résumé détaillée
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

    // Créer le contenu CSV avec séparateur point-virgule pour Excel français
    const csvContent = [
      [`INVENTAIRE ${periodLabel.toUpperCase()}`], // Utiliser periodLabel adapté
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

    // Créer le blob avec BOM pour Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`); // Utiliser fileName adapté
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libérer l'URL
    setTimeout(() => URL.revokeObjectURL(url), 100);

    success(
      "Export réussi",
      `L'inventaire ${periodLabel.toLowerCase()} a été exporté avec succès`
    );
  };

  // Statistiques adaptées au filtre de mois
// const filteredStats: InventoryStats = useMemo(() => {
//   // Utiliser les produits filtrés pour calculer les stats
//   const totalProducts = filteredProducts.length;
//   const lowStockProducts = filteredProducts.filter(
//     (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
//   ).length;
//   const outOfStockProducts = filteredProducts.filter(
//     (p) => p.stock_quantity === 0
//   ).length;
//   const totalValue = filteredProducts.reduce(
//     (sum, product) => sum + product.price * product.stock_quantity,
//     0
//   );

//   // Calculer les ventes basées sur les produits filtrés
//   const totalSales = filteredProducts.reduce((sum, product) => {
//     const productSale = productSales.find((s) => s.product_id === product.id);
//     return sum + (productSale?.quantity_sold || 0);
//   }, 0);

//   // Pour les ventes du mois/semaine, on peut les calculer dynamiquement
//   // ou utiliser les stats globales si le filtre "Tous les mois" est actif
//   let currentMonthSales = stats.currentMonthSales;
//   let currentWeekSales = stats.currentWeekSales;

//   // Si un mois spécifique est sélectionné, adapter les stats de ventes
//   if (selectedMonth !== "all") {
//     // Calculer les ventes pour le mois sélectionné
//     currentMonthSales = filteredProducts.reduce((sum, product) => {
//       const productSale = productSales.find((s) => s.product_id === product.id);
//       return sum + (productSale?.quantity_sold || 0);
//     }, 0);
    
//     // Pour la semaine, on pourrait faire un calcul similaire si on avait les dates de vente
//     currentWeekSales = 0; // Ou calculer basé sur la semaine du mois sélectionné
//   }

//   return {
//     totalProducts,
//     lowStockProducts,
//     outOfStockProducts,
//     totalValue,
//     totalSales,
//     assistantSales: stats.assistantSales, // Garder les stats globales pour l'assistant
//     currentMonthSales,
//     currentWeekSales,
//     bestSellingProduct: stats.bestSellingProduct,
//     revenueGrowth: stats.revenueGrowth,
//   };
// }, [filteredProducts, productSales, stats, selectedMonth]);


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
        {/* <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Gestion de l'inventaire
          </h1>
          <p className="text-gray-600 mt-1">
            Suivi et gestion des stocks de vos produits
          </p>
        </div> */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 lg:mt-0">
          {/* Sélecteur de mois */}
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

          {/* Bouton d'export */}
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

          {/* Bouton d'actualisation */}
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
      {/* Statistiques dynamiques - Adaptées au filtre de mois */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {selectedMonth === "all" ? (
    // Afficher les stats globales quand aucun filtre de mois n'est appliqué
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
    // Afficher les stats adaptées quand un mois est sélectionné
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

      {/* Alertes de stock faible dynamiques */}
      {/* {lowStockAlerts.length > 0 && (
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
      )} */}

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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Première ligne de filtres */}
            <div className="flex flex-wrap gap-2">
              {/* Sélecteur de catégorie */}
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

              {/* Sélecteur de statut de stock */}
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

            {/* Deuxième ligne de filtres */}
            <div className="flex flex-wrap gap-2">
              {/* Sélecteur de tri */}
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

              {/* Sélecteur d'ordre de tri */}
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
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(
                      product.stock_quantity
                    )}`}
                  >
                    {getStockStatusText(product.stock_quantity)}
                  </div>
                </div>

                {/* Informations du produit */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base">
                    {product.name}
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
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vue liste - Section corrigée */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ventes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenu
                  </th>
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th> */}
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
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatXOF(product.price)}
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
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        {formatXOF(productSale?.total_revenue || 0)}
                      </td>
                      {/* <td className="px-4 py-3 text-sm font-medium">
                        <div className="flex items-center space-x-1 sm:space-x-2">
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
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors p-1"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center">
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
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors p-1"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td> */}
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
