import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import api from "../utils/axios";
import { News } from "../types/news";

interface NewsContextProps {
  news: News[];
  latestNews: News[];
  loading: boolean;
  error: string | null;

  fetchNews: () => Promise<void>;
  fetchLatestNews: () => Promise<void>;
  fetchHomeNews: () => Promise<void>;

  getNewsById: (id: number) => Promise<News | null>;
  createNews: (data: FormData) => Promise<void>;
  updateNews: (id: number, data: any) => Promise<void>;
  deleteNews: (id: number) => Promise<void>;

  addComment: (newsId: number, content: string) => Promise<void>; // 👈 NUEVO
}

const NewsContext = createContext<NewsContextProps>(
  {} as NewsContextProps
);

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [news, setNews] = useState<News[]>([]);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/news");
      setNews(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar noticias");
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/news/latest");
      setLatestNews(res.data);
    } catch {
      setError("Error al cargar noticias recientes");
    } finally {
      setLoading(false);
    }
  };

const fetchHomeNews = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await api.get("/news/home");

    console.log("RESPONSE:", res.data); // 👈 DEBUG

    setNews(res.data.data || res.data); // 👈 FIX CLAVE
  } catch (err: any) {
    console.log("ERROR:", err.response?.data || err);
    setError("Error al cargar noticias del home");
  } finally {
    setLoading(false);
  }
};

  const getNewsById = async (id: number) => {
    try {
      const res = await api.get(`/news/${id}`);
      return res.data;
    } catch {
      setError("Error al obtener noticia");
      return null;
    }
  };

  const createNews = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/news", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchNews();
    } catch {
      setError("Error al crear noticia");
    } finally {
      setLoading(false);
    }
  };

  const updateNews = async (id: number, data: any) => {
    setLoading(true);
    try {
      await api.put(`/news/${id}`, data);
      await fetchNews();
    } catch {
      setError("Error al actualizar noticia");
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/news/${id}`);
      setNews(prev => prev.filter(n => n.id !== id));
    } catch {
      setError("Error al eliminar noticia");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVO: comentar correctamente
  const addComment = async (newsId: number, content: string) => {
    try {
      await api.post(`/news/${newsId}/comments`, {
        content,
      });

      // refresca noticias con comentarios actualizados
      await fetchHomeNews();
    } catch (error) {
      console.log("Error comentando", error);
    }
  };

  return (
    <NewsContext.Provider
      value={{
        news,
        latestNews,
        loading,
        error,
        fetchNews,
        fetchLatestNews,
        fetchHomeNews,
        getNewsById: async () => null,
        createNews: async () => {},
        updateNews: async () => {},
        deleteNews: async () => {},
        addComment, // 👈 IMPORTANTE
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);