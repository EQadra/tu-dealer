// src/context/PostContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { Post } from "../types/post";
import api from "../utils/axios";

interface CreatePostPayload {
  title: string;
  content: string;
  image?: any;
  category?: string;
}

interface PostContextProps {
  posts: Post[];
  loading: boolean;
  error: string | null;

  fetchPosts: () => Promise<void>;
  fetchHomePosts: () => Promise<void>;
  fetchMyPosts: () => Promise<void>;

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

  try {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("content", data.content);

    if (data.category) {
      formData.append("category", data.category);
    }

    if (data.image) {
      formData.append("image", {
        uri: data.image,
        name: "post.jpg",
        type: "image/jpeg",
      } as any);
    }

    const res = await api.post(
      "/posts",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    const newPost = res.data.data;

    setPosts((prev) => [
      newPost,
      ...prev,
    ]);

    return newPost;
  } catch (err: any) {
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

const fetchMyPosts = async () => {
  try {
    const response = await api.get("/my-posts/latestPosts");

    console.log("POSTS =>", JSON.stringify(response.data, null, 2));

    setPosts(response.data);
  } catch (error) {
    console.log(error);
  }
};
  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        fetchMyPosts,
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