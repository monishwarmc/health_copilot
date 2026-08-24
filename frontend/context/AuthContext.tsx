"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  User,
  ProfileUpdateData,
} from "@/types/user";

import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
  verifyEmail as verifyEmailApi,
  profile as profileApi,
  password as passwordApi,
  account as deleteApi,
  googleLogin as googleLoginApi,
} from "@/services/auth.service";

import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "@/lib/auth";

/* ============================================================
   AUTH CONTEXT TYPE
============================================================ */

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

  account: (
    password: string | null,
    google_token: string | null
  ) => Promise<string>;

  profile: (
    data: ProfileUpdateData
  ) => Promise<User>;

  password: (
    old_password: string,
    new_password: string
  ) => Promise<string>;

  verifyEmail: (
    token: string
  ) => Promise<string>;

  googleAuth: (
    credential: string
  ) => Promise<void>;

  googleVerify: () => Promise<string>;

  refreshUser: () => Promise<void>;

  logout: () => void;
}

/* ============================================================
   CONTEXT
============================================================ */

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

/* ============================================================
   PROVIDER PROPS
============================================================ */

interface AuthProviderProps {
  children: ReactNode;
}

/* ============================================================
   PROVIDER
============================================================ */

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /* ==========================================================
     LOGIN
  ========================================================== */

  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const response =
      await loginApi({
        email,
        password,
      });

    setAccessToken(
      response.data.token
        .access_token
    );

    setUser(
      response.data.user
    );
  };

  /* ==========================================================
     REGISTER
  ========================================================== */

  const register = async (
    full_name: string,
    email: string,
    password: string
  ): Promise<string> => {
    const response =
      await registerApi({
        full_name,
        email,
        password,
      });

    return response.data.message;
  };

  /* ==========================================================
     VERIFY EMAIL
  ========================================================== */

  const verifyEmail = async (
    token: string
  ): Promise<string> => {
    const response =
      await verifyEmailApi(token);

    return response.data.message;
  };

  /* ==========================================================
     UPDATE PROFILE
  ========================================================== */

  const profile = async (
    data: ProfileUpdateData
  ): Promise<User> => {
    const response =
      await profileApi(data);

    setUser(response.data);

    return response.data;
  };

  /* ==========================================================
     CHANGE PASSWORD
  ========================================================== */

  const password = async (
    old_password: string,
    new_password: string
  ): Promise<string> => {
    const response =
      await passwordApi(
        old_password,
        new_password
      );

    return response.data.message;
  };

  /* ==========================================================
     GOOGLE LOGIN
  ========================================================== */

  const googleAuth = async (
    credential: string
  ): Promise<void> => {
    const response =
      await googleLoginApi({
        id_token: credential,
      });

    setAccessToken(
      response.data.token
        .access_token
    );

    setUser(
      response.data.user
    );
  };

  /* ==========================================================
     GOOGLE VERIFY
  ========================================================== */

  /*
   * This is NOT used for normal Google login.
   *
   * Google login is handled by GoogleButton.
   *
   * This remains here because the current profile page
   * expects googleVerify() for Google account deletion.
   *
   * We will implement Google re-authentication separately.
   */

  const googleVerify =
    async (): Promise<string> => {
      throw new Error(
        "Google re-authentication is not implemented yet."
      );
    };

  /* ==========================================================
     DELETE ACCOUNT
  ========================================================== */

  const account = async (
    password: string | null,
    google_token: string | null
  ): Promise<string> => {
    const response =
      await deleteApi(
        password,
        google_token
      );

    removeAccessToken();

    setUser(null);

    return response.data.message;
  };

  /* ==========================================================
     REFRESH CURRENT USER
  ========================================================== */

  const refreshUser =
    async (): Promise<void> => {
      try {
        const response =
          await getCurrentUser();

        setUser(
          response.data
        );
      } catch {
        removeAccessToken();

        setUser(null);
      }
    };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const logout = (): void => {
    removeAccessToken();

    setUser(null);
  };

  /* ==========================================================
     INITIAL AUTH CHECK
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const initializeAuth =
      async () => {
        const token =
          getAccessToken();

        if (!token) {
          if (mounted) {
            setIsLoading(false);
          }

          return;
        }

        await refreshUser();

        if (mounted) {
          setIsLoading(false);
        }
      };

    void initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     PROVIDER
  ========================================================== */

  return (
    <AuthContext.Provider
      value={{
        user,

        isAuthenticated:
          !!user,

        isLoading,

        login,

        register,

        verifyEmail,

        googleAuth,

        googleVerify,

        profile,

        password,

        account,

        refreshUser,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   useAuth
============================================================ */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}