import { useState, useEffect } from "react";
import {
  MoreVertical,
  Mail,
  User,
  Shield,
  CheckCircle,
  Star,
  Calendar,
  Truck,
} from "lucide-react";
import { Phone, UserCheck, UserX } from "lucide-react";
import { useUsers } from "../../../../hooks/useUsers";
import { supabase } from "../../../../lib/supabase";
import { useToastContext } from "../../../../hooks/ToastProvider";
import { User as UserType } from "../../../../models";

interface UsersSectionProps {
  searchTerm: string;
}

// Définir les rôles valides basés sur votre schéma
type ValidUserRole = "admin" | "client" | "assistant" | "livreur";

export default function UsersSection({ searchTerm }: UsersSectionProps) {
  const { users, refetch } = useUsers();
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<string | null>(
    null
  );
  const { success, error: toastError } = useToastContext();

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateUserRole = async (
    userId: string,
    newRole: ValidUserRole
  ) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      success(
        "Rôle mis à jour",
        `Le rôle a été changé en ${getRoleDisplayName(newRole)}`
      );
      refetch();
      setIsActionsMenuOpen(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      toastError("Erreur", "Erreur lors de la mise à jour du rôle");
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      success(
        "Statut modifié",
        `L'utilisateur a été ${!currentStatus ? "activé" : "désactivé"}`
      );
      refetch();
      setIsActionsMenuOpen(null);
    } catch (error) {
      console.error("Error updating user status:", error);
      toastError("Erreur", "Erreur lors de la modification du statut");
    }
  };

  const toggleActionsMenu = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsMenuOpen(isActionsMenuOpen === userId ? null : userId);
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => setIsActionsMenuOpen(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Statistiques
  const totalUsers = users.length;
  // const activeUsers = users.filter((u) => u.is_active).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const assistantUsers = users.filter((u) => u.role === "assistant").length;
  const livreurUsers = users.filter((u) => u.role === "livreur").length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "assistant":
        return "bg-orange-100 text-orange-800";
      case "livreur":
        return "bg-blue-100 text-blue-800";
      // case 'vendor': return 'bg-green-100 text-green-800';
      case "client":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (user: UserType) => {
    if (!user.is_active) {
      return {
        text: "Désactivé",
        color: "bg-red-100 text-red-800",
        icon: UserX,
      };
    }

    const accountAge = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (accountAge < 7) {
      return {
        text: "Nouveau",
        color: "bg-green-100 text-green-800",
        icon: UserCheck,
      };
    }

    return {
      text: "Actif",
      color: "bg-blue-100 text-blue-800",
      icon: UserCheck,
    };
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "assistant":
        return "Assistant";
      case "livreur":
        return "Livreur";
      // case 'vendor': return 'Vendeur';
      case "client":
        return "Client";
      default:
        return role;
    }
  };

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "Non renseigné";

    // Format: 77 123 45 67
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 9) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
        5,
        7
      )} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  // AJOUTER: Fonction pour obtenir l'initiale du nom
  const getUserInitial = (user: UserType): string => {
    if (user.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const canPromoteToAssistant = (user: UserType): boolean => {
    // Seuls les clients et livreurs peuvent être promus assistant
    return user.role === "client" || user.role === "livreur";
  };

  const canDemoteFromAssistant = (user: UserType): boolean => {
    // Un assistant peut être rétrogradé en client
    return user.role === "assistant";
  };

  const canPromoteToAdmin = (user: UserType): boolean => {
    // Seuls les assistants peuvent être promus admin
    return user.role === "assistant";
  };

  const canDemoteFromAdmin = (user: UserType): boolean => {
    // Un admin peut être rétrogradé en assistant
    return user.role === "admin";
  };

  const canPromoteToLivreur = (user: UserType): boolean => {
    // Seuls les clients peuvent être promus livreur
    return user.role === "client";
  };

  const canDemoteFromLivreur = (user: UserType): boolean => {
    // Un livreur peut être rétrogradé en client
    return user.role === "livreur";
  };

  const canDemoteToClient = (user: UserType): boolean => {
    // Les assistants, livreurs et admins peuvent être rétrogradés en client
    return (
      user.role === "assistant" ||
      user.role === "livreur" ||
      user.role === "admin"
    );
  };

  // Format de date simplifié pour mobile
  const formatDateForMobile = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <>
      {/* Statistiques - Responsive */}
      <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {totalUsers}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Actifs
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {activeUsers}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div> */}

        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Admins
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {adminUsers}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Assistants
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {assistantUsers}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Livreur
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {livreurUsers}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">
                        Aucun utilisateur trouvé
                      </p>
                      <p className="text-gray-600 mt-1">
                        {searchTerm
                          ? "Aucun utilisateur ne correspond à votre recherche"
                          : "Aucun utilisateur inscrit"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const status = getStatusBadge(user);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-white font-semibold text-sm">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name || "Avatar"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="bg-gradient-to-br from-blue-500 to-purple-600 h-full w-full flex items-center justify-center">
                                {getUserInitial(user)}
                              </span>
                            )}
                          </div>

                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || "Nom non renseigné"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString("fr-FR")}
                        <div className="text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleTimeString(
                            "fr-FR"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {formatPhoneNumber(user.phone)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <button
                              onClick={(e) => toggleActionsMenu(user.id, e)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {isActionsMenuOpen === user.id && (
                              <div
                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() =>
                                      handleToggleUserStatus(
                                        user.id,
                                        user.is_active ?? true
                                      )
                                    }
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {user.is_active ?? true ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Désactiver
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Activer
                                      </>
                                    )}
                                  </button>

                                  {canPromoteToAssistant(user) && (
                                    <button
                                      onClick={() =>
                                        handleUpdateUserRole(
                                          user.id,
                                          "assistant"
                                        )
                                      }
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Star className="h-4 w-4 mr-2" />
                                      Promouvoir Assistant
                                    </button>
                                  )}

                                  {canPromoteToLivreur(user) && (
                                    <button
                                      onClick={() =>
                                        handleUpdateUserRole(user.id, "livreur")
                                      }
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Truck className="h-4 w-4 mr-2" />
                                      Promouvoir Livreur
                                    </button>
                                  )}
                                  {canDemoteFromLivreur(user) && (
                                    <button
                                      onClick={() =>
                                        handleUpdateUserRole(user.id, "client")
                                      }
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Rétrograder en Client
                                    </button>
                                  )}

                                  {canDemoteFromAssistant(user) && (
                                    <button
                                      onClick={() =>
                                        handleUpdateUserRole(user.id, "client")
                                      }
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Rétrograder en Client
                                    </button>
                                  )}

                                  {canDemoteFromAdmin(user) && (
                                    <button
                                      onClick={() =>
                                        handleUpdateUserRole(
                                          user.id,
                                          "assistant"
                                        )
                                      }
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Rétrograder en Assistant
                                    </button>
                                  )}

                                  {canPromoteToAdmin(user) && (
                                    <button
                                      onClick={() =>
                                        handleUpdateUserRole(user.id, "admin")
                                      }
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Promouvoir Admin
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vue Mobile/Tablette */}
      <div className="lg:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              Aucun utilisateur trouvé
            </p>
            <p className="text-gray-600 mt-1">
              {searchTerm
                ? "Aucun utilisateur ne correspond à votre recherche"
                : "Aucun utilisateur inscrit"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const status = getStatusBadge(user);
            return (
              <div
                key={user.id}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {user.full_name || "Nom non renseigné"}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[150px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => toggleActionsMenu(user.id, e)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {isActionsMenuOpen === user.id && (
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          <button
                            onClick={() =>
                              handleToggleUserStatus(
                                user.id,
                                user.is_active ?? true
                              )
                            }
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {user.is_active ?? true ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </button>

                          {canPromoteToAssistant(user) && (
                            <button
                              onClick={() =>
                                handleUpdateUserRole(user.id, "assistant")
                              }
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Promouvoir Assistant
                            </button>
                          )}

                          {canPromoteToAdmin(user) && (
                            <button
                              onClick={() =>
                                handleUpdateUserRole(user.id, "admin")
                              }
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Promouvoir Admin
                            </button>
                          )}

                          {canDemoteToClient(user) && (
                            <button
                              onClick={() =>
                                handleUpdateUserRole(user.id, "client")
                              }
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Rétrograder en Client
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${
                          status.color.split(" ")[0]
                        }`}
                      ></span>
                      <span>{status.text}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>{formatDateForMobile(user.created_at)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-3 w-3 mr-2" />
                      <span className="truncate">
                        {user.phone || "Non renseigné"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ID utilisateur */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    ID: {user.id.slice(0, 12)}...
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
