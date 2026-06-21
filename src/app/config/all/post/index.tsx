// screens/PostsScreen.tsx - VERSIÓN COMPLETA CON MODAL Y TOGGLE
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useAuth } from "../../../../context/AuthContext";
import { usePosts } from "../../../../context/PostContext";

export default function PostsScreen() {
  const {
    posts,
    myPosts,
    fetchMyPosts,
    createPost,
    deletePost,
    toggleLike,
  } = usePosts();

  const { user } = useAuth();

  // Estados del formulario
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    await fetchMyPosts();
  };

  // Toggle entre ver todas y ver recientes (últimas 3)
  const toggleView = () => {
    setShowAll(!showAll);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      await createPost({
        title,
        content,
        image,
      });

      setTitle("");
      setContent("");
      setImage(null);
      setModalVisible(false);

      await loadPosts();
    } catch (error) {
      console.log("Error creando post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      await deletePost(selectedId);
      setSelectedId(null);
      setShowModal(false);
      await loadPosts();
    } catch (error) {
      console.log(error);
    }
  };

  // Renderizar cada post
  const renderPost = ({ item }: any) => {
    const isLiked = item.liked || false;
    const likesCount = item.likes_count || 0;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>
              {item.user?.name || "Usuario"}
            </Text>

            <Text style={styles.postDate}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {!!item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.postImage}
          />
        )}

        <Text style={styles.postTitle}>{item.title}</Text>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#DC2626" : "#6B7280"}
            />
            <Text style={[styles.actionText, isLiked && { color: "#DC2626" }]}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {}}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
            <Text style={styles.actionText}>
              {item.comments?.length || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
            <Text style={[styles.actionText, { color: "#DC2626" }]}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Determinar qué datos mostrar
  const displayData = showAll ? posts : (myPosts?.slice(0, 3) || []);

  return (
    <View style={styles.container}>
      {/* HEADER CON TÍTULO Y BOTONES */}
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>📝 Mis publicaciones</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.toggleButton, { borderColor: "#E5E7EB" }]}
            onPress={toggleView}
          >
            <Text style={styles.toggleText}>
              {showAll ? "Ver recientes" : "Ver todas"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA DE POSTS */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              {showAll
                ? "No tienes publicaciones"
                : "No tienes publicaciones recientes"}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>
                Crear mi primera publicación
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* MODAL PARA CREAR POST */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalWrapper}
            >
              <View style={styles.modalContent}>
                {/* Header del Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📝 Nueva publicación</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Formulario */}
                <TextInput
                  placeholder="Título"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />

                <TextInput
                  placeholder="¿Qué deseas publicar?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={content}
                  onChangeText={setContent}
                  style={[styles.input, styles.contentInput]}
                />

                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  <Ionicons name="image-outline" size={20} color="#16A34A" />
                  <Text style={styles.imagePickerText}>
                    {image ? "Cambiar imagen" : "Seleccionar imagen"}
                  </Text>
                </TouchableOpacity>

                {image && (
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                  />
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: "#E5E7EB", borderWidth: 1 }]}
                    onPress={() => {
                      setModalVisible(false);
                      setTitle("");
                      setContent("");
                      setImage(null);
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={{ color: "#6B7280", fontWeight: "600" }}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.publishBtn,
                      (!title.trim() || !content.trim() || isSubmitting) &&
                        styles.publishBtnDisabled,
                    ]}
                    onPress={handleCreate}
                    disabled={!title.trim() || !content.trim() || isSubmitting}
                  >
                    <Text style={styles.publishBtnText}>
                      {isSubmitting ? "Publicando..." : "Publicar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL ELIMINAR */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Eliminar publicación?</Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleDelete}
              >
                <Text style={{ color: "#fff" }}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  // HEADER
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
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
    color: "#374151",
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  // LISTA
  listContent: {
    paddingBottom: 120,
  },

  // POST CARD
  postCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },

  userName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827",
  },

  postDate: {
    color: "#6B7280",
    fontSize: 12,
  },

  postTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },

  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },

  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },

  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  actionText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 13,
  },

  // MODAL CREAR POST
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "92%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  modalClose: {
    padding: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#111827",
  },

  contentInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  imagePicker: {
    flexDirection: "row",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#16A34A",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#F0FDF4",
    gap: 8,
  },

  imagePickerText: {
    color: "#16A34A",
    fontWeight: "600",
  },

  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  publishBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#16A34A",
  },

  publishBtnDisabled: {
    opacity: 0.5,
  },

  publishBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // MODAL ELIMINAR
  modalBox: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
  },

  modalText: {
    color: "#6B7280",
    marginBottom: 20,
  },

  confirmBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },

  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    marginTop: 8,
  },

  emptyButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
});