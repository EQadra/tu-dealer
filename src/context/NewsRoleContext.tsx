// contexts/NewsRoleContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import api from "../utils/axios";

/* =========================
   TYPES
========================= */
export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at?: string;
}

export interface Newable {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
}

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
  newable: Newable;
  comments: Comment[];
  liked?: boolean;
  likes_count?: number;
}

interface NewsRoleContextType {
  // State
  latestNews: News[];
  userNews: News[];
  allUserNews: News[];
  likedNews: News[];
  loading: boolean;
  error: string | null;

  // Fetch methods
  fetchLatestNews: () => Promise<void>;
  fetchUserLatestNews: () => Promise<void>;
  fetchAllUserNews: () => Promise<void>;
  fetchLikedNews: () => Promise<void>;
  getNewsById: (id: number) => News | undefined;

  // Comments
  addComment: (newsId: number, content: string) => Promise<Comment>;

  // 🔥 CRUD Operations (NUEVO)
  createNews: (data: any) => Promise<any>;
  updateNews: (id: number, data: any) => Promise<any>;
  deleteNews: (id: number) => Promise<any>;

  // Likes (NUEVO)
  toggleLike: (id: number) => Promise<any>;

  // Reset
  resetNews: () => void;
}

/* =========================
   CONTEXT
========================= */
const NewsRoleContext = createContext<NewsRoleContextType | null>(null);

/* =========================
   PROVIDER
========================= */
interface Props {
  children: ReactNode;
}

export const NewsRoleProvider = ({ children }: Props) => {
  // State
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [userNews, setUserNews] = useState<News[]>([]);
  const [allUserNews, setAllUserNews] = useState<News[]>([]);
  const [likedNews, setLikedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     RESET
  ========================== */
  const resetNews = useCallback(() => {
    setLatestNews([]);
    setUserNews([]);
    setAllUserNews([]);
    setLikedNews([]);
    setError(null);
  }, []);

  /* =========================
     FETCH: LATEST NEWS (Global Feed)
  ========================== */
  const fetchLatestNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/latest");
      setLatestNews(res.data);
    } catch (err: any) {
      console.error("Error al obtener últimas noticias:", err);
      setError(err.response?.data?.message || "Error al cargar noticias");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     FETCH: USER LATEST NEWS (5 últimas)
  ========================== */
  const fetchUserLatestNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/my/latest");
      console.log("🟢 Noticias obtenidas:", res.data.length);
      setUserNews(res.data);
    } catch (err: any) {
      console.error("Error al obtener noticias del usuario:", err);
      setError(err.response?.data?.message || "Error al cargar tus noticias");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     FETCH: ALL USER NEWS (Todas)
  ========================== */
  const fetchAllUserNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/my/all");
      setAllUserNews(res.data);
    } catch (err: any) {
      console.error("Error al obtener todas las noticias del usuario:", err);
      setError(err.response?.data?.message || "Error al cargar todas tus noticias");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     FETCH: LIKED NEWS
  ========================== */
  const fetchLikedNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/news/my/liked");
      setLikedNews(res.data);
    } catch (err: any) {
      console.error("Error al obtener noticias con like:", err);
      setError(err.response?.data?.message || "Error al cargar noticias con like");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     GET NEWS BY ID
  ========================== */
  const getNewsById = useCallback(
    (id: number): News | undefined => {
      return (
        latestNews.find((n) => n.id === id) ||
        userNews.find((n) => n.id === id) ||
        allUserNews.find((n) => n.id === id) ||
        likedNews.find((n) => n.id === id)
      );
    },
    [latestNews, userNews, allUserNews, likedNews]
  );

  /* =========================
     ADD COMMENT
  ========================== */
  const addComment = useCallback(
    async (newsId: number, content: string): Promise<Comment> => {
      try {
        const res = await api.post(`/news/${newsId}/comments`, { content });
        const newComment = res.data.data || res.data;

        const updateComments = (news: News) =>
          news.id === newsId
            ? { ...news, comments: [...news.comments, newComment] }
            : news;

        setLatestNews((prev) => prev.map(updateComments));
        setUserNews((prev) => prev.map(updateComments));
        setAllUserNews((prev) => prev.map(updateComments));
        setLikedNews((prev) => prev.map(updateComments));

        return newComment;
      } catch (err: any) {
        console.error("Error al agregar comentario:", err);
        throw new Error(err.response?.data?.message || "Error al comentar");
      }
    },
    []
  );

  /* =========================
     🔥 CREATE NEWS (NUEVO)
  ========================== */
  const createNews = useCallback(async (data: any) => {
    try {
      // Obtener el perfil del usuario autenticado
      const userRes = await api.get("/auth/me");
      const user = userRes.data;
      
      // Determinar el tipo y ID del perfil
      let newable_type = null;
      let newable_id = null;

      if (user.doctor) {
        newable_type = "App\\Models\\Doctor";
        newable_id = user.doctor.id;
      } else if (user.lawyer) {
        newable_type = "App\\Models\\Lawyer";
        newable_id = user.lawyer.id;
      } else if (user.shop) {
        newable_type = "App\\Models\\Shop";
        newable_id = user.shop.id;
      } else if (user.association) {
        newable_type = "App\\Models\\Association";
        newable_id = user.association.id;
      } else {
        throw new Error("No tienes un perfil asociado para crear noticias");
      }

      // Preparar datos completos
      const payload = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        url: data.url || null,
        fecha_publicacion: data.fecha_publicacion || new Date().toISOString(),
        newable_type: data.newable_type || newable_type,
        newable_id: data.newable_id || newable_id,
      };

      console.log("📝 Creando noticia:", payload);

      const res = await api.post("/news", payload);
      return res.data;
    } catch (error) {
      console.error("Error al crear noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     🔥 UPDATE NEWS (NUEVO)
  ========================== */
  const updateNews = useCallback(async (id: number, data: any) => {
    try {
      const res = await api.put(`/news/${id}`, data);
      
      // Actualizar las listas locales
      const updatedNews = res.data.data || res.data;
      
      const updateItem = (news: News) =>
        news.id === id ? { ...news, ...updatedNews } : news;

      setLatestNews((prev) => prev.map(updateItem));
      setUserNews((prev) => prev.map(updateItem));
      setAllUserNews((prev) => prev.map(updateItem));
      setLikedNews((prev) => prev.map(updateItem));

      return res.data;
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     🔥 DELETE NEWS (NUEVO)
  ========================== */
  const deleteNews = useCallback(async (id: number) => {
    try {
      const res = await api.delete(`/news/${id}`);
      
      // Eliminar de las listas locales
      const filterItem = (news: News) => news.id !== id;

      setLatestNews((prev) => prev.filter(filterItem));
      setUserNews((prev) => prev.filter(filterItem));
      setAllUserNews((prev) => prev.filter(filterItem));
      setLikedNews((prev) => prev.filter(filterItem));

      return res.data;
    } catch (error) {
      console.error("Error al eliminar noticia:", error);
      throw error;
    }
  }, []);

  /* =========================
     🔥 TOGGLE LIKE (NUEVO)
  ========================== */
  const toggleLike = useCallback(async (id: number) => {
    try {
      const res = await api.post(`/news/${id}/like`);
      const result = res.data.data;

      // Actualizar el estado de like en las listas locales
      const updateLikes = (news: News) =>
        news.id === id
          ? { 
              ...news, 
              liked: result.liked, 
              likes_count: result.likes_count 
            }
          : news;

      setLatestNews((prev) => prev.map(updateLikes));
      setUserNews((prev) => prev.map(updateLikes));
      setAllUserNews((prev) => prev.map(updateLikes));
      setLikedNews((prev) => prev.map(updateLikes));

      return result;
    } catch (error) {
      console.error("Error al toggle like:", error);
      throw error;
    }
  }, []);

  /* =========================
     VALUE
  ========================== */
  const value = useMemo(
    () => ({
      // State
      latestNews,
      userNews,
      allUserNews,
      likedNews,
      loading,
      error,
      // Fetch
      fetchLatestNews,
      fetchUserLatestNews,
      fetchAllUserNews,
      fetchLikedNews,
      getNewsById,
      // Comments
      addComment,
      // 🔥 CRUD
      createNews,
      updateNews,
      deleteNews,
      // Likes
      toggleLike,
      // Reset
      resetNews,
    }),
    [
      latestNews,
      userNews,
      allUserNews,
      likedNews,
      loading,
      error,
      fetchLatestNews,
      fetchUserLatestNews,
      fetchAllUserNews,
      fetchLikedNews,
      getNewsById,
      addComment,
      createNews,
      updateNews,
      deleteNews,
      toggleLike,
      resetNews,
    ]
  );

  return (
    <NewsRoleContext.Provider value={value}>
      {children}
    </NewsRoleContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useNewsRole = () => {
  const context = useContext(NewsRoleContext);
  if (!context) {
    throw new Error("useNewsRole debe usarse dentro de NewsRoleProvider");
  }
  return context;
};