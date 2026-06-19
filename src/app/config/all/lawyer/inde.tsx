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
import { usePosts } from "../../../../context/PostContext";
import { useServices } from "../../../../context/ServiceContext";
import { useDarkMode } from "../../../../context/app/DarkModeContext";
import api from "../../../../utils/axios";

// ============================================================
// TIPOS PARA COMENTARIOS
// ============================================================
interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
  created_at?: string;
}

interface PostWithComments {
  id: number;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  liked?: boolean;
  likes_count?: number;
  comments: Comment[];
}

export default function LawyerScreen() {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  
  // =========================================================
  // CONTEXTS
  // =========================================================
  const {
    posts,
    myPosts,
    loading: postsLoading,
    loadingMyPosts,
    fetchHomePosts,
    fetchMyPosts,
    createPost,
    deletePost,
    toggleLike,
    addComment,
  } = usePosts();

  const {
    services,
    loading: servicesLoading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices();

  // =========================================================
  // COLORES (DARK MODE)
  // =========================================================
  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    input: darkMode ? "#1E293B" : "#F3F4F6",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    border: darkMode ? "#334155" : "#E5E7EB",
    button: "#16A34A",
    placeholder: darkMode ? "#94A3B8" : "#999999",
    danger: "#EF4444",
    green: "#22c55e",
    blue: "#3B82F6",
  };

  // =========================================================
  // ESTADOS LOCALES
  // =========================================================
  const [tab, setTab] = useState("perfil");
  const [form, setForm] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para modales de servicios
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");

  // Estados para modales de posts
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState("general");

  // Estados para comentarios
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePost, setActivePost] = useState<PostWithComments | null>(null);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  // Estados para like - ACTUALIZACIÓN EN TIEMPO REAL
  const [localLikes, setLocalLikes] = useState<Record<number, { liked: boolean; count: number }>>({});

  // =========================================================
  // OBTENER DATOS DEL PERFIL DESDE AUTH
  // =========================================================
  const lawyer = user?.profile;

  // =========================================================
  // EFFECTS - CARGAR DATOS
  // =========================================================
  useEffect(() => {
    if (lawyer?.id) {
      loadAllData();
    }
  }, [lawyer?.id]);

  // =========================================================
  // SINCRONIZAR FORM CON LAWYER
  // =========================================================
  useEffect(() => {
    if (lawyer) {
      setForm(lawyer);
    }
  }, [lawyer]);

  // =========================================================
  // FUNCIÓN PARA CARGAR TODOS LOS DATOS (LATEST)
  // =========================================================
  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchServices(),
        fetchHomePosts(),
        fetchMyPosts(),
      ]);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  }, [fetchServices, fetchHomePosts, fetchMyPosts]);

  // =========================================================
  // REFRESH
  // =========================================================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  // =========================================================
  // ACTUALIZAR PERFIL
  // =========================================================
  const handleUpdate = async () => {
    try {
      setLoading(true);
      
      const lawyerId = lawyer?.id;
      
      if (!lawyerId) {
        Alert.alert("Error", "No se encontró el ID del abogado");
        return;
      }

      await api.put(`/lawyers/${lawyerId}`, {
        first_name: form.first_name,
        last_name: form.last_name,
        specialty: form.specialty,
        city: form.city,
        university: form.university,
        description: form.description,
        schedule: form.schedule,
        license_code: form.license_code,
      });

      Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("❌ Error:", err);
      Alert.alert("❌ Error", err?.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CREAR SERVICIO
  // =========================================================
  const handleCreateService = async () => {
    if (!serviceName.trim() || !servicePrice.trim()) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    try {
      await createService({
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        price: parseFloat(servicePrice),
        duration: parseInt(serviceDuration) || 30,
        serviceable_type: "App\\Models\\Lawyer",
        serviceable_id: lawyer?.id || 0,
      });
      
      Alert.alert("✅ Éxito", "Servicio creado correctamente");
      resetServiceModal();
      await fetchServices();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo crear el servicio");
    }
  };

  // =========================================================
  // ELIMINAR SERVICIO
  // =========================================================
  const handleDeleteService = (id: number) => {
    Alert.alert(
      "Eliminar servicio",
      "¿Estás seguro de que quieres eliminar este servicio?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteService(id);
              await fetchServices();
              Alert.alert("✅ Éxito", "Servicio eliminado");
            } catch (error: any) {
              Alert.alert("Error", error?.message || "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // CREAR POST
  // =========================================================
  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      Alert.alert("Error", "Título y contenido son obligatorios");
      return;
    }

    try {
      await createPost({
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
      });
      
      Alert.alert("✅ Éxito", "Post creado correctamente");
      resetPostModal();
      await Promise.all([fetchHomePosts(), fetchMyPosts()]);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo crear el post");
    }
  };

  // =========================================================
  // ELIMINAR POST
  // =========================================================
  const handleDeletePost = (id: number) => {
    Alert.alert(
      "Eliminar post",
      "¿Estás seguro de que quieres eliminar este post?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(id);
              await Promise.all([fetchHomePosts(), fetchMyPosts()]);
              Alert.alert("✅ Éxito", "Post eliminado");
            } catch (error: any) {
              Alert.alert("Error", error?.message || "No se pudo eliminar");
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // TOGGLE LIKE - CON ACTUALIZACIÓN EN TIEMPO REAL
  // =========================================================
  const handleToggleLike = async (postId: number) => {
    try {
      // Obtener estado actual del like
      const currentLiked = localLikes[postId]?.liked ?? false;
      const currentCount = localLikes[postId]?.count ?? 0;
      
      // Actualizar optimistamente
      setLocalLikes(prev => ({
        ...prev,
        [postId]: {
          liked: !currentLiked,
          count: currentLiked ? currentCount - 1 : currentCount + 1,
        }
      }));

      // Llamar a la API
      await toggleLike(postId);
      
      // Recargar para sincronizar
      await Promise.all([fetchHomePosts(), fetchMyPosts()]);
    } catch (error: any) {
      // Revertir en caso de error
      setLocalLikes(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
      Alert.alert("Error", error?.message || "No se pudo dar like");
    }
  };

  // =========================================================
  // ABRIR MODAL DE COMENTARIOS
  // =========================================================
  const openCommentModal = (post: PostWithComments) => {
    setActivePost(post);
    setLocalComments(post.comments || []);
    setCommentText("");
    setCommentModalVisible(true);
  };

  // =========================================================
  // AGREGAR COMENTARIO
  // =========================================================
  const handleAddComment = async () => {
    if (!commentText.trim() || !activePost) return;

    try {
      const newComment = await addComment(activePost.id, commentText.trim());
      
      setLocalComments(prev => [newComment, ...prev]);
      setCommentText("");
      
      await Promise.all([fetchHomePosts(), fetchMyPosts()]);
      
      const updatedPost = myPosts.find(p => p.id === activePost.id) || posts.find(p => p.id === activePost.id);
      if (updatedPost) {
        setActivePost(updatedPost);
        setLocalComments(updatedPost.comments || []);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo agregar el comentario");
    }
  };

  // =========================================================
  // CERRAR MODAL DE COMENTARIOS
  // =========================================================
  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setActivePost(null);
    setLocalComments([]);
    setCommentText("");
  };

  // =========================================================
  // RESET MODALS
  // =========================================================
  const resetServiceModal = () => {
    setServiceModalVisible(false);
    setEditingService(null);
    setServiceName("");
    setServiceDescription("");
    setServicePrice("");
    setServiceDuration("");
  };

  const resetPostModal = () => {
    setPostModalVisible(false);
    setEditingPost(null);
    setPostTitle("");
    setPostContent("");
    setPostCategory("general");
  };

  // =========================================================
  // RENDER COMENTARIO
  // =========================================================
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.commentAuthor, { color: colors.blue }]}>
        {item.user?.name || "Usuario"}
      </Text>
      <Text style={[styles.commentContent, { color: colors.text }]}>
        {item.content}
      </Text>
      <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
        {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
      </Text>
    </View>
  );

  // =========================================================
  // RENDER POST
  // =========================================================
  const renderPost = ({ item }: { item: any }) => {
    const likeState = localLikes[item.id] || {
      liked: item.liked || false,
      count: item.likes_count || 0,
    };

    return (
      <View
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <View style={styles.cardActions}>
            {/* Botón Like */}
            <TouchableOpacity onPress={() => handleToggleLike(item.id)} style={styles.actionButton}>
              <Ionicons
                name={likeState.liked ? "heart" : "heart-outline"}
                size={20}
                color={likeState.liked ? colors.danger : colors.secondaryText}
              />
              <Text style={[styles.likeCount, { color: likeState.liked ? colors.danger : colors.secondaryText }]}>
                {likeState.count}
              </Text>
            </TouchableOpacity>

            {/* Botón Comentarios */}
            <TouchableOpacity
              onPress={() => openCommentModal(item)}
              style={styles.actionButton}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.blue} />
              <Text style={[styles.commentCount, { color: colors.blue }]}>
                {item.comments?.length || 0}
              </Text>
            </TouchableOpacity>

            {/* Botón Eliminar */}
            <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
              <Ionicons name="trash" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.cardDescription, { color: colors.secondaryText }]} numberOfLines={3}>
          {item.content}
        </Text>

        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}

        <Text style={[styles.dateText, { color: colors.secondaryText }]}>
          📅 {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (!lawyer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  // =========================================================
  // RENDER CONTENIDO SEGÚN TAB
  // =========================================================
  const renderContent = () => {
    if (tab === "perfil") {
      return (
        <View style={styles.formContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Nombre"
            placeholderTextColor={colors.placeholder}
            value={form.first_name}
            onChangeText={(t) => setForm({ ...form, first_name: t })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Apellido"
            placeholderTextColor={colors.placeholder}
            value={form.last_name}
            onChangeText={(t) => setForm({ ...form, last_name: t })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Especialidad"
            placeholderTextColor={colors.placeholder}
            value={form.specialty}
            onChangeText={(t) => setForm({ ...form, specialty: t })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Ciudad"
            placeholderTextColor={colors.placeholder}
            value={form.city}
            onChangeText={(t) => setForm({ ...form, city: t })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Universidad"
            placeholderTextColor={colors.placeholder}
            value={form.university}
            onChangeText={(t) => setForm({ ...form, university: t })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Código de licencia"
            placeholderTextColor={colors.placeholder}
            value={form.license_code}
            onChangeText={(t) => setForm({ ...form, license_code: t })}
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Descripción"
            placeholderTextColor={colors.placeholder}
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
            multiline
            numberOfLines={4}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            placeholder="Horario (ej: L-V 9:00-18:00)"
            placeholderTextColor={colors.placeholder}
            value={form.schedule}
            onChangeText={(t) => setForm({ ...form, schedule: t })}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
            <Text style={styles.saveText}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (tab === "services") {
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingService(null);
              setServiceName("");
              setServiceDescription("");
              setServicePrice("");
              setServiceDuration("");
              setServiceModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={colors.blue} />
            <Text style={[styles.addButtonText, { color: colors.blue }]}>
              Agregar servicio
            </Text>
          </TouchableOpacity>

          {servicesLoading ? (
            <ActivityIndicator size="small" color={colors.blue} />
          ) : services && services.length > 0 ? (
            services.map((s: any) => (
              <View
                key={s.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {s.name}
                  </Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingService(s);
                        setServiceName(s.name);
                        setServiceDescription(s.description || "");
                        setServicePrice(s.price?.toString() || "");
                        setServiceDuration(s.duration?.toString() || "");
                        setServiceModalVisible(true);
                      }}
                    >
                      <Ionicons name="pencil" size={20} color={colors.blue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteService(s.id)}>
                      <Ionicons name="trash" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>
                  {s.description}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>${s.price}</Text>
                  {s.duration && (
                    <Text style={[styles.duration, { color: colors.secondaryText }]}>
                      ⏱ {s.duration} min
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={50} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No tienes servicios aún
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (tab === "posts") {
      return (
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingPost(null);
              setPostTitle("");
              setPostContent("");
              setPostCategory("general");
              setPostModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={colors.blue} />
            <Text style={[styles.addButtonText, { color: colors.blue }]}>
              Crear post
            </Text>
          </TouchableOpacity>

          {loadingMyPosts ? (
            <ActivityIndicator size="small" color={colors.blue} />
          ) : myPosts && myPosts.length > 0 ? (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPost}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={50} color={colors.secondaryText} />
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No tienes posts aún
              </Text>
            </View>
          )}
        </View>
      );
    }
  };

  // =========================================================
  // RENDER PRINCIPAL CON FLATLIST
  // =========================================================
  const data = [{ key: "content" }];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={() => (
          <>
            {/* =========================================================
                HEADER
            ========================================================= */}
            <View style={styles.header}>
              <Image
                source={{
                  uri: lawyer.image || "https://picsum.photos/seed/lawyer/200",
                }}
                style={styles.avatar}
              />
              <Text style={[styles.name, { color: colors.text }]}>
                {lawyer.first_name} {lawyer.last_name}
              </Text>
              <Text style={[styles.sub, { color: colors.secondaryText }]}>
                {lawyer.specialty || "Especialidad no especificada"}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={[styles.ratingText, { color: colors.secondaryText }]}>
                  {lawyer?.rating || 0} / 5
                </Text>
              </View>
            </View>

            {/* =========================================================
                TABS
            ========================================================= */}
            <View style={styles.tabs}>
              {["perfil", "services", "posts"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTab(t)}
                  style={styles.tabButton}
                >
                  <Text
                    style={
                      tab === t
                        ? [styles.activeTab, { color: colors.blue }]
                        : [styles.tab, { color: colors.secondaryText }]
                    }
                  >
                    {t === "perfil" ? "Perfil" : t === "services" ? "Servicios" : "Posts"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* =========================================================
                CONTENIDO SEGÚN TAB
            ========================================================= */}
            {renderContent()}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue}
            colors={[colors.blue]}
          />
        }
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />

      {/* =========================================================
          MODAL PARA SERVICIOS
      ========================================================= */}
      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetServiceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingService ? "Editar servicio" : "Nuevo servicio"}
            </Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Nombre del servicio"
              placeholderTextColor={colors.placeholder}
              value={serviceName}
              onChangeText={setServiceName}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Descripción"
              placeholderTextColor={colors.placeholder}
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Precio ($)"
              placeholderTextColor={colors.placeholder}
              value={servicePrice}
              onChangeText={setServicePrice}
              keyboardType="numeric"
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Duración (minutos)"
              placeholderTextColor={colors.placeholder}
              value={serviceDuration}
              onChangeText={setServiceDuration}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={resetServiceModal}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton, { backgroundColor: colors.blue }]}
                onPress={handleCreateService}
              >
                <Text style={styles.modalButtonText}>
                  {editingService ? "Actualizar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          MODAL PARA POSTS
      ========================================================= */}
      <Modal
        visible={postModalVisible}
        transparent
        animationType="slide"
        onRequestClose={resetPostModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingPost ? "Editar post" : "Nuevo post"}
            </Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Título del post"
              placeholderTextColor={colors.placeholder}
              value={postTitle}
              onChangeText={setPostTitle}
            />
            
            <TextInput
              style={[styles.modalInput, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              placeholder="Contenido del post"
              placeholderTextColor={colors.placeholder}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              numberOfLines={5}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={resetPostModal}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton, { backgroundColor: colors.blue }]}
                onPress={handleCreatePost}
              >
                <Text style={styles.modalButtonText}>
                  {editingPost ? "Actualizar" : "Crear"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          MODAL PARA COMENTARIOS
      ========================================================= */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeCommentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.card, maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                💬 Comentarios
              </Text>
              <TouchableOpacity onPress={closeCommentModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {activePost && (
              <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
                {activePost.title}
              </Text>
            )}

            {/* Lista de comentarios */}
            <FlatList
              data={localComments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderComment}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={
                <Text style={[styles.emptyComments, { color: colors.secondaryText }]}>
                  No hay comentarios aún. ¡Sé el primero!
                </Text>
              }
              style={{ maxHeight: 300 }}
            />

            {/* Input para nuevo comentario */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={colors.placeholder}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendCommentButton,
                  {
                    backgroundColor: commentText.trim() ? colors.blue : colors.secondaryText,
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
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  sub: {
    marginTop: 4,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tab: {
    fontSize: 15,
    fontWeight: "500",
  },
  activeTab: {
    fontSize: 15,
    fontWeight: "700",
  },
  formContainer: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tabContent: {
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  price: {
    fontWeight: "bold",
    color: "#3B82F6",
    fontSize: 16,
  },
  duration: {
    fontSize: 13,
  },
  categoryBadge: {
    backgroundColor: "#3B82F620",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  categoryText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    marginTop: 6,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  commentCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelModalButton: {
    backgroundColor: "#E5E7EB",
  },
  saveModalButton: {
    backgroundColor: "#3B82F6",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  // Estilos para comentarios
  commentsList: {
    paddingVertical: 8,
  },
  commentItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 14,
  },
  commentContent: {
    fontSize: 14,
    marginTop: 2,
  },
  commentDate: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyComments: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 80,
    fontSize: 14,
  },
  sendCommentButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    minHeight: 44,
  },
});