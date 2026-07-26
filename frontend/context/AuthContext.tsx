"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef
} from "react";

import { User } from "@/types/user";
import { getCurrentUser } from "@/services/auth.service";
import {
  getAccessToken,
  removeAccessToken,
} from "@/lib/auth";

import {
  login as loginApi,
  register as registerApi,
  googleLogin as googleLoginApi,
  verifyEmail as verifyEmailApi
} from "@/services/auth.service";

import { setAccessToken } from "@/lib/auth";

interface AuthContextType {
  user: User | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
      full_name: string,
      email: string,
      password: string
  ) => Promise<string>;

  verifyEmail: (
      token: string
  ) => Promise<string>;

  googleLogin: () => Promise<void>;

  refreshUser: () => Promise<void>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const googlePromise = useRef<{
    resolve?: () => void;
    reject?: (error: unknown) => void;
  }>({});

  const googleInitialized = useRef(false);

  const login = async (
  email: string,
  password: string
  ) => {
  const response = await loginApi({
      email,
      password,
  });

  setAccessToken(
      response.data.token.access_token
  );

  setUser(response.data.user);
  };

  const register = async (
      full_name: string,
      email: string,
      password: string
  ): Promise<string> => {

      const response = await registerApi({
          full_name,
          email,
          password,
      });

      return response.data.message;
  };

  const verifyEmail = async (
      token: string
  ): Promise<string> => {

      const response = await verifyEmailApi(
          token
      );

      return response.data.message;
  };

  useEffect(() => {
    if (googleInitialized.current) return;

    if (!window.google) return;

    googleInitialized.current = true;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: CredentialResponse) => {
        try {
          const authResponse = await googleLoginApi({
            id_token: response.credential,
          });

          setAccessToken(
            authResponse.data.token.access_token
          );

          setUser(authResponse.data.user);

          googlePromise.current.resolve?.();
        } catch (error) {
          googlePromise.current.reject?.(error);
        }
      },
    });
  }, []);

  const googleLogin = () => {
    return new Promise<void>((resolve, reject) => {
      if (!window.google) {
        reject(new Error("Google SDK not loaded"));
        return;
      }

      googlePromise.current = {
        resolve,
        reject,
      };

      window.google.accounts.id.prompt();
    });
  };

    const refreshUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch {
        removeAccessToken();
        setUser(null);
      }
    };

    const logout = () => {
      removeAccessToken();
      setUser(null);
    };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      await refreshUser();
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
          user,
          isAuthenticated: !!user,
          isLoading,

          login,
          register,
          verifyEmail,
          googleLogin,

          refreshUser,

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
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}