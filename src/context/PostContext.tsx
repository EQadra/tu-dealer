// src/context/PostContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import api from "../utils/axios";
import { Post } from "../types/post";

interface CreatePostPayload {
  title: string;
  content: string;
  image?: string;
  category?: string;
}

interface PostContextProps {
  posts: Post[];
  loading: boolean;
  error: string | null;

  fetchPosts: () => Promise<void>;
  fetchHomePosts: () => Promise<void>;

  createPost: (data: CreatePostPayload) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

const PostContext = createContext<PostContextProps>(
  {} as PostContextProps
);

export const PostProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     📥 GET ALL POSTS
  ========================= */
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/posts");
      setPosts(res.data); // 👈 backend devuelve array directo
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar posts"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🏠 GET HOME POSTS
  ========================= */
  const fetchHomePosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/posts/home");
      setPosts(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al cargar posts del home"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ➕ CREATE POST
  ========================= */
  const createPost = async (
    data: CreatePostPayload
  ): Promise<Post> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/posts", data);

      // 🔥 backend devuelve { message, data }
      const newPost: Post = res.data.data;

      setPosts((prev) => [newPost, ...prev]);

      return newPost;
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al crear post"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🗑 DELETE POST
  ========================= */
  const deletePost = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/posts/${id}`);

      setPosts((prev) =>
        prev.filter((post) => post.id !== id)
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al eliminar post"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        fetchHomePosts,
        createPost,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => useContext(PostContext);