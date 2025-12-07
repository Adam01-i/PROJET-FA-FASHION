import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
//   Edit,
//   Shield,
  Save,
  Loader2,
  Camera,
  CheckCircle,
  UserX
} from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useToastContext } from "../../../../hooks/ToastProvider";

export default function MyAccountSection() {
  const { success, error: toastError } = useToastContext();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const { data: authUser } = await supabase.auth.getUser();

      if (!authUser?.user) {
        toastError("Erreur", "Utilisateur non connecté");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.user.id)
        .single();

      if (error) {
        toastError("Erreur", "Impossible de charger votre profil");
      } else {
        setUser(profile);
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setEmail(profile.email || authUser.user.email);
        setAvatarUrl(profile.avatar_url || "");
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) throw error;

      success("Profil mis à jour", "Vos informations ont été enregistrées");
    } catch (error) {
      toastError("Erreur", "Impossible de sauvegarder les modifications");
      console.error(error);
    }

    setSaving(false);
  };

  const getStatusBadge = (is_active: boolean) => {
    if (!is_active) {
      return {
        text: "Désactivé",
        color: "bg-red-100 text-red-800",
        icon: UserX
      };
    }

    return {
      text: "Actif",
      color: "bg-blue-100 text-blue-800",
      icon: CheckCircle
    };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "assistant":
        return "bg-orange-100 text-orange-800";
      case "livreur":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={avatarUrl || "/default-avatar.png"}
            className="h-24 w-24 rounded-full object-cover border"
            alt="avatar"
          />

          <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
            <Camera className="h-5 w-5 text-gray-600" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => setAvatarUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>

        {/* Infos principales */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{fullName}</h1>

          <div className="flex gap-2 mt-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(
                user.role
              )}`}
            >
              {user.role.toUpperCase()}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                getStatusBadge(user.is_active).color
              }`}
            >
              {getStatusBadge(user.is_active).text}
            </span>
          </div>
        </div>
      </div>

      <hr className="my-6" />

      {/* Formulaire */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nom */}
        <div>
          <label className="text-sm text-gray-600">Nom complet</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              className="outline-none w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className="text-sm text-gray-600">Téléphone</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mt-1">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              className="outline-none w-full"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Email */}
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600">Email</label>
          <div className="flex items-center border rounded-lg px-3 py-2 mt-1 bg-gray-50">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="email"
              className="outline-none w-full bg-gray-50"
              value={email}
              disabled
            />
          </div>
          <p className="text-xs text-gray-500">L’email ne peut pas être modifié ici.</p>
        </div>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
