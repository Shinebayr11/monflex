"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@/types/auth";

const KEY = "cs.auth.user";

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  login: (email: string, _password: string) => Promise<void>;
  signup: (name: string, email: string, _password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setIsLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  const login = useCallback(async (email: string) => {
    persist({
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      isGuest: false,
    });
  }, []);

  const signup = useCallback(async (name: string, email: string) => {
    persist({ id: crypto.randomUUID(), email, name, isGuest: false });
  }, []);

  const loginAsGuest = useCallback(() => {
    persist({
      id: "guest",
      email: "guest@local",
      name: "Guest",
      isGuest: true,
    });
  }, []);

  const logout = useCallback(() => persist(null), []);

  return (
    <Ctx.Provider
      value={{ user, isLoading, login, signup, loginAsGuest, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
