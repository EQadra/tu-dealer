import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useDarkMode } from "../../../../context/app/DarkModeContext";
import { useAssociations } from "../../../../context/AssociationContext";
import { useAuth } from "../../../../context/AuthContext";
import { usePosts } from "../../../../context/PostContext";
import { useProducts } from "../../../../context/ProductContext";

export default function AssociationScreen() {
  /* =========================================================
     DARK MODE
  ========================================================= */

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#111827",
    secondaryText: darkMode ? "#94A3B8" : "#666666",
    border: darkMode ? "#1E293B" : "#E5E7EB",
    input: darkMode ? "#1E293B" : "#FFFFFF",
    modal: darkMode ? "#0F172A" : "#FFFFFF",
    button: "#16A34A",
    placeholder: darkMode ? "#94A3B8" : "#999999",
    imagePicker: darkMode ? "#1E293B" : "#E5E7EB",
    green: "#22c55e",
    red: "#ef4444",
    yellow: "#facc15",
    commentBg: darkMode ? "#1E293B" : "#F1F5F9",
  };

  /* =========================================================
     CONTEXTS
  ========================================================= */

  const { user, me } = useAuth();
  const association = user?.profile;

  const {
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const {
    createAssociation,
    updateAssociation,
  } = useAssociations();

  const {
    posts,
    loading: postsLoading,
    fetchHomePosts,
    createPost,
    deletePost,
    toggleLike,
    addComment,
  } = usePosts();

  /* =========================================================
     STATES
  ========================================================= */

  const [tab, setTab] = useState("perfil");
  const [refreshing, setRefreshing] = useState(false);

  const [form, setForm] = useState<any>({
    posts: [],
    products: [],
  });

  const [loading, setLoading] = useState(false);

  // Estados para productos
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });
  const [editProductState, setEditProductState] = useState<any>(null);
  const [editProductModal, setEditProductModal] = useState(false);

  // Estados para posts
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    category: "",
  });

  // Estado para comentarios en posts
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    if (association) {
      setForm({
        ...association,
        posts: association.posts || [],
        products: association.products || [],
      });
    }
  }, [association]);

  // Cargar posts al montar
  useEffect(() => {
    fetchHomePosts();
  }, []);

  /* =========================================================
     REFRESH
  ========================================================= */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchHomePosts(),
      me(),
    ]);
    setRefreshing(false);
  }, [fetchHomePosts, me]);

  /* =========================================================
     PROFILE UPDATE
  ========================================================= */

  const handleUpdate = async () => {
    try {
      setLoading(true);

      if (form?.id) {
        await updateAssociation(form.id, form);
      } else {
        await createAssociation(form);
      }

      await me();
      Alert.alert("✅ Guardado");
    } catch (error: any) {
      Alert.alert("❌ Error", error?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     IMAGE PICKER
  ========================================================= */

  const pickImage = async (type: 'product' | 'post') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === 'product') {
        setNewProduct({
          ...newProduct,
          image: result.assets[0].uri,
        });
      } else {
        setNewPost({
          ...newPost,
          image: result.assets[0].uri,
        });
      }
    }
  };

  /* =========================================================
     PRODUCT CRUD
  ========================================================= */

  const handleCreateProduct = async () => {
    if (!association) return;

    if (!newProduct.name || !newProduct.price) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description || "");
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock || "0");
      formData.append("association_id", association.id);

      if (newProduct.image) {
        formData.append("image", {
          uri: newProduct.image,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      }

      const created = await createProduct(formData);

      setForm((prev: any) => ({
        ...prev,
        products: [created, ...(prev.products || [])],
      }));

      setShowProductModal(false);
      setNewProduct({ name: "", description: "", price: "", stock: "", image: "" });
      Alert.alert("✅ Producto creado");
    } catch (error: any) {
      console.error(error);
      Alert.alert("❌ Error", error?.message || "Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setForm((prev: any) => ({
        ...prev,
        products: prev.products.filter((p: any) => p.id !== productId),
      }));
      Alert.alert("✅ Producto eliminado");
    } catch {
      Alert.alert("❌ Error eliminando");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      const updated = await updateProduct(editProductState.id, editProductState);
      setForm((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) =>
          p.id === updated.id ? updated : p
        ),
      }));
      setEditProductModal(false);
      setEditProductState(null);
      Alert.alert("✅ Producto actualizado");
    } catch {
      Alert.alert("❌ Error actualizando");
    }
  };

  /* =========================================================
     POSTS CRUD
  ========================================================= */

  const handleCreatePost = async () => {
    if (!association) return;

    if (!newPost.title || !newPost.content) {
      Alert.alert("Error", "Título y contenido son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category || "general",
        image: newPost.image || null,
      };

      await createPost(postData);
      await fetchHomePosts();

      setShowPostModal(false);
      setNewPost({ title: "", content: "", image: "", category: "" });
      Alert.alert("✅ Post creado");
    } catch (error: any) {
      console.error(error);
      Alert.alert("❌ Error", error?.message || "Error al crear post");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePost(postId);
      await fetchHomePosts();
      Alert.alert("✅ Post eliminado");
    } catch {
      Alert.alert("❌ Error eliminando");
    }
  };

  /* =========================================================
     POSTS - COMENTARIOS EN TIEMPO REAL
  ========================================================= */

  const openCommentModal = (post: any) => {
    setSelectedPost(post);
    setComments(post.comments || []);
    setCommentText("");
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost) return;

    try {
      setCommentLoading(true);
      
      // Agregar comentario temporalmente para UI inmediata
      const tempComment = {
        id: Date.now(),
        content: commentText.trim(),
        user: {
          name: "Tú",
        },
        created_at: new Date().toISOString(),
        _temp: true,
      };
      
      // Actualizar UI inmediatamente
      setComments((prev) => [tempComment, ...prev]);
      setCommentText("");
      
      // Llamar a la API
      await addComment(selectedPost.id, commentText.trim());
      
      // Refrescar posts para obtener el comentario real
      await fetchHomePosts();
      
      // Actualizar el post seleccionado
      const updatedPost = posts.find((p: any) => p.id === selectedPost.id);
      if (updatedPost) {
        setSelectedPost(updatedPost);
        setComments(updatedPost.comments || []);
      }
      
      Alert.alert("✅ Comentario agregado");
    } catch (error) {
      Alert.alert("❌ Error al comentar");
      // Revertir el comentario temporal
      setComments((prev) => prev.filter((c) => !c._temp));
    } finally {
      setCommentLoading(false);
    }
  };

  /* =========================================================
     RENDER ITEMS
  ========================================================= */

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Image 
        source={{ 
          uri: item.image_url || item.image || "https://via.placeholder.com/400x200/22c55e/ffffff?text=Sin+imagen" 
        }} 
        style={styles.productImage}
        onError={(e) => {
          console.log('Error cargando imagen:', item.image_url || item.image);
        }}
      />
      <Text style={[styles.postTitle, { color: colors.text }]}>
        {item.name}
      </Text>
      <Text style={{ color: colors.secondaryText, marginTop: 4 }}>
        {item.description}
      </Text>
      <Text style={{ color: colors.green, marginTop: 6, fontWeight: "700" }}>
        S/. {item.price}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => {
          setEditProductState(item);
          setEditProductModal(true);
        }}>
          <Ionicons name="create-outline" size={22} color={colors.yellow} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert("Eliminar", "¿Seguro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => handleDeleteProduct(item.id) },
          ]);
        }}>
          <Ionicons name="trash-outline" size={22} color={colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.image && (
        <Image
          source={{ 
            uri: item.image || "https://via.placeholder.com/400x200/22c55e/ffffff?text=Sin+imagen" 
          }}
          style={styles.productImage}
          onError={() => console.log('Error al cargar imagen')}
        />
      )}
      <Text style={[styles.postTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      <Text style={{ color: colors.secondaryText, marginTop: 4 }}>
        {item.content}
      </Text>
      <Text style={{ color: colors.secondaryText, marginTop: 4, fontSize: 12 }}>
        📅 {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <View style={styles.postActions}>
        <TouchableOpacity 
          onPress={() => toggleLike(item.id)}
          style={styles.postAction}
        >
          <Ionicons
            name={item.liked ? "heart" : "heart-outline"}
            size={22}
            color={item.liked ? colors.red : colors.secondaryText}
          />
          <Text style={{ color: colors.secondaryText, fontSize: 12, marginLeft: 4 }}>
            {item.likes_count || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => openCommentModal(item)}
          style={styles.postAction}
        >
          <Ionicons name="chatbubble-outline" size={22} color={colors.secondaryText} />
          <Text style={{ color: colors.secondaryText, fontSize: 12, marginLeft: 4 }}>
            {item.comments?.length || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert("Eliminar", "¿Seguro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Eliminar", style: "destructive", onPress: () => handleDeletePost(item.id) },
          ]);
        }}>
          <Ionicons name="trash-outline" size={22} color={colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCommentItem = ({ item }: { item: any }) => (
    <View style={[
      styles.commentItem, 
      { 
        backgroundColor: item._temp ? colors.green + '20' : colors.commentBg,
        borderColor: colors.border,
        borderWidth: 1,
      }
    ]}>
      <View style={styles.commentHeader}>
        <Text style={[styles.commentUser, { color: colors.text }]}>
          {item.user?.name || "Usuario"}
        </Text>
        <Text style={[styles.commentDate, { color: colors.secondaryText }]}>
          {item._temp ? "⏳ Enviando..." : new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={{ color: colors.text }}>
        {item.content}
      </Text>
    </View>
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (!association) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{ 
              uri: form.image || "https://via.placeholder.com/100/22c55e/ffffff?text=Perfil" 
            }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: colors.text }]}>
            {form.name || "Sin nombre"}
          </Text>
          <Text style={{ color: colors.secondaryText }}>
            {form.city || "Sin ciudad"}
          </Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["perfil", "productos", "posts"].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}>
              <Text
                style={
                  tab === t
                    ? [styles.activeTab, { color: colors.green }]
                    : [styles.tab, { color: colors.secondaryText }]
                }
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PERFIL */}
        {tab === "perfil" && (
          <View>
            {["name", "description", "city", "address", "phone", "website"].map((field) => (
              <TextInput
                key={field}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor={colors.placeholder}
                value={form[field] || ""}
                onChangeText={(t) => setForm({ ...form, [field]: t })}
              />
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveText}>
                {loading ? "Guardando..." : "💾 Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PRODUCTOS */}
        {tab === "productos" && (
          <View>
            {form.products?.length === 0 && (
              <Text style={{ color: colors.secondaryText, textAlign: "center", marginTop: 20 }}>
                No hay productos. ¡Crea el primero!
              </Text>
            )}
            <FlatList
              data={form.products || []}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
            <TouchableOpacity
              style={[styles.saveBtn, { marginTop: 10 }]}
              onPress={() => setShowProductModal(true)}
            >
              <Text style={styles.saveText}>➕ Agregar Producto</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* POSTS */}
        {tab === "posts" && (
          <View>
            {postsLoading ? (
              <ActivityIndicator size="large" color={colors.green} />
            ) : posts.length === 0 ? (
              <Text style={{ color: colors.secondaryText, textAlign: "center", marginTop: 20 }}>
                No hay posts. ¡Crea el primero!
              </Text>
            ) : (
              <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
            <TouchableOpacity
              style={[styles.saveBtn, { marginTop: 10 }]}
              onPress={() => setShowPostModal(true)}
            >
              <Text style={styles.saveText}>📝 Crear Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* =========================================================
          MODAL CREAR PRODUCTO
      ========================================================= */}
      <Modal visible={showProductModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContainer, { backgroundColor: colors.modal }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Nuevo Producto
            </Text>

            <TextInput
              placeholder="Nombre *"
              placeholderTextColor={colors.placeholder}
              value={newProduct.name}
              onChangeText={(t) => setNewProduct({ ...newProduct, name: t })}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <TextInput
              placeholder="Descripción"
              placeholderTextColor={colors.placeholder}
              value={newProduct.description}
              onChangeText={(t) => setNewProduct({ ...newProduct, description: t })}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <TextInput
              placeholder="Precio *"
              placeholderTextColor={colors.placeholder}
              value={newProduct.price}
              onChangeText={(t) => setNewProduct({ ...newProduct, price: t })}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <TextInput
              placeholder="Stock"
              placeholderTextColor={colors.placeholder}
              value={newProduct.stock}
              onChangeText={(t) => setNewProduct({ ...newProduct, stock: t })}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <TouchableOpacity onPress={() => pickImage('product')} style={[styles.saveBtn, { backgroundColor: colors.imagePicker }]}>
              <Text style={[styles.saveText, { color: colors.text }]}>🖼️ Seleccionar Imagen</Text>
            </TouchableOpacity>

            {newProduct.image && (
              <Image source={{ uri: newProduct.image }} style={styles.previewImage} />
            )}

            <TouchableOpacity onPress={handleCreateProduct} style={styles.saveBtn}>
              <Text style={styles.saveText}>✅ Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowProductModal(false)} style={[styles.saveBtn, { backgroundColor: colors.red }]}>
              <Text style={styles.saveText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* =========================================================
          MODAL CREAR POST
      ========================================================= */}
      <Modal visible={showPostModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContainer, { backgroundColor: colors.modal }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Nuevo Post
            </Text>

            <TextInput
              placeholder="Título *"
              placeholderTextColor={colors.placeholder}
              value={newPost.title}
              onChangeText={(t) => setNewPost({ ...newPost, title: t })}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <TextInput
              placeholder="Contenido *"
              placeholderTextColor={colors.placeholder}
              value={newPost.content}
              onChangeText={(t) => setNewPost({ ...newPost, content: t })}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text, height: 100 }]}
            />

            <TextInput
              placeholder="Categoría (opcional)"
              placeholderTextColor={colors.placeholder}
              value={newPost.category}
              onChangeText={(t) => setNewPost({ ...newPost, category: t })}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <TouchableOpacity onPress={() => pickImage('post')} style={[styles.saveBtn, { backgroundColor: colors.imagePicker }]}>
              <Text style={[styles.saveText, { color: colors.text }]}>🖼️ Seleccionar Imagen</Text>
            </TouchableOpacity>

            {newPost.image && (
              <Image source={{ uri: newPost.image }} style={styles.previewImage} />
            )}

            <TouchableOpacity onPress={handleCreatePost} style={styles.saveBtn}>
              <Text style={styles.saveText}>📝 Crear Post</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPostModal(false)} style={[styles.saveBtn, { backgroundColor: colors.red }]}>
              <Text style={styles.saveText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* =========================================================
          MODAL EDITAR PRODUCTO
      ========================================================= */}
      <Modal visible={editProductModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContainer, { backgroundColor: colors.modal }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Editar Producto
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={editProductState?.name}
              onChangeText={(t) => setEditProductState({ ...editProductState, name: t })}
              placeholder="Nombre"
              placeholderTextColor={colors.placeholder}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={editProductState?.description}
              onChangeText={(t) => setEditProductState({ ...editProductState, description: t })}
              placeholder="Descripción"
              placeholderTextColor={colors.placeholder}
            />

            <TouchableOpacity onPress={handleUpdateProduct} style={styles.saveBtn}>
              <Text style={styles.saveText}>💾 Guardar cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setEditProductModal(false)} style={[styles.saveBtn, { backgroundColor: colors.red }]}>
              <Text style={styles.saveText}>❌ Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* =========================================================
          MODAL COMENTARIOS - CON ACTUALIZACIÓN EN TIEMPO REAL
      ========================================================= */}
      <Modal 
        visible={commentModalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={() => {
          setCommentModalVisible(false);
          setCommentText("");
          setSelectedPost(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <View style={[styles.modalContainer, { backgroundColor: colors.modal, maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  💬 Comentarios
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setCommentModalVisible(false);
                    setCommentText("");
                    setSelectedPost(null);
                  }}
                >
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.postTitle, { color: colors.text, marginBottom: 10, paddingHorizontal: 4 }]}>
                {selectedPost?.title}
              </Text>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCommentItem}
                ListEmptyComponent={
                  <Text style={{ color: colors.secondaryText, textAlign: "center", marginTop: 20, paddingVertical: 20 }}>
                    No hay comentarios. ¡Sé el primero!
                  </Text>
                }
                style={{ maxHeight: 350 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 10 }}
              />

              <View style={styles.commentInputRow}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.input, 
                      borderColor: colors.border, 
                      color: colors.text,
                      flex: 1,
                      margin: 0,
                      marginRight: 8,
                      maxHeight: 80,
                    }
                  ]}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor={colors.placeholder}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  editable={!commentLoading}
                />
                <TouchableOpacity 
                  onPress={handleAddComment}
                  style={[
                    styles.sendButton, 
                    { 
                      backgroundColor: commentText.trim() ? colors.green : colors.secondaryText,
                      opacity: commentText.trim() ? 1 : 0.5,
                    }
                  ]}
                  disabled={!commentText.trim() || commentLoading}
                >
                  {commentLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => {
                  setCommentModalVisible(false);
                  setCommentText("");
                  setSelectedPost(null);
                  setComments([]);
                }} 
                style={[styles.saveBtn, { backgroundColor: colors.red, marginTop: 8 }]}
              >
                <Text style={styles.saveText}>❌ Cerrar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  tab: {
    fontWeight: "500",
    fontSize: 14,
  },

  activeTab: {
    fontWeight: "bold",
    fontSize: 14,
  },

  input: {
    margin: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
  },

  saveBtn: {
    backgroundColor: "#16A34A",
    margin: 10,
    padding: 14,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },

  card: {
    marginHorizontal: 10,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  productImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },

  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },

  postTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
  },

  postAction: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "95%",
    maxHeight: "90%",
    borderRadius: 20,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  commentItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  commentUser: {
    fontWeight: "bold",
    fontSize: 14,
  },

  commentDate: {
    fontSize: 10,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },

  sendButton: {
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
    minHeight: 48,
  },
});