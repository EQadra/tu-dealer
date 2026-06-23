import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useAssociations } from "../../../context/AssociationContext";
import { useComments } from "../../../context/CommentContext";
import api from "../../../utils/axios";

export default function AssociationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { fetchAssociationById } = useAssociations();

  const {
    loading: commentsLoading,
    fetchPostComments,
    createPostComment,
    deletePostComment,
    fetchProductComments,
    createProductComment,
    deleteProductComment,
  } = useComments();

  const [association, setAssociation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("perfil");
  const [modalVisible, setModalVisible] = useState(false);

  // Estados para comentarios
  const [commentText, setCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [commentingProductId, setCommentingProductId] = useState<number | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<{type: 'post' | 'product', id: number} | null>(null);
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [productComments, setProductComments] = useState<Record<number, any[]>>({});
  
  // Modal para agregar comentario
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentModalType, setCommentModalType] = useState<'post' | 'product' | null>(null);
  const [commentModalId, setCommentModalId] = useState<number | null>(null);
  const [commentModalText, setCommentModalText] = useState("");

  // Modal para feedback
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    const loadAssociation = async () => {
      const associationId = Array.isArray(id) ? id[0] : id;
      console.log("🔄 Cargando asociación ID:", associationId);
      
      try {
        const data = await fetchAssociationById(Number(associationId));
        console.log("📦 Data recibida:", data);
        
        if (data) {
          setAssociation(data);
        } else {
          console.log("❌ No se encontró la asociación");
        }
      } catch (error) {
        console.error("❌ Error cargando asociación:", error);
        Alert.alert("Error", "No se pudo cargar la asociación");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadAssociation();
  }, [id]);

  const rating = useMemo(() => {
    if (!association?.feedbacks?.length) return 0;
    const total = association.feedbacks.reduce((acc: number, f: any) => acc + Number(f.rating), 0);
    return total / association.feedbacks.length;
  }, [association]);

  // Cargar comentarios de un post específico
  const loadPostComments = async (postId: number) => {
    try {
      const data = await fetchPostComments(postId);
      setPostComments(prev => ({ ...prev, [postId]: data }));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  };

  // Cargar comentarios de un producto
  const loadProductComments = async (productId: number) => {
    try {
      const data = await fetchProductComments(productId);
      setProductComments(prev => ({ ...prev, [productId]: data }));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  };

  // Abrir modal para agregar comentario
  const openCommentModal = (type: 'post' | 'product', id: number) => {
    setCommentModalType(type);
    setCommentModalId(id);
    setCommentModalText("");
    setCommentModalVisible(true);
  };

  // Enviar comentario desde el modal
  const submitCommentFromModal = async () => {
    if (!commentModalText.trim()) {
      Alert.alert("Error", "Escribe un comentario");
      return;
    }

    if (!commentModalId || !commentModalType) return;

    try {
      if (commentModalType === 'post') {
        const newComment = await createPostComment(commentModalId, commentModalText);
        setPostComments(prev => ({
          ...prev,
          [commentModalId!]: [newComment, ...(prev[commentModalId!] || [])]
        }));
      } else {
        const newComment = await createProductComment(commentModalId, commentModalText);
        setProductComments(prev => ({
          ...prev,
          [commentModalId!]: [newComment, ...(prev[commentModalId!] || [])]
        }));
      }
      
      setCommentModalVisible(false);
      setCommentModalText("");
      Alert.alert("Éxito", "Comentario agregado");
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el comentario");
    }
  };

  // Enviar feedback
  const submitFeedback = async () => {
    if (feedbackRating === 0) {
      Alert.alert("Error", "Selecciona una calificación");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await api.post('/feedbacks', {
        feedbackable_type: 'App\\Models\\Association',
        feedbackable_id: association.id,
        rating: feedbackRating,
        comment: feedbackComment
      });

      Alert.alert("Éxito", "¡Reseña agregada correctamente!");
      setFeedbackModalVisible(false);
      setFeedbackRating(0);
      setFeedbackComment("");
      
      // Recargar los datos
      const data = await fetchAssociationById(Number(id));
      if (data) setAssociation(data);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "No se pudo agregar la reseña");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Eliminar comentario de post
  const handleDeletePostComment = async (commentId: number, postId: number) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Estás seguro de que quieres eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePostComment(commentId);
              setPostComments(prev => ({
                ...prev,
                [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
              }));
              Alert.alert("Éxito", "Comentario eliminado");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          }
        }
      ]
    );
  };

  // Eliminar comentario de producto
  const handleDeleteProductComment = async (commentId: number, productId: number) => {
    Alert.alert(
      "Eliminar comentario",
      "¿Estás seguro de que quieres eliminar este comentario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProductComment(commentId);
              setProductComments(prev => ({
                ...prev,
                [productId]: (prev[productId] || []).filter(c => c.id !== commentId)
              }));
              Alert.alert("Éxito", "Comentario eliminado");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el comentario");
            }
          }
        }
      ]
    );
  };

  // Alternar visibilidad de comentarios
  const toggleComments = async (type: 'post' | 'product', id: number) => {
    if (showCommentsFor?.type === type && showCommentsFor?.id === id) {
      setShowCommentsFor(null);
    } else {
      setShowCommentsFor({ type, id });
      if (type === 'post') {
        await loadPostComments(id);
      } else {
        await loadProductComments(id);
      }
    }
  };

  // Componente de comentarios
  const CommentSection = ({ 
    comments, 
    onDeleteComment,
    type,
    itemId
  }: { 
    comments: any[];
    onDeleteComment: (id: number) => void;
    type: 'post' | 'product';
    itemId: number;
  }) => {
    if (commentsLoading) {
      return <ActivityIndicator size="small" color="#00B272" />;
    }

    return (
      <View style={styles.commentContainer}>
        {comments?.length > 0 ? (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <View style={styles.commentUserInfo}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.user?.name?.charAt(0) || "U"}
                    </Text>
                  </View>
                  <Text style={styles.commentAuthor}>
                    {comment.user?.name || "Usuario"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onDeleteComment(comment.id)}
                  style={styles.deleteCommentBtn}
                >
                  <Text style={styles.deleteCommentText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.commentContent}>{comment.content}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noComments}>No hay comentarios</Text>
        )}
        
        <TouchableOpacity
          style={styles.addCommentBtn}
          onPress={() => openCommentModal(type, itemId)}
        >
          <Text style={styles.addCommentText}>+ Agregar comentario</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>Cargando asociación...</Text>
      </View>
    );
  }

  if (!association) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#64748B" }}>Asociación no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER - Con imagen circular centrada */}
        <View style={styles.headerCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: association.image || "https://picsum.photos/400",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.name}>{association.name}</Text>
          <Text style={styles.specialty}>📍 {association.city}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.sub}>📞 {association.phone || "No disponible"}</Text>
            <Text style={styles.sub}>🌐 {association.website || "No disponible"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>🏠 {association.address || "No disponible"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.sub}>👤 {association.user?.name || "No disponible"}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>
              ({association.feedbacks?.length || 0} reseñas)
            </Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["perfil", "posts", "productos", "feedbacks"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={activeTab === tab ? styles.tabTextActive : styles.tabText}>
                {tab === "perfil" ? "Perfil" : 
                 tab === "posts" ? "Posts" : 
                 tab === "productos" ? "Productos" : "Opiniones"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PERFIL */}
        {activeTab === "perfil" && (
          <View style={styles.card}>
            <Text style={styles.title}>Descripción</Text>
            <Text style={styles.text}>{association.description || "Sin descripción"}</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Ciudad</Text>
                <Text style={styles.infoValue}>{association.city || "-"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞 Teléfono</Text>
                <Text style={styles.infoValue}>{association.phone || "-"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🌐 Website</Text>
                <Text style={styles.infoValue}>{association.website || "-"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Dirección</Text>
                <Text style={styles.infoValue}>{association.address || "-"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* POSTS */}
        {activeTab === "posts" && (
          <View>
            {association.posts && association.posts.length > 0 ? (
              association.posts.map((post: any) => (
                <View key={post.id} style={styles.card}>
                  <Image
                    source={{
                      uri: post.image || "https://picsum.photos/400",
                    }}
                    style={styles.postImage}
                  />
                  <Text style={styles.title}>{post.title}</Text>
                  <Text style={styles.text}>{post.short_content || post.content}</Text>
                  
                  <TouchableOpacity
                    style={styles.commentToggleBtn}
                    onPress={() => toggleComments('post', post.id)}
                  >
                    <Text style={styles.commentToggleText}>
                      {showCommentsFor?.type === 'post' && showCommentsFor?.id === post.id
                        ? "Ocultar comentarios"
                        : `Ver comentarios (${postComments[post.id]?.length || 0})`}
                    </Text>
                  </TouchableOpacity>

                  {showCommentsFor?.type === 'post' && showCommentsFor?.id === post.id && (
                    <CommentSection
                      comments={postComments[post.id] || []}
                      onDeleteComment={(commentId) => handleDeletePostComment(commentId, post.id)}
                      type="post"
                      itemId={post.id}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Esta asociación no tiene posts aún</Text>
              </View>
            )}
          </View>
        )}

        {/* PRODUCTOS */}
        {activeTab === "productos" && (
          <View>
            {association.products && association.products.length > 0 ? (
              association.products.map((product: any) => (
                <View key={product.id} style={styles.card}>
                  <Image
                    source={{
                      uri: product.image || "https://picsum.photos/400",
                    }}
                    style={styles.postImage}
                  />
                  <Text style={styles.title}>{product.name}</Text>
                  <Text style={styles.text}>{product.description}</Text>
                  <Text style={styles.price}>S/ {Number(product.price).toFixed(2)}</Text>
                  
                  <TouchableOpacity
                    style={styles.commentToggleBtn}
                    onPress={() => toggleComments('product', product.id)}
                  >
                    <Text style={styles.commentToggleText}>
                      {showCommentsFor?.type === 'product' && showCommentsFor?.id === product.id
                        ? "Ocultar comentarios"
                        : `Ver comentarios (${productComments[product.id]?.length || 0})`}
                    </Text>
                  </TouchableOpacity>

                  {showCommentsFor?.type === 'product' && showCommentsFor?.id === product.id && (
                    <CommentSection
                      comments={productComments[product.id] || []}
                      onDeleteComment={(commentId) => handleDeleteProductComment(commentId, product.id)}
                      type="product"
                      itemId={product.id}
                    />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>Esta asociación no tiene productos aún</Text>
              </View>
            )}
          </View>
        )}

        {/* FEEDBACKS */}
        {activeTab === "feedbacks" && (
          <View>
            <TouchableOpacity
              style={[styles.btn, styles.addFeedbackBtn]}
              onPress={() => setFeedbackModalVisible(true)}
            >
              <Text style={styles.btnText}>+ Agregar reseña</Text>
            </TouchableOpacity>

            {association.feedbacks && association.feedbacks.length > 0 ? (
              association.feedbacks.map((f: any) => (
                <View key={f.id} style={styles.card}>
                  <View style={styles.feedbackHeader}>
                    <View style={styles.commentUserInfo}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {f.user?.name?.charAt(0) || "U"}
                        </Text>
                      </View>
                      <Text style={styles.feedbackUser}>{f.user?.name || "Usuario"}</Text>
                    </View>
                    <Text style={styles.rating}>⭐ {f.rating}</Text>
                  </View>
                  <Text style={styles.text}>{f.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.text}>No hay reseñas aún</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL - Agregar comentario */}
      <Modal
        visible={commentModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modal}>
          <View style={[styles.modalContent, styles.commentModalContent]}>
            <Text style={styles.modalTitle}>Agregar comentario</Text>
            
            <TextInput
              style={styles.commentModalInput}
              placeholder="Escribe tu comentario..."
              value={commentModalText}
              onChangeText={setCommentModalText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.commentModalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelModalBtn]}
                onPress={() => {
                  setCommentModalVisible(false);
                  setCommentModalText("");
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn}
                onPress={submitCommentFromModal}
              >
                <Text style={styles.btnText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL - Agregar Feedback */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modal}>
          <View style={[styles.modalContent, styles.commentModalContent]}>
            <Text style={styles.modalTitle}>Calificar a {association.name}</Text>
            
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFeedbackRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[
                    styles.starText,
                    feedbackRating >= star && styles.starActive
                  ]}>
                    ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>
              {feedbackRating > 0 ? `${feedbackRating} estrella${feedbackRating > 1 ? 's' : ''}` : 'Selecciona una calificación'}
            </Text>

            <TextInput
              style={styles.commentModalInput}
              placeholder="Escribe tu reseña..."
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.commentModalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelModalBtn]}
                onPress={() => {
                  setFeedbackModalVisible(false);
                  setFeedbackRating(0);
                  setFeedbackComment("");
                }}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn}
                onPress={submitFeedback}
                disabled={submittingFeedback}
              >
                <Text style={styles.btnText}>
                  {submittingFeedback ? 'Enviando...' : 'Enviar reseña'}
                </Text>
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
    backgroundColor: "#F5F7F9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Header con imagen circular centrada
  headerCard: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#00B272",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
    color: "#1A1A2E",
    textAlign: "center",
  },
  specialty: {
    color: "#00B272",
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 6,
    flexWrap: "wrap",
  },
  sub: {
    color: "#666",
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  rating: {
    color: "#FF9900",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingCount: {
    color: "#666",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8ECF0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingVertical: 8,
  },
  tab: {
    borderWidth: 1,
    borderColor: "#00B272",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  tabActive: {
    backgroundColor: "#00B272",
  },
  tabText: {
    color: "#00B272",
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 16,
    color: "#1A1A2E",
  },
  text: {
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  price: {
    color: "#00B272",
    marginTop: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  btn: {
    backgroundColor: "#00B272",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  addFeedbackBtn: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  cancelModalBtn: {
    backgroundColor: "#999",
    marginRight: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  commentModalContent: {
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1A1A2E",
  },
  // Estilos para comentarios
  commentContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8ECF0",
    paddingTop: 12,
  },
  commentItem: {
    backgroundColor: "#F5F7F9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00B272",
    justifyContent: "center",
    alignItems: "center",
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  commentContent: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
    marginLeft: 38,
  },
  commentDate: {
    fontSize: 11,
    color: "#999",
    marginLeft: 38,
  },
  deleteCommentBtn: {
    padding: 4,
  },
  deleteCommentText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
  },
  commentToggleBtn: {
    marginTop: 8,
    paddingVertical: 6,
  },
  commentToggleText: {
    color: "#00B272",
    fontSize: 14,
    fontWeight: "600",
  },
  addCommentBtn: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#F0F7F4",
    borderRadius: 8,
  },
  addCommentText: {
    color: "#00B272",
    fontSize: 14,
    fontWeight: "500",
  },
  commentModalInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  commentModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  feedbackUser: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  noComments: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  starButton: {
    padding: 8,
  },
  starText: {
    fontSize: 32,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
    fontSize: 14,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 8,
  },
});