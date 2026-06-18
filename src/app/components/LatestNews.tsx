// screens/LatestNews.tsx
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "../../context/AuthContext";
import { useNewsRole } from "../../context/NewsRoleContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

// ============================
// TIPOS
// ============================
interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    url?: string;
  };
  created_at: string;
}

interface NewsItem {
  id: number;
  titulo: string;
  descripcion: string;
  url?: string;
  created_at: string;
  newable_type: string;
  newable_id: number;
  newable: {
    id: number;
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  comments: Comment[];
  user?: {
    id: number;
    name: string;
    url?: string;
  };
  liked?: boolean;
  likes_count?: number;
}

// ============================
// COMPONENTE PRINCIPAL
// ============================
const LatestNews = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();

  // ============================
  // CONTEXT
  // ============================
  const {
    latestNews,
    loading,
    error,
    fetchLatestNews,
    addComment,
  } = useNewsRole();

  // ============================
  // ESTADOS LOCALES
  // ============================
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [likedNews, setLikedNews] = useState<Record<number, boolean>>({});

  // ============================
  // COLORES (DARK MODE)
  // ============================
  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    input: darkMode ? "#1E293B" : "#ffffff",
    inputBorder: darkMode ? "#334155" : "#dddddd",
    comment: darkMode ? "#1E293B" : "#f1f1f1",
    modal: darkMode ? "#0F172A" : "#ffffff",
    green: darkMode ? "#4ADE80" : "#00B272",
    red: darkMode ? "#F87171" : "#EF4444",
    backdrop: "rgba(0,0,0,0.6)",
  };

  // ============================
  // FETCH NEWS
  // ============================
  useEffect(() => {
    fetchLatestNews();
  }, []);

  // ============================
  // LIKES STORAGE (LOCAL)
  // ============================
  useEffect(() => {
    const loadLikes = async () => {
      try {
        const saved = await AsyncStorage.getItem("latestNewsLikes");
        if (saved) {
          setLikedNews(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error al cargar likes:", error);
      }
    };
    loadLikes();
  }, []);

  useEffect(() => {
    const saveLikes = async () => {
      try {
        await AsyncStorage.setItem(
          "latestNewsLikes",
          JSON.stringify(likedNews)
        );
      } catch (error) {
        console.error("Error al guardar likes:", error);
      }
    };
    saveLikes();
  }, [likedNews]);

  // ============================
  // REFRESH
  // ============================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLatestNews();
    setRefreshing(false);
  }, [fetchLatestNews]);

  // ============================
  // OPEN / CLOSE MODAL
  // ============================
  const openComments = useCallback((news: NewsItem) => {
    setActiveNews(news);
    setModalVisible(true);
  }, []);

  const closeComments = useCallback(() => {
    setModalVisible(false);
    setActiveNews(null);
    setCommentText("");
  }, []);

  // ============================
  // SHARE
  // ============================
  const handleShare = useCallback(async (item: NewsItem) => {
    try {
      await Share.share({
        message: `📰 ${item.titulo}\n\n${item.descripcion}\n\n${item.url || ""}`,
        title: item.titulo,
      });
    } catch (error: any) {
      if (error.message !== "User canceled the dialog") {
        Alert.alert("Error", "No se pudo compartir la noticia");
      }
    }
  }, []);

  // ============================
  // LIKE (LOCAL + STORAGE)
  // ============================
  const handleLike = useCallback((id: number) => {
    setLikedNews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // ============================
  // ADD COMMENT
  // ============================
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !activeNews) return;

    try {
      const newComment = await addComment(activeNews.id, commentText.trim());

      // Actualizar el estado local del modal
      setActiveNews((prev: NewsItem | null) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
        };
      });

      setCommentText("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo agregar el comentario"
      );
    }
  }, [commentText, activeNews, addComment]);

  // ============================
  // RENDER COMMENT
  // ============================
  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View
        style={[
          styles.commentBubble,
          { backgroundColor: colors.comment },
        ]}
      >
        <Text style={[styles.commentUser, { color: colors.text }]}>
          {item.user?.name || "Usuario"}
        </Text>

        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.content}
        </Text>

        <Text
          style={[
            styles.commentDate,
            { color: colors.secondaryText },
          ]}
        >
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    ),
    [colors]
  );

  // ============================
  // RENDER NEWS ITEM
  // ============================
  const renderNewsItem = useCallback(
    ({ item }: { item: NewsItem }) => {
      // Obtener nombre del perfil (newable)
      const profileName = item.newable?.first_name
        ? `${item.newable.first_name} ${item.newable.last_name || ""}`
        : item.newable?.name || "Perfil";

      // Obtener fecha formateada
      const formattedDate = new Date(item.created_at).toLocaleDateString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

      return (
        <View
          style={[
            styles.newsItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Imagen */}
          <Image
            source={{
              uri: item.url || "https://picsum.photos/seed/" + item.id + "/400/200",
            }}
            style={styles.newsImage}
            resizeMode="cover"
          />

          {/* Header con avatar y nombre */}
          <View style={styles.newsHeader}>
            <View style={styles.newsAvatarContainer}>
              <Text style={[styles.newsAvatarText, { color: colors.text }]}>
                {profileName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.newsHeaderInfo}>
              <Text style={[styles.newsName, { color: colors.text }]}>
                {profileName}
              </Text>
              <Text style={[styles.newsDate, { color: colors.secondaryText }]}>
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Título y descripción */}
          <Text style={[styles.newsTitle, { color: colors.text }]}>
            {item.titulo}
          </Text>

          <Text
            style={[
              styles.newsDescription,
              { color: colors.secondaryText },
            ]}
            numberOfLines={3}
          >
            {item.descripcion}
          </Text>

          {/* ACCIONES */}
          <View
            style={[
              styles.newsActions,
              { borderTopColor: colors.border },
            ]}
          >
            {/* Compartir */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(item)}
            >
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.green}
              />
              <Text style={[styles.actionText, { color: colors.green }]}>
                Compartir
              </Text>
            </TouchableOpacity>

            {/* Comentar */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openComments(item)}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.green}
              />
              <Text style={[styles.actionText, { color: colors.green }]}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Me gusta */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons
                name={likedNews[item.id] ? "heart" : "heart-outline"}
                size={20}
                color={likedNews[item.id] ? colors.red : colors.green}
              />
              <Text
                style={[
                  styles.actionText,
                  {
                    color: likedNews[item.id] ? colors.red : colors.green,
                  },
                ]}
              >
                {likedNews[item.id] ? "Me gusta" : "Like"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, likedNews, handleShare, openComments, handleLike]
  );

  // ============================
  // RENDER EMPTY STATE
  // ============================
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="newspaper-outline"
          size={60}
          color={colors.secondaryText}
        />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          No hay noticias disponibles
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.green }]}
          onPress={onRefresh}
        >
          <Text style={styles.emptyButtonText}>Recargar</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, colors, onRefresh]);

  // ============================
  // RENDER LOADING
  // ============================
  if (loading && !refreshing && !latestNews.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando noticias...
        </Text>
      </View>
    );
  }

  // ============================
  // RENDER ERROR
  // ============================
  if (error && !latestNews.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.green }]}
          onPress={onRefresh}
        >
          <Text style={styles.errorButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================
  // RENDER PRINCIPAL
  // ============================
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        📰 Noticias de mi rol
      </Text>

      <FlatList
        data={latestNews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      {/* MODAL DE COMENTARIOS */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeComments}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.backdrop }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.modalContainer, { backgroundColor: colors.modal }]}
          >
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                💬 Comentarios
              </Text>
              <TouchableOpacity onPress={closeComments} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Título de la noticia en el modal */}
            {activeNews && (
              <Text style={[styles.modalNewsTitle, { color: colors.text }]}>
                {activeNews.titulo}
              </Text>
            )}

            {/* Lista de comentarios */}
            <FlatList
              data={activeNews?.comments || []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderComment}
              contentContainerStyle={styles.commentList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.noComments, { color: colors.secondaryText }]}>
                  No hay comentarios aún. ¡Sé el primero!
                </Text>
              }
            />

            {/* Input para comentar */}
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={colors.secondaryText}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleAddComment}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: commentText.trim() ? colors.green : colors.secondaryText,
                    opacity: commentText.trim() ? 1 : 0.5,
                  },
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

// ============================
// ESTILOS
// ============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  listContent: {
    paddingBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 12,
  },

  errorText: {
    fontSize: 16,
    textAlign: "center",
  },

  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  errorButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
  },

  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // ============================
  // NEWS ITEM
  // ============================
  newsItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  newsImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },

  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  newsAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00B272",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  newsAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  newsHeaderInfo: {
    flex: 1,
  },

  newsName: {
    fontWeight: "700",
    fontSize: 15,
  },

  newsDate: {
    fontSize: 11,
    marginTop: 1,
  },

  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  newsDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },

  newsActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    paddingTop: 10,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  actionText: {
    marginLeft: 4,
    fontWeight: "500",
    fontSize: 13,
  },

  // ============================
  // MODAL
  // ============================
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "92%",
    maxHeight: "75%",
    borderRadius: 20,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  modalNewsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.8,
  },

  commentList: {
    paddingBottom: 8,
  },

  noComments: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 14,
  },

  // ============================
  // COMENTARIOS
  // ============================
  commentBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  commentUser: {
    fontWeight: "700",
    marginBottom: 2,
    fontSize: 13,
  },

  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },

  commentDate: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },

  // ============================
  // INPUT
  // ============================
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 10,
    gap: 8,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },

  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
});

export default LatestNews;