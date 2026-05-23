import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import api, { setAuthToken, BASE_URL } from "../utils/axios";

type ProfileType = "doctor" | "lawyer" | "association" | "shop" | "user";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  profileType?: ProfileType;
  profile?: any;
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;

  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;

  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [baseUser, setBaseUser] = useState<any>(null); // ✅ NUEVO
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* =========================
     🔐 Helper: asegurar token
  ========================= */
  const ensureToken = async () => {
    const token = await SecureStore.getItemAsync("token");
    await setAuthToken(token);
  };

  /* =========================
     🔍 Detectar perfil real
  ========================= */
const loadProfile = async () => {
  await ensureToken();

  const tryEndpoint = async (url: string, type: ProfileType) => {
    try {
      const res = await api.get(url);
      return { type, data: res.data };
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null; // 👈 esperado
      }
      throw err; // 👈 error real (500, network, etc)
    }
  };

  const endpoints = [
    ["/doctors/me", "doctor"],
    ["/lawyers/me", "lawyer"],
    ["/associations/me", "association"],
    ["/shops/me", "shop"],
  ] as [string, ProfileType][];

  for (const [url, type] of endpoints) {
    const result = await tryEndpoint(url, type);
    if (result) return result;
  }

  return { type: "user", data: null };
};

  /* =========================
     🔐 LOGIN
  ========================= */
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { access_token, user: baseUserData } = res.data;

      await SecureStore.setItemAsync("token", access_token);
      await setAuthToken(access_token);

      setBaseUser(baseUserData); // ✅ guardar base user

      const profileResult = await loadProfile();

      setUser({
        id: baseUserData.id,
        name: baseUserData.name,
        email: baseUserData.email,
        profileType: profileResult.type,
        profile: profileResult.data,
      });

    } catch (error: any) {
      console.log("❌ LOGIN ERROR", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     📝 REGISTER
  ========================= */
  const register = async (data: any) => {
    setLoading(true);

    try {
      const res = await api.post("/auth/register", data);

      const { access_token, user: baseUserData } = res.data;

      await SecureStore.setItemAsync("token", access_token);
      await setAuthToken(access_token);

      setBaseUser(baseUserData); // ✅ guardar base user

      const profileResult = await loadProfile();

      setUser({
        id: baseUserData.id,
        name: baseUserData.name,
        email: baseUserData.email,
        profileType: profileResult.type,
        profile: profileResult.data,
      });

    } catch (error: any) {
      console.log("❌ REGISTER ERROR", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     👤 ME (CORREGIDO)
  ========================= */
  const me = async () => {
    setLoading(true);

    try {
      await ensureToken();

      const profileResult = await loadProfile();

      if (!baseUser) return;

      setUser({
        id: baseUser.id,
        name: baseUser.name,
        email: baseUser.email,
        profileType: profileResult.type,
        profile: profileResult.data,
      });

    } catch (error) {
      console.log("❌ ME ERROR", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🔄 RESTORE SESSION
  ========================= */
  useEffect(() => {
    const restoreSession = async () => {
      const token = await SecureStore.getItemAsync("token");

      if (token) {
        await setAuthToken(token);
        await me();
      } else {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* =========================
     📧 FORGOT PASSWORD
  ========================= */
  const forgotPassword = async (email: string) => {
    await ensureToken();
    await api.post("/forgot-password", { email });
  };

  /* =========================
     🔁 RESET PASSWORD
  ========================= */
  const resetPassword = async (data: any) => {
    await ensureToken();
    await api.post("/reset-password", data);
  };

  /* =========================
     🔐 CHANGE PASSWORD
  ========================= */
  const changePassword = async (data: any) => {
    await ensureToken();
    await api.post("/change-password", data);
  };

  /* =========================
     🚪 LOGOUT
  ========================= */
  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await setAuthToken(null);
    setUser(null);
    setBaseUser(null); // ✅ limpiar también
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        me,
        forgotPassword,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);