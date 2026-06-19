// screens/NewsScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";
import { useNewsRole } from "../../../../context/NewsRoleContext";
import { useDarkMode } from "../../../../context/app/DarkModeContext";

// ============================
// TIPOS
// ============================
interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at?: string;
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
  liked?: boolean;
  likes_count?: number;
}

// ============================
// COMPONENTE PRINCIPAL
// ============================
const NewsScreen = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();

  // ============================
  // CONTEXT
  // ============================
  const {
    userNews,
    allUserNews,
    loading,
    error,
    fetchUserLatestNews,
    fetchAllUserNews,
    addComment,
    createNews,    // <-- Importante
    updateNews,    // <-- Importante
  } = useNewsRole();

  // ============================
  // ESTADOS LOCALES
  // ============================
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Estados para crear/editar
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");

  // ============================
  // COLORES (DARK MODE)
  // ============================
  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    input: darkMode ? "#1E293B" : "#f5f5f5",  // Fondo gris claro para modo claro
    inputBorder: darkMode ? "#334155" : "#dddddd",
    comment: darkMode ? "#1E293B" : "#f1f1f1",
    modal: darkMode ? "#0F172A" : "#ffffff",
    green: darkMode ? "#4ADE80" : "#00B272",
    red: darkMode ? "#F87171" : "#EF4444",
    backdrop: "rgba(0,0,0,0.6)",
    placeholder: darkMode ? "#64748B" : "#999999",
  };

  // ============================
  // FETCH NEWS
  // ============================
  useEffect(() => {
    fetchUserLatestNews();
  }, []);

  // ============================
  // REFRESH
  // ============================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await (showAll ? fetchAllUserNews() : fetchUserLatestNews());
    setRefreshing(false);
  }, [fetchUserLatestNews, fetchAllUserNews, showAll]);

  // ============================
  // TOGGLE VIEW
  // ============================
  const toggleView = useCallback(async () => {
    setShowAll(!showAll);
    if (!showAll) {
      await fetchAllUserNews();
    } else {
      await fetchUserLatestNews();
    }
  }, [showAll, fetchAllUserNews, fetchUserLatestNews]);

  // ============================
  // OPEN / CLOSE MODAL COMENTARIOS
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
  // OPEN / CLOSE EDIT MODAL
  // ============================
  const openEditModal = useCallback((item?: NewsItem) => {
    if (item) {
      setEditingId(item.id);
      setTitulo(item.titulo || "");
      setDescripcion(item.descripcion || "");
      setUrl(item.url || "");
    } else {
      setEditingId(null);
      setTitulo("");
      setDescripcion("");
      setUrl("");
    }
    setEditModalVisible(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditingId(null);
    setTitulo("");
    setDescripcion("");
    setUrl("");
  }, []);

  // ============================
  // ADD COMMENT
  // ============================
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !activeNews) return;

    try {
      const newComment = await addComment(activeNews.id, commentText.trim());
      setActiveNews((prev: NewsItem | null) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [newComment, ...(prev.comments || [])],
        };
      });
      setCommentText("");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  }, [commentText, activeNews, addComment]);

  // ============================
  // SAVE NEWS (CREATE / UPDATE) - FUNCIÓN COMPLETA
  // ============================
  const handleSaveNews = useCallback(async () => {
    // Validar campos obligatorios
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert("Error", "Título y descripción son obligatorios");
      return;
    }

    try {
      // Preparar datos
      const newsData = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        url: url.trim() || null,
      };

      let response;
      let successMessage;

      if (editingId) {
        // Actualizar noticia existente
        response = await updateNews(editingId, newsData);
        successMessage = "Noticia actualizada correctamente";
        console.log("Noticia actualizada:", response);
      } else {
        // Crear nueva noticia
        response = await createNews(newsData);
        successMessage = "Noticia creada correctamente";
        console.log("Noticia creada:", response);
      }

      // Mostrar mensaje de éxito
      Alert.alert("Éxito", successMessage);
      
      // Cerrar modal y refrescar lista
      closeEditModal();
      await onRefresh();
      
    } catch (error: any) {
      console.error("Error al guardar noticia:", error);
      
      // Mostrar mensaje de error detallado
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "No se pudo guardar la noticia";
      
      Alert.alert("Error", errorMessage);
    }
  }, [titulo, descripcion, url, editingId, closeEditModal, onRefresh, createNews, updateNews]);

  // ============================
  // RENDER COMMENT
  // ============================
  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View style={[styles.commentBubble, { backgroundColor: colors.comment }]}>
        <Text style={[styles.commentUser, { color: colors.text }]}>
          {item.user?.name || "Usuario"}
        </Text>
        <Text style={[styles.commentText, { color: colors.text }]}>
          {item.content}
        </Text>
        <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
          {new Date(item.created_at || "").toLocaleString()}
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
      const profileName = item.newable?.first_name
        ? `${item.newable.first_name} ${item.newable.last_name || ""}`
        : item.newable?.name || "Perfil";

      const formattedDate = new Date(item.created_at).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

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
          <Image
            source={{
              uri: item.url || `https://picsum.photos/seed/${item.id}/400/200`,
            }}
            style={styles.newsImage}
            resizeMode="cover"
          />

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

          <Text style={[styles.newsTitle, { color: colors.text }]}>
            {item.titulo}
          </Text>

          <Text
            style={[styles.newsDescription, { color: colors.secondaryText }]}
            numberOfLines={3}
          >
            {item.descripcion}
          </Text>

          <View style={[styles.newsActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openComments(item)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.green} />
              <Text style={[styles.actionText, { color: colors.green }]}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil-outline" size={20} color={colors.green} />
              <Text style={[styles.actionText, { color: colors.green }]}>
                Editar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [colors, openComments, openEditModal]
  );

  // ============================
  // RENDER EMPTY STATE
  // ============================
  const renderEmptyState = useCallback(() => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={60} color={colors.secondaryText} />
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
          {showAll ? "No tienes noticias" : "No tienes noticias recientes"}
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: colors.green }]}
          onPress={() => openEditModal()}
        >
          <Text style={styles.emptyButtonText}>Crear mi primera noticia</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, colors, showAll, openEditModal]);

  // ============================
  // RENDER LOADING
  // ============================
  if (loading && !refreshing && !userNews.length && !allUserNews.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando tus noticias...
        </Text>
      </View>
    );
  }

  // ============================
  // RENDER ERROR
  // ============================
  if (error && !userNews.length && !allUserNews.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
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
  const data = showAll ? allUserNews : userNews;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header con título y botón de toggle */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          📰 Mis noticias
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.toggleButton, { borderColor: colors.border }]}
            onPress={toggleView}
          >
            <Text style={[styles.toggleText, { color: colors.text }]}>
              {showAll ? "Ver recientes" : "Ver todas"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.green }]}
            onPress={() => openEditModal()}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
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
          <View style={[styles.modalContainer, { backgroundColor: colors.modal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                💬 Comentarios
              </Text>
              <TouchableOpacity onPress={closeComments} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {activeNews && (
              <Text style={[styles.modalNewsTitle, { color: colors.text }]}>
                {activeNews.titulo}
              </Text>
            )}

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
          </View>
        </View>
      </Modal>

      {/* MODAL PARA CREAR/EDITAR NOTICIA */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.backdrop }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modal }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingId ? "✏️ Editar noticia" : "📝 Nueva noticia"}
              </Text>
              <TouchableOpacity onPress={closeEditModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Título */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Título *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: '#000000', // Texto siempre negro
                  },
                ]}
                placeholder="Ej: Nuevo lanzamiento de producto"
                placeholderTextColor={colors.placeholder}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={191}
              />
            </View>

            {/* Descripción */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Descripción *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: '#000000', // Texto siempre negro
                  },
                ]}
                placeholder="Describe tu noticia en detalle..."
                placeholderTextColor={colors.placeholder}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                maxLength={1000}
                textAlignVertical="top"
              />
            </View>

            {/* URL de imagen */}
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>URL de imagen (opcional)</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: '#000000', // Texto siempre negro
                  },
                ]}
                placeholder="https://ejemplo.com/imagen.jpg"
                placeholderTextColor={colors.placeholder}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
              />
            </View>

            {/* Botones */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.green }]}
              onPress={handleSaveNews}
            >
              <Text style={styles.saveButtonText}>
                {editingId ? "Actualizar noticia" : "Crear noticia"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeEditModal}
            >
              <Text style={[styles.cancelButtonText, { color: colors.secondaryText }]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
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

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "92%",
    maxHeight: "85%",
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

  inputWrapper: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  textArea: {
    minHeight: 100,
    maxHeight: 150,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },

  sendButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },

  saveButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  cancelButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 4,
  },

  cancelButtonText: {
    fontSize: 14,
  },

  
});

export default NewsScreen;