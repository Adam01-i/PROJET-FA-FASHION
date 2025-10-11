import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  User,
  Session,
  AuthChangeEvent,
  Subscription,
} from "@supabase/supabase-js";
import {
  supabase,
  getUserRole,
  UserRole,
  createUserProfile,
} from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const authStateChangeRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          const role = await getUserRole(session.user);
          setUserRole(role);
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur init auth";
        setError(msg);
        console.error("❌ Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 👇 Typage propre de la souscription Supabase
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (authStateChangeRef.current) return;
        authStateChangeRef.current = true;

        try {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
            const role = await getUserRole(session.user);
            setUserRole(role);

            if (event === "SIGNED_IN") {
              await createUserProfile(session.user);
            }
          } else {
            setSession(null);
            setUser(null);
            setUserRole(null);
          }
          setError(null);
        } catch (err: unknown) {
          console.error("⚠️ Erreur dans onAuthStateChange:", err);
        } finally {
          setTimeout(() => {
            authStateChangeRef.current = false;
          }, 300);
        }
      }
    );

    // ✅ Pas d'erreur TS ici : `listener.subscription` est bien typé
    const subscription: Subscription = listener.subscription;

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --------------------
  //  MÉTHODES D'AUTH
  // --------------------

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;

      if (data.user) {
        // 🔥 charge le rôle immédiatement après login
        const role = await getUserRole(data.user);
        setUserRole(role);
        setUser(data.user);
        setSession(data.session ?? null);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur de connexion";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      if (data.user && !data.session) {
        throw new Error(
          "Veuillez confirmer votre email avant de vous connecter."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur d'inscription";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setUserRole(null);
      initializedRef.current = false; // ✅ Reconnexion propre
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur déconnexion";
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      if (error) throw error;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur reset mot de passe";
      setError(message);
      throw err;
    }
  };

  const clearError = (): void => setError(null);

  const value: AuthContextType = {
    user,
    session,
    userRole,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
