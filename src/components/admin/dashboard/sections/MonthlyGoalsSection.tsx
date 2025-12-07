import { useState, useMemo } from "react";
import {
  Target,
  Trophy,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BarChart3,
  Plus,
} from "lucide-react";
import { useOrders } from "../../../../hooks/useOrders";
import { useUsers } from "../../../../hooks/useUsers";
import { useProductSales } from "../../../../hooks/useProductSales";

interface Goal {
  id: string;
  title: string;
  category: "revenue" | "customers" | "orders" | "products" | "conversion";
  target: number;
  current: number;
  unit: string;
  deadline: string;
  progress: number;
  status: "on_track" | "at_risk" | "completed" | "not_started";
  priority: "high" | "medium" | "low";
}

export default function MonthlyGoalsSection() {
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();
  const { productSales, loading: salesLoading } = useProductSales();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);

  const monthlyGoals = useMemo((): Goal[] => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_amount,
      0
    );
    const newCustomers = users.filter((user) => {
      const userDate = new Date(user.created_at);
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      return userDate >= monthStart;
    }).length;

    // Objectifs simulés basés sur les performances actuelles
    return [
      {
        id: "1",
        title: "Revenue Mensuel",
        category: "revenue",
        target: 5000000,
        current: totalRevenue,
        unit: "XOF",
        deadline: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toISOString(),
        progress: (totalRevenue / 5000000) * 100,
        status:
          totalRevenue >= 5000000
            ? "completed"
            : totalRevenue >= 3000000
            ? "on_track"
            : "at_risk",
        priority: "high",
      },
      {
        id: "2",
        title: "Nouveaux Clients",
        category: "customers",
        target: 50,
        current: newCustomers,
        unit: "clients",
        deadline: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toISOString(),
        progress: (newCustomers / 50) * 100,
        status:
          newCustomers >= 50
            ? "completed"
            : newCustomers >= 30
            ? "on_track"
            : "at_risk",
        priority: "high",
      },
      {
        id: "3",
        title: "Commandes Traitées",
        category: "orders",
        target: 100,
        current: orders.length,
        unit: "commandes",
        deadline: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toISOString(),
        progress: (orders.length / 100) * 100,
        status:
          orders.length >= 100
            ? "completed"
            : orders.length >= 60
            ? "on_track"
            : "at_risk",
        priority: "medium",
      },
      {
        id: "4",
        title: "Taux de Conversion",
        category: "conversion",
        target: 4.0,
        current: 3.2,
        unit: "%",
        deadline: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toISOString(),
        progress: (3.2 / 4.0) * 100,
        // eslint-disable-next-line no-constant-condition
        status: 3.2 >= 4.0 ? "completed" : 3.2 >= 3.0 ? "on_track" : "at_risk",
        priority: "medium",
      },
      {
        id: "5",
        title: "Produits Vendus",
        category: "products",
        target: 500,
        current: productSales.reduce(
          (sum, sale) => sum + sale.quantity_sold,
          0
        ),
        unit: "unités",
        deadline: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toISOString(),
        progress:
          (productSales.reduce((sum, sale) => sum + sale.quantity_sold, 0) /
            500) *
          100,
        status:
          productSales.reduce((sum, sale) => sum + sale.quantity_sold, 0) >= 500
            ? "completed"
            : "on_track",
        priority: "low",
      },
      {
        id: "6",
        title: "Panier Moyen",
        category: "revenue",
        target: 30000,
        current: orders.length > 0 ? totalRevenue / orders.length : 0,
        unit: "XOF",
        deadline: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0
        ).toISOString(),
        progress:
          orders.length > 0 ? (totalRevenue / orders.length / 30000) * 100 : 0,
        status:
          orders.length > 0 && totalRevenue / orders.length >= 30000
            ? "completed"
            : "at_risk",
        priority: "medium",
      },
    ];
  }, [orders, users, productSales]);

  const filteredGoals = useMemo(() => {
    return monthlyGoals.filter((goal) => {
      const matchesCategory =
        selectedCategory === "all" || goal.category === selectedCategory;
      const matchesCompleted = showCompleted
        ? true
        : goal.status !== "completed";
      return matchesCategory && matchesCompleted;
    });
  }, [monthlyGoals, selectedCategory, showCompleted]);

  const categories = [
    { id: "all", label: "Tous les objectifs", count: monthlyGoals.length },
    {
      id: "revenue",
      label: "Revenue",
      count: monthlyGoals.filter((g) => g.category === "revenue").length,
    },
    {
      id: "customers",
      label: "Clients",
      count: monthlyGoals.filter((g) => g.category === "customers").length,
    },
    {
      id: "orders",
      label: "Commandes",
      count: monthlyGoals.filter((g) => g.category === "orders").length,
    },
    {
      id: "conversion",
      label: "Conversion",
      count: monthlyGoals.filter((g) => g.category === "conversion").length,
    },
    {
      id: "products",
      label: "Produits",
      count: monthlyGoals.filter((g) => g.category === "products").length,
    },
  ];

  const formatXOF = (amount: number): string => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "XOF",
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    });
  };

  const getStatusConfig = (status: Goal["status"]) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          label: "Terminé",
        };
      case "on_track":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: TrendingUp,
          label: "En bonne voie",
        };
      case "at_risk":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          label: "En risque",
        };
      case "not_started":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: XCircle,
          label: "Non commencé",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: Clock,
          label: "En cours",
        };
    }
  };

  const getPriorityConfig = (priority: Goal["priority"]) => {
    switch (priority) {
      case "high":
        return { color: "bg-red-100 text-red-800", label: "Élevée" };
      case "medium":
        return { color: "bg-yellow-100 text-yellow-800", label: "Moyenne" };
      case "low":
        return { color: "bg-green-100 text-green-800", label: "Basse" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Non définie" };
    }
  };

  const overallProgress = useMemo(() => {
    const completedGoals = monthlyGoals.filter(
      (goal) => goal.status === "completed"
    ).length;
    return (completedGoals / monthlyGoals.length) * 100;
  }, [monthlyGoals]);

  if (ordersLoading || usersLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Objectifs du Mois
          </h1>
          <p className="text-gray-600 mt-1">
            Suivi et progression des objectifs commerciaux
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showCompleted
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showCompleted ? "Masquer terminés" : "Afficher terminés"}
          </button>

          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Objectif
          </button>
        </div>
      </div>

      {/* Progression globale */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              Progression Globale du Mois
            </h2>
            <p className="text-blue-100">
              {monthlyGoals.filter((g) => g.status === "completed").length} sur{" "}
              {monthlyGoals.length} objectifs atteints
            </p>
          </div>
          <Trophy className="h-12 w-12 text-yellow-300" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Progression globale</span>
            <span className="font-semibold">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 transition-all duration-1000"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className="text-2xl font-bold">
              {monthlyGoals.filter((g) => g.status === "completed").length}
            </p>
            <p className="text-sm text-blue-100">Terminés</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {monthlyGoals.filter((g) => g.status === "on_track").length}
            </p>
            <p className="text-sm text-blue-100">En bonne voie</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {monthlyGoals.filter((g) => g.status === "at_risk").length}
            </p>
            <p className="text-sm text-blue-100">En risque</p>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Liste des objectifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const statusConfig = getStatusConfig(goal.status);
          const priorityConfig = getPriorityConfig(goal.priority);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {goal.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color}`}
                    >
                      {priorityConfig.label}
                    </span>
                  </div>
                </div>
                <Target className="h-6 w-6 text-gray-400 flex-shrink-0" />
              </div>

              {/* Progression */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-semibold text-gray-900">
                    {goal.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      goal.status === "completed"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : goal.status === "on_track"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                        : goal.status === "at_risk"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                        : "bg-gradient-to-r from-gray-500 to-gray-400"
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {goal.category === "revenue"
                      ? formatXOF(goal.current)
                      : goal.category === "conversion"
                      ? `${goal.current}%`
                      : goal.current}
                  </span>
                  <span className="text-gray-500">
                    sur{" "}
                    {goal.category === "revenue"
                      ? formatXOF(goal.target)
                      : goal.category === "conversion"
                      ? `${goal.target}%`
                      : goal.target}{" "}
                    {goal.unit}
                  </span>
                </div>
              </div>

              {/* Date d'échéance */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  Échéance: {formatDate(goal.deadline)}
                </div>

                {goal.status === "completed" && (
                  <Award className="h-5 w-5 text-green-500" />
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2 mt-4">
                <button className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                  Modifier
                </button>
                <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Détails
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun objectif trouvé</p>
          <p className="text-gray-400 text-sm mt-1">
            Aucun objectif ne correspond à vos critères de filtrage
          </p>
        </div>
      )}

      {/* Statistiques des objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600 mb-2">
            <CheckCircle className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {monthlyGoals.filter((g) => g.status === "completed").length}
          </p>
          <p className="text-sm text-gray-600">Objectifs Atteints</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 mb-2">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {monthlyGoals.filter((g) => g.status === "on_track").length}
          </p>
          <p className="text-sm text-gray-600">En Bonne Voie</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 mb-2">
            <Clock className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {monthlyGoals.filter((g) => g.status === "at_risk").length}
          </p>
          <p className="text-sm text-gray-600">En Risque</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 text-gray-600 mb-2">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {overallProgress.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Progression Moyenne</p>
        </div>
      </div>
    </div>
  );
}
