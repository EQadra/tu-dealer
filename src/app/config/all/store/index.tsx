import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  useColorScheme,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../../../context/AuthContext";
import { useProducts } from "../../../../context/ProductContext";
import api from "../../../../utils/axios";

export default function ShopScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const styles = getStyles(isDark);

  const { user, me, loading: authLoading } = useAuth();
  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const [shop, setShop] = useState<any>(user?.profile);
  const [tab, setTab] = useState<"products" | "feedbacks" | "news">("products");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    schedule: "",
  });

  const [modalVisible, setModalVisible] = useState(false);

  // CREATE PRODUCT
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  const [image, setImage] = useState<string | null>(null);

  // EDIT PRODUCT
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || "",
        description: shop.description || "",
        address: shop.address || "",
        city: shop.city || "",
        phone: shop.phone || "",
        schedule: shop.schedule || "",
      });
    }
  }, [shop]);

  /* ================= IMAGE PICKER ================= */
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Permite acceso a galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* ================= UPDATE SHOP ================= */
  const handleSubmit = async () => {
    if (!shop) return;

    try {
      setLoading(true);
      await api.put(`/shops/${shop.id}`, form);
      await me();
      Alert.alert("Éxito", "Tienda actualizada");
    } catch {
      Alert.alert("Error", "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CREATE PRODUCT ================= */
  const handleCreateProduct = async () => {
    if (!shop) return;

    if (
      !productForm.name ||
      !productForm.description ||
      !productForm.price ||
      !productForm.stock
    ) {
      return Alert.alert("Error", "Completa todos los campos");
    }

    if (!image) {
      return Alert.alert("Error", "Selecciona una imagen");
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", String(productForm.price));
      formData.append("stock", String(productForm.stock));
      formData.append("store_id", String(shop.id));

      formData.append("image", {
        uri: image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const newProduct = await createProduct(formData);

      setShop((prev: any) => ({
        ...prev,
        products: [newProduct, ...(prev.products || [])],
      }));

      setModalVisible(false);
      setImage(null);

      setProductForm({
        name: "",
        description: "",
        price: "",
        stock: "",
      });

      await me();

      Alert.alert("✅ Producto creado");
    } catch {
      Alert.alert("❌ Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OPEN EDIT ================= */
  const openEditModal = (product: any) => {
    setEditingProduct(product);

    setEditForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
    });

    setEditModalVisible(true);
  };

  /* ================= UPDATE PRODUCT ================= */
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      setLoading(true);

      const updated = await updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        stock: Number(editForm.stock),
      });

      setShop((prev: any) => ({
        ...prev,
        products: prev.products.map((p: any) =>
          p.id === updated.id ? updated : p
        ),
      }));

      setEditModalVisible(false);
      setEditingProduct(null);

      Alert.alert("✅ Producto actualizado");
    } catch {
      Alert.alert("❌ Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE PRODUCT ================= */
  const handleDeleteProduct = (id: number) => {
    Alert.alert("Eliminar", "¿Seguro que quieres eliminar?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);

            setShop((prev: any) => ({
              ...prev,
              products: prev.products.filter((p: any) => p.id !== id),
            }));

            Alert.alert("🗑️ Eliminado");
          } catch {
            Alert.alert("Error al eliminar");
          }
        },
      },
    ]);
  };

  /* ================= RENDER ================= */
  const renderProducts = () => (
    <>
      {shop.products?.map((p: any) => (
        <View key={p.id} style={styles.card}>
          <Image source={{ uri: p.image }} style={styles.image} />

          <Text style={styles.title}>{p.name}</Text>
          <Text style={styles.price}>${p.price}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => openEditModal(p)}
              style={{ backgroundColor: "#3b82f6", padding: 8, borderRadius: 8 }}
            >
              <Text style={{ color: "#fff" }}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDeleteProduct(p.id)}
              style={{ backgroundColor: "#ef4444", padding: 8, borderRadius: 8 }}
            >
              <Text style={{ color: "#fff" }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </>
  );

  const renderFeedbacks = () => (
    <>
      {shop.feedbacks?.map((f: any) => (
        <View key={f.id} style={styles.card}>
          <Text style={styles.title}>{f.user?.name}</Text>
          <Text style={styles.text}>{f.comment}</Text>
          <Text style={styles.rating}>⭐ {f.rating}</Text>
        </View>
      ))}
    </>
  );

  const renderNews = () => (
    <>
      {shop.news?.map((n: any) => (
        <View key={n.id} style={styles.card}>
          {n.image && <Image source={{ uri: n.image }} style={styles.image} />}
          <Text style={styles.title}>{n.title}</Text>
          <Text style={styles.text}>{n.content}</Text>
        </View>
      ))}
    </>
  );

  /* ================= UI ================= */
  if (authLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No tienes tienda</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.shopName}>{shop.name}</Text>
        <Text style={styles.city}>{shop.city}</Text>

        {/* EDIT SHOP */}
        <Text style={styles.section}>Editar tienda</Text>

        {Object.keys(form).map((key) => (
          <TextInput
            key={key}
            style={styles.input}
            value={form[key as keyof typeof form]}
            onChangeText={(text) =>
              setForm((p) => ({ ...p, [key]: text }))
            }
          />
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
          <Text style={styles.saveBtnText}>
            {loading ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>

        {/* TABS */}
        <View style={styles.tabs}>
          <Text onPress={() => setTab("products")} style={styles.tab}>
            Productos
          </Text>
          <Text onPress={() => setTab("feedbacks")} style={styles.tab}>
            Opiniones
          </Text>
          <Text onPress={() => setTab("news")} style={styles.tab}>
            Noticias
          </Text>
        </View>

        {tab === "products" && renderProducts()}
        {tab === "feedbacks" && renderFeedbacks()}
        {tab === "news" && renderNews()}
      </ScrollView>

      {/* FAB */}
      {tab === "products" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}

      {/* CREATE MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.section}>Nuevo Producto</Text>

            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              <Text style={styles.imagePickerText}>
                {image ? "Cambiar imagen" : "Seleccionar"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={productForm.name}
              onChangeText={(t) =>
                setProductForm((p) => ({ ...p, name: t }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Precio"
              value={productForm.price}
              keyboardType="numeric"
              onChangeText={(t) =>
                setProductForm((p) => ({ ...p, price: t }))
              }
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateProduct}>
              <Text style={styles.saveBtnText}>Crear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.section}>Editar Producto</Text>

            <TextInput
              style={styles.input}
              value={editForm.name}
              onChangeText={(t) =>
                setEditForm((p) => ({ ...p, name: t }))
              }
            />

            <TextInput
              style={styles.input}
              value={editForm.price}
              onChangeText={(t) =>
                setEditForm((p) => ({ ...p, price: t }))
              }
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProduct}>
              <Text style={styles.saveBtnText}>Actualizar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ================= STYLES ================= */

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0f172a" : "#F9FAFB",
      padding: 16,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDark ? "#0f172a" : "#F9FAFB",
    },

    emptyText: {
      color: isDark ? "#fff" : "#111",
      fontSize: 16,
    },

    shopName: {
      color: isDark ? "#22c55e" : "#16A34A",
      fontSize: 22,
      fontWeight: "bold",
    },

    city: {
      color: isDark ? "#94a3b8" : "#666",
      marginBottom: 10,
    },

    section: {
      color: isDark ? "#fff" : "#111827",
      marginTop: 20,
      marginBottom: 8,
      fontWeight: "bold",
      fontSize: 16,
    },

    input: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      color: isDark ? "#fff" : "#111",
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#E5E7EB",
    },

    saveBtn: {
      backgroundColor: isDark ? "#22c55e" : "#16A34A",
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 10,
    },

    saveBtnText: {
      color: "#fff",
      fontWeight: "700",
    },

    tabs: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginVertical: 20,
    },

    tab: {
      color: isDark ? "#94a3b8" : "#666",
      fontSize: 15,
    },

    active: {
      color: isDark ? "#22c55e" : "#16A34A",
      fontWeight: "bold",
    },

    card: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      padding: 14,
      borderRadius: 14,
      marginBottom: 12,

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    title: {
      color: isDark ? "#fff" : "#111827",
      fontWeight: "bold",
      fontSize: 16,
      marginBottom: 6,
    },

    text: {
      color: isDark ? "#cbd5e1" : "#555",
      lineHeight: 20,
    },

    price: {
      color: isDark ? "#22c55e" : "#16A34A",
      marginTop: 6,
      fontWeight: "bold",
    },

    rating: {
      color: "#facc15",
      marginTop: 6,
      fontWeight: "600",
    },

    image: {
      width: "100%",
      height: 140,
      borderRadius: 10,
      marginBottom: 10,
    },

    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: isDark ? "#22c55e" : "#16A34A",
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },

    fabText: {
      color: "#fff",
      fontSize: 30,
      fontWeight: "300",
    },

    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      padding: 20,
    },

    modalContent: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      borderRadius: 16,
      padding: 20,
    },

    imagePicker: {
      backgroundColor: isDark ? "#334155" : "#E5E7EB",
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 12,
    },

    imagePickerText: {
      color: isDark ? "#fff" : "#111",
      fontWeight: "600",
    },

    preview: {
      width: "100%",
      height: 180,
      borderRadius: 12,
      marginBottom: 12,
    },

    cancelBtn: {
      backgroundColor: "#ef4444",
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 12,
    },

    cancelText: {
      color: "#fff",
      fontWeight: "700",
    },
  });