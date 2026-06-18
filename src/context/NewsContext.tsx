// contexts/NewsContext.tsx
import React, { createContext, useCallback, useContext } from "react";
import api from "../utils/axios";

/* =========================
   TYPES
========================= */
export interface News {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string;
  fecha_publicacion: string;
  created_at: string;
  updated_at: string;
  newable_type: string;
  newable_id: number;
  newable: any;
  comments: any[];
  liked?: boolean;
  likes_count?: number;
}

interface NewsContextType {
  // CRUD
  createNews: (data: any) => Promise<any>;
  updateNews: (id: number, data: any) => Promise<any>;
  deleteNews: (id: number) => Promise<any>;
  
  // Likes
  toggleLike: (id: number) => Promise<any>;
  checkLike: (id: number) => Promise<{ liked: boolean; likes_count: number }>;
  
  // Obtener una noticia por ID (opcional, para detalles)
  getNews: (id: number) => Promise<any>;
}

/* =========================
   CONTEXT
========================= */
const NewsContext = createContext<NewsContextType | null>(null);

/* =========================
   PROVIDER
========================= */
export const NewsProvider = ({ children }: any) => {
  /* =========================
     CREATE NEWS
  ========================== */
  const createNews = useCallback(async (data: any) => {
    try {
      const res = await api.post("/news", data);
      return res.data;
    } catch (error) {
      console.error("Error al crear noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     UPDATE NEWS
  ========================== */
  const updateNews = useCallback(async (id: number, data: any) => {
    try {
      const res = await api.put(`/news/${id}`, data);
      return res.data;
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     DELETE NEWS
  ========================== */
  const deleteNews = useCallback(async (id: number) => {
    try {
      const res = await api.delete(`/news/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     GET NEWS BY ID
  ========================== */
  const getNews = useCallback(async (id: number) => {
    try {
      const res = await api.get(`/news/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error al obtener noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     TOGGLE LIKE (Dar/Quitar like)
  ========================== */
  const toggleLike = useCallback(async (id: number) => {
    try {
      const res = await api.post(`/news/${id}/like`);
      return res.data;
    } catch (error) {
      console.error("Error al toggle like:", error);
      throw error;
    }
  }, []);

  /* =========================
     CHECK LIKE (Verificar si ya dio like)
  ========================== */
  const checkLike = useCallback(async (id: number) => {
    try {
      const res = await api.get(`/news/${id}/check-like`);
      return res.data.data;
    } catch (error) {
      console.error("Error al verificar like:", error);
      throw error;
    }
  }, []);

  /* =========================
     VALUE
  ========================== */
  const value = {
    createNews,
    updateNews,
    deleteNews,
    getNews,
    toggleLike,
    checkLike,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error("useNews debe usarse dentro de NewsProvider");
  }
  return context;
};