import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string, full_name?: string, shop_description?: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a valid stored token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    fetch("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          setRole(data.role || "authenticated");
        } else {
          localStorage.removeItem("token");
          setUser(null);
          setRole(null);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error || "Login failed" } };
      localStorage.setItem("token", data.token);
      setUser(data.user);
      // Decoded token usually has the role, or the backend returns it
      // Let's assume the backend returns it in the user object or alongside it
      // Based on our auth.ts, login returns { user, token } but Doesn't return role explicitly in body, but it's IN the token.
      // However, /me DOES return it. Let's just set it to authenticated for now and /me will refresh it,
      // or we can decode the token here if we had a library.
      // Better: update auth.ts login to return the role in the body too.
      setRole(data.role || "authenticated"); 
      return { error: null };
    } catch (err) {
      return { error: { message: "Network error" } };
    }
  };

  const signUp = async (email: string, password: string, full_name?: string, shop_description?: string) => {
    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name, shop_description }),
      });
      const data = await res.json();
      if (!res.ok) return { error: { message: data.error || "Registration failed" } };
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setRole("authenticated");
      return { error: null };
    } catch (err) {
      return { error: { message: "Network error" } };
    }
  };

  const signOut = async () => {
    await fetch("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

