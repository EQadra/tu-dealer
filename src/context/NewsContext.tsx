import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { News } from "../types/news";
import api from "../utils/axios";

interface NewsContextProps {
  news: News[];
  loading: boolean;
  error: string | null;

  fetchNews: () => Promise<void>;
  fetchHomeNews: () => Promise<void>;
  getNewsById: (id: number) => Promise<News | null>;
  fetchMyLatestNews: () => Promise<void>;
  createNews: (data: FormData) => Promise<void>;
  updateNews: (id: number, data: any) => Promise<void>;
  deleteNews: (id: number) => Promise<void>;

  addComment: (newsId: number, content: string) => Promise<void>;
}

const NewsContext = createContext<NewsContextProps>(
  {} as NewsContextProps
);

export const NewsProvider = ({ children }: { children: ReactNode }) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ LISTADO GENERAL
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

  // ✅ HOME
  const fetchHomeNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/news/home");
      setNews(res.data.data || res.data);
    } catch (err: any) {
      console.log(err);
      setError("Error al cargar home news");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET BY ID
  const getNewsById = async (id: number) => {
    try {
      const res = await api.get(`/news/${id}`);
      return res.data;
    } catch {
      setError("Error al obtener noticia");
      return null;
    }
  };

  // ✅ CREATE
  const createNews = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/news", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchNews(); // refresca lista
    } catch {
      setError("Error al crear noticia");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE
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

  // ✅ DELETE
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

  // ✅ COMMENTS
  const addComment = async (newsId: number, content: string) => {
    try {
      await api.post(`/news/${newsId}/comments`, { content });
      await fetchNews();
    } catch (error) {
      console.log("Error comentando", error);
    }
  };

  const fetchMyLatestNews = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await api.get("/my-news/latestNews");

    console.log("MY LATEST NEWS:", res.data); // 🔥 debug importante

    setNews(res.data); // ✅ IMPORTANTE: usa el estado principal
  } catch (err: any) {
    console.log("ERROR myLatestNews:", err.response?.data || err);
    setError("Error al cargar mis noticias");
  } finally {
    setLoading(false);
  }
};

  return (
    <NewsContext.Provider
      value={{
        news,
        loading,
        error,

        fetchNews,
        fetchHomeNews,
        getNewsById,
fetchMyLatestNews,
        createNews,
        updateNews,
        deleteNews,
        addComment,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);