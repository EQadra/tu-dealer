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
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
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
     GET NEWS BY ID (de los estados locales)
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

        // Función para actualizar comentarios en una lista
        const updateComments = (news: News) =>
          news.id === newsId
            ? { ...news, comments: [...news.comments, newComment] }
            : news;

        // Actualizar todas las listas
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