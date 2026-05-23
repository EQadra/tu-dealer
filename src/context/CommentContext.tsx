import React, { createContext, useContext, useState, ReactNode } from 'react';
import api, { setAuthToken } from "../utils/axios";
import { Comment } from '../types/comment';
import { CreateCommentPayload } from '../types/createComment';
import * as SecureStore from 'expo-secure-store';

interface CommentContextProps {
  comments: Comment[];
  loading: boolean;
  error: string | null;

  fetchComments: () => Promise<void>;
  createComment: (data: CreateCommentPayload) => Promise<Comment>;
  deleteComment: (id: number) => Promise<void>;
}

const CommentContext = createContext<CommentContextProps>(
  {} as CommentContextProps
);

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔐 Helper para asegurarnos de que Axios tenga el token en memoria
   */
  const ensureToken = async () => {
    const token = await SecureStore.getItemAsync('token');
    await setAuthToken(token); // si token es null, Axios lo limpia
  };

  /**
   * GET /comments
   */
  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      await ensureToken(); // 🔐 set token antes de request
      const res = await api.get('/comments');
      setComments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * POST /comments
   */
const createComment = async (
  data: CreateCommentPayload
): Promise<Comment> => {
  setLoading(true);
  setError(null);

  try {
    await ensureToken();

    const res = await api.post(
      `/news/${data.news_id}/comments`,
      {
        content: data.comment,
      }
    );

    const newComment =
      res.data.comment ??
      res.data.data ??
      res.data;

    setComments((prev) => [newComment, ...prev]);

    return newComment;
  } catch (err: any) {
    setError(
      err.response?.data?.message ||
      "Error al comentar"
    );

    throw err;
  } finally {
    setLoading(false);
  }
};
  /**
   * DELETE /comments/{id}
   */
  const deleteComment = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await ensureToken(); // 🔐 set token antes de request
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'No autorizado o error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommentContext.Provider
      value={{
        comments,
        loading,
        error,
        fetchComments,
        createComment,
        deleteComment,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);