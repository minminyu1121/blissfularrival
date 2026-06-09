"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  shouldUseRedirectSignIn,
  translateAuthError,
} from "@/lib/authErrors";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();

      // 處理 Google redirect 登入回傳（Vercel 正式環境）
      getRedirectResult(auth)
        .catch((err) => setAuthError(translateAuthError(err)))
        .finally(() => setLoading(false));

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });

      return () => unsubscribe();
    } catch (err) {
      setAuthError(translateAuthError(err));
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    const auth = getFirebaseAuth();

    if (shouldUseRedirectSignIn()) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必須在 AuthProvider 內使用");
  }
  return context;
}
