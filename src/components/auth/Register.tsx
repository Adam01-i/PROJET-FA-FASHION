import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // NOUVEAU CHAMP
  const [phone, setPhone] = useState(""); // NOUVEAU CHAMP
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
      
      // Récupérer le rôle depuis la table profiles
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        setUserRole(profile?.role || 'client');
      }
    };
    fetchUser();

    // Écouter les changements d'authentification
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.role || 'client');
      } else {
        setUserRole(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Fonction de redirection basée sur le rôle
  const redirectBasedOnRole = useCallback(
    (role: string | null) => {
      console.log("🔄 Redirection basée sur le rôle:", role);

      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "assistant":
          navigate("/assistant");
          break;
        case "client":
        default:
          navigate("/");
          break;
      }
    },
    [navigate]
  );

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user && userRole) {
      console.log("✅ Utilisateur connecté, redirection vers:", userRole);
      redirectBasedOnRole(userRole);
    }
  }, [user, userRole, redirectBasedOnRole]);

  // Fonction pour formater le numéro de téléphone
  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + " " + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      formatted = formatted.slice(0, 6) + " " + formatted.slice(6);
    }
    if (cleaned.length > 7) {
      formatted = formatted.slice(0, 9) + " " + formatted.slice(9);
    }

    setPhone(formatted.slice(0, 12));
  };

  // ✅ Inscription Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSuccess(false);

    // Validations
    if (password !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 6) {
      setLocalError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Veuillez entrer une adresse email valide");
      return;
    }

    // Validation du numéro de téléphone (optionnel mais formaté si fourni)
    if (phone.trim()) {
      const phoneRegex = /^(77|76|70|75|78)[0-9]{7}$/;
      const cleanPhone = phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        setLocalError("Veuillez entrer un numéro de téléphone sénégalais valide (ex: 77 123 45 67)");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Inscription avec Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim() || null,
            phone: phone.trim() || null,
          },
        },
      });

      if (error) {
        setLocalError(error.message);
        return;
      }

      if (data.user) {
        // ✅ Inscription réussie - afficher message de succès
        setIsSuccess(true);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setPhone("");
        
        // Créer le profil utilisateur avec rôle par défaut 'client' et les informations supplémentaires
        // const { error: profileError } = await supabase
        //   .from('profiles')
        //   .insert([
        //     {
        //       id: data.user.id,
        //       email: data.user.email,
        //       role: 'client',
        //       full_name: fullName.trim() || null,
        //       phone: phone.trim() ? phone.replace(/\s/g, "") : null,
        //       created_at: new Date().toISOString(),
        //       updated_at: new Date().toISOString(),
        //     }
        //   ]);

        // if (profileError) {
        //   console.error("Erreur création profil:", profileError);
        //   // Ne pas bloquer l'utilisateur même en cas d'erreur de profil
        //   if (profileError.code === '23505') {
        //     console.warn("Le numéro de téléphone est déjà utilisé, création sans numéro");
        //   }
        // }
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue";
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Si déjà authentifié, afficher message de chargement
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Rôle: {userRole}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-16 h-16 bg-pink-600 rounded-xl flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Créer un compte
            </h2>

            {/* Lien vers le menu principal - Version stylée */}
            <div className="mt-4">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </div>

          {/* Carte du formulaire */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Affichage des erreurs */}
            {localError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                <div className="flex-shrink-0 w-5 h-5 text-red-400 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm text-red-700 flex-1">
                  {localError}
                </p>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Champ Nom complet */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="Votre nom complet"
                  />
                </div>
              </div>

              {/* Champ Téléphone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="77 123 45 67 (optionnel)"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: 77, 76, 70, 75 ou 78
                </p>
              </div>

              {/* Champ Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adresse email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mot de passe *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Champ Confirmation mot de passe */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
                    placeholder="Confirmez votre mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Indicateur de force du mot de passe */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Sécurité du mot de passe</span>
                  <span
                    className={password.length >= 6 ? "text-pink-600" : ""}
                  >
                    {password.length >= 6 ? "✓ Sécurisé" : "Faible"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      password.length >= 6
                        ? "bg-pink-600 w-full"
                        : password.length >= 4
                        ? "bg-yellow-500 w-2/3"
                        : "bg-red-500 w-1/3"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Création du compte...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Déjà membre ?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-pink-600 hover:text-pink-500 transition-colors duration-200"
                >
                  Se connecter
                </Link>
              </p>
            </form>
            
            {isSuccess && (
              <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg flex items-start space-x-3 animate-fade-in">
                <div className="flex-shrink-0 w-5 h-5 text-pink-400 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-pink-700 font-medium">
                    ✅ Inscription réussie !
                  </p>
                  <p className="text-sm text-pink-600 mt-1">
                    Un email de confirmation vous a été envoyé. Cliquez sur le
                    lien dans l'email pour activer votre compte et être redirigé
                    vers la page d'accueil.
                  </p>
                </div>
              </div>
            )}
            {/* Ligne séparatrice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                En créant un compte, vous acceptez nos conditions d'utilisation
                et notre politique de confidentialité.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600">
        <div className="max-w-md text-center text-white px-8">
          <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <UserPlus className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Rejoignez Fa-Fashion</h1>
          <p className="text-lg text-pink-100">
            Créez votre compte et profitez d'une expérience shopping unique avec
            des avantages exclusifs.
          </p>
        </div>
      </div>
    </div>
  );
}