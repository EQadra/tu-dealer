// context/AuthContext.tsx
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "../utils/axios";

type ProfileType = "doctor" | "lawyer" | "association" | "shop" | "user";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  profileType?: ProfileType;
  profile?: any;
  avatar?: string;
  avatar_url?: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  // 🔐 AUTENTICACIÓN
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;

  // 📧 PASSWORD
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

  // 👤 PERFIL
  updateUserProfile: (data: Partial<AuthUser>) => Promise<void>;

  // 🖼️ AVATAR (NUEVO)
  updateAvatar: (imageUri: string) => Promise<string>;
  deleteAvatar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [baseUser, setBaseUser] = useState<any>(null);
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
          return null;
        }
        throw err;
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

      setBaseUser(baseUserData);

      const profileResult = await loadProfile();

      setUser({
        id: baseUserData.id,
        name: baseUserData.name,
        email: baseUserData.email,
        profileType: profileResult.type,
        profile: profileResult.data,
        avatar: baseUserData.avatar,
        avatar_url: baseUserData.avatar_url,
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

      setBaseUser(baseUserData);

      const profileResult = await loadProfile();

      setUser({
        id: baseUserData.id,
        name: baseUserData.name,
        email: baseUserData.email,
        profileType: profileResult.type,
        profile: profileResult.data,
        avatar: baseUserData.avatar,
        avatar_url: baseUserData.avatar_url,
      });

    } catch (error: any) {
      console.log("❌ REGISTER ERROR", error.response?.data || error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     👤 ME
  ========================= */
  const me = async () => {
    setLoading(true);

    try {
      await ensureToken();

      const meResponse = await api.get("/auth/me");
      const baseUserData = meResponse.data;

      setBaseUser(baseUserData);

      const profileResult = await loadProfile();

      setUser({
        id: baseUserData.id,
        name: baseUserData.name,
        email: baseUserData.email,
        profileType: profileResult.type,
        profile: profileResult.data,
        avatar: baseUserData.avatar,
        avatar_url: baseUserData.avatar_url,
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
    try {
      await ensureToken();
      await api.post("/auth/logout");
    } catch (error) {
      console.log("❌ Logout error (ignorado):", error);
    } finally {
      await SecureStore.deleteItemAsync("token");
      await setAuthToken(null);
      setUser(null);
      setBaseUser(null);
    }
  };

  /* =========================
     ✅ UPDATE USER PROFILE
  ========================= */
  const updateUserProfile = async (data: Partial<AuthUser>) => {
    try {
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, ...data };
      });

      if (data.profile !== undefined) {
        setBaseUser((prev: any) => ({
          ...prev,
          profile: data.profile,
        }));
      }

      if (data.avatar !== undefined) {
        setBaseUser((prev: any) => ({
          ...prev,
          avatar: data.avatar,
        }));
      }

      if (data.avatar_url !== undefined) {
        setBaseUser((prev: any) => ({
          ...prev,
          avatar_url: data.avatar_url,
        }));
      }

      console.log("✅ Perfil actualizado correctamente");
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      throw error;
    }
  };

  /* =========================
     🖼️ UPDATE AVATAR (NUEVO)
  ========================= */
  const updateAvatar = async (imageUri: string): Promise<string> => {
    try {
      await ensureToken();

      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { avatar, user: updatedUser } = response.data.data;
      
      // Actualizar usuario en el contexto
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          avatar: avatar,
          avatar_url: avatar,
        };
      });

      setBaseUser((prev: any) => ({
        ...prev,
        avatar: avatar,
        avatar_url: avatar,
      }));

      return avatar;
    } catch (error: any) {
      console.error('❌ Error al actualizar avatar:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar avatar');
    }
  };

  /* =========================
     🗑️ DELETE AVATAR (NUEVO)
  ========================= */
  const deleteAvatar = async (): Promise<void> => {
    try {
      await ensureToken();

      await api.delete('/user/avatar');
      
      // Actualizar usuario en el contexto
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          avatar: null,
          avatar_url: null,
        };
      });

      setBaseUser((prev: any) => ({
        ...prev,
        avatar: null,
        avatar_url: null,
      }));
    } catch (error: any) {
      console.error('❌ Error al eliminar avatar:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar avatar');
    }
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
        updateUserProfile,
        updateAvatar, // ✅ NUEVO
        deleteAvatar, // ✅ NUEVO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};