// src/context/PostContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Post, PostComment } from "../types/post";
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
  myPosts: Post[];
  loadingMyPosts: boolean;

  fetchPosts: () => Promise<void>;
  fetchHomePosts: () => Promise<void>;
  fetchMyPosts: () => Promise<void>;

  createPost: (data: CreatePostPayload) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;

  addComment: (postId: number, content: string) => Promise<PostComment>;
  deleteComment: (commentId: number) => Promise<void>;

  // ✅ Agregar toggleLike
  toggleLike: (postId: number) => Promise<void>;
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
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     📥 GET ALL POSTS
  ========================= */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar posts"
      );
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     🏠 GET HOME POSTS
  ========================= */
  const fetchHomePosts = useCallback(async () => {
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
      console.error("Error fetching home posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     👤 GET MY POSTS
  ========================= */
  const fetchMyPosts = useCallback(async () => {
    setLoadingMyPosts(true);
    setError(null);

    try {
      const response = await api.get("/my-posts/latestPosts");
      setMyPosts(response.data);
    } catch (error) {
      console.error("Error fetching my posts:", error);
      setError("Error al cargar tus posts");
    } finally {
      setLoadingMyPosts(false);
    }
  }, []);

  /* =========================
     ➕ CREATE POST
  ========================= */
  const createPost = useCallback(
    async (data: CreatePostPayload): Promise<Post> => {
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

        const res = await api.post("/posts", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const newPost = res.data.data;

        setPosts((prev) => [newPost, ...prev]);
        setMyPosts((prev) => [newPost, ...prev]);

        return newPost;
      } catch (err: any) {
        console.error("Error creating post:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================
     🗑 DELETE POST
  ========================= */
  const deletePost = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/posts/${id}`);

      setPosts((prev) => prev.filter((post) => post.id !== id));
      setMyPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar post");
      console.error("Error deleting post:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     💬 ADD COMMENT
  ========================= */
  const addComment = useCallback(
    async (postId: number, content: string): Promise<PostComment> => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.post(`/posts/${postId}/comments`, {
          content: content.trim(),
        });

        const newComment = res.data.data;

        const updateComments = (post: Post) =>
          post.id === postId
            ? {
                ...post,
                comments: [newComment, ...(post.comments || [])],
              }
            : post;

        setPosts((prev) => prev.map(updateComments));
        setMyPosts((prev) => prev.map(updateComments));

        return newComment;
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error al agregar comentario"
        );
        console.error("Error adding comment:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================
     🗑 DELETE COMMENT
  ========================= */
  const deleteComment = useCallback(async (commentId: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/posts/comments/${commentId}`);

      const removeComment = (post: Post) => ({
        ...post,
        comments: (post.comments || []).filter((c) => c.id !== commentId),
      });

      setPosts((prev) => prev.map(removeComment));
      setMyPosts((prev) => prev.map(removeComment));
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al eliminar comentario"
      );
      console.error("Error deleting comment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================
     ❤️ TOGGLE LIKE - ✅ IMPLEMENTADO
  ========================= */
  const toggleLike = useCallback(async (postId: number) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      const data = res.data.data;

      // Función para actualizar el like en un post
      const updateLike = (post: Post) =>
        post.id === postId
          ? {
              ...post,
              liked: data.liked,
              likes_count: data.likes_count,
            }
          : post;

      setPosts((prev) => prev.map(updateLike));
      setMyPosts((prev) => prev.map(updateLike));
    } catch (err: any) {
      console.error("Error toggling like:", err);
      throw new Error(err.response?.data?.message || "Error al dar like");
    }
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        myPosts,
        loadingMyPosts,
        fetchPosts,
        fetchMyPosts,
        fetchHomePosts,
        createPost,
        deletePost,
        addComment,
        deleteComment,
        toggleLike, // ✅ Exportar toggleLike
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePosts debe usarse dentro de PostProvider");
  }
  return context;
};