import React, { useEffect, useState } from "react";

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

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useAssociations } from "../../../../context/AssociationContext";
import { useAuth } from "../../../../context/AuthContext";
import { useProducts } from "../../../../context/ProductContext";
import { useDarkMode } from "../../../../context/app/DarkModeContext";

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
  };

  /* =========================================================
     CONTEXTS
  ========================================================= */

  const { user, me } = useAuth();
  const association = user?.profile;

  const { createProduct, updateProduct, deleteProduct } = useProducts();

  const { createAssociation, updateAssociation } = useAssociations();

  /* =========================================================
     STATES
  ========================================================= */

  const [tab, setTab] = useState("perfil");
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
  });

  /* EDIT PRODUCT */
  const [editProductState, setEditProductState] = useState<any>(null);
  const [editModal, setEditModal] = useState(false);

  /* =========================================================
     EFFECT
  ========================================================= */

  useEffect(() => {
    if (association) setForm(association);
  }, [association]);

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
    } catch {
      Alert.alert("❌ Error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     IMAGE PICKER
  ========================================================= */

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

    if (!result.canceled) {
      setNewProduct({
        ...newProduct,
        image: result.assets[0].uri,
      });
    }
  };

  /* =========================================================
     CREATE PRODUCT
  ========================================================= */

  const handleCreateProduct = async () => {
    if (!association) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);
      formData.append("store_id", association.id);

      formData.append("image", {
        uri: newProduct.image,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      const created = await createProduct(formData);

      setForm((prev: any) => ({
        ...prev,
        products: [created, ...(prev.products || [])],
      }));

      setShowModal(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
      });

      Alert.alert("✅ Producto creado");
    } catch {
      Alert.alert("❌ Error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!association) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{
              uri: form.image || "https://picsum.photos/200",
            }}
            style={styles.avatar}
          />

          <Text style={[styles.name, { color: colors.text }]}>
            {form.name}
          </Text>

          <Text style={{ color: colors.secondaryText }}>
            {form.city}
          </Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["perfil", "productos"].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}>
              <Text
                style={
                  tab === t
                    ? [styles.activeTab, { color: "#22c55e" }]
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
            {["name", "description", "city", "address", "phone", "website"].map(
              (field) => (
                <TextInput
                  key={field}
                  style={[styles.input, { backgroundColor: colors.input }]}
                  placeholder={field}
                  value={form[field]}
                  onChangeText={(t) =>
                    setForm({ ...form, [field]: t })
                  }
                />
              )
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveText}>
                {loading ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PRODUCTOS */}
        {tab === "productos" && (
          <View>
            {form.products?.map((p: any) => (
              <View
                key={p.id}
                style={[styles.card, { backgroundColor: colors.card }]}
              >
                <Image source={{ uri: p.image }} style={styles.productImage} />

                <Text style={[styles.postTitle, { color: colors.text }]}>
                  {p.name}
                </Text>

                <Text style={{ color: colors.secondaryText }}>
                  {p.description}
                </Text>

                {/* ACTIONS */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditProductState(p);
                      setEditModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={22} color="#facc15" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert("Eliminar", "¿Seguro?", [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => deleteProduct(p.id),
                        },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {tab === "productos" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* CREATE MODAL */}
      <Modal visible={showModal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Nuevo Producto</Text>

          <TextInput
            placeholder="Nombre"
            value={newProduct.name}
            onChangeText={(t) =>
              setNewProduct({ ...newProduct, name: t })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="Descripción"
            value={newProduct.description}
            onChangeText={(t) =>
              setNewProduct({ ...newProduct, description: t })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="Precio"
            value={newProduct.price}
            onChangeText={(t) =>
              setNewProduct({ ...newProduct, price: t })
            }
            style={styles.input}
          />

          <TextInput
            placeholder="Stock"
            value={newProduct.stock}
            onChangeText={(t) =>
              setNewProduct({ ...newProduct, stock: t })
            }
            style={styles.input}
          />

          <TouchableOpacity onPress={pickImage} style={styles.saveBtn}>
            <Text style={styles.saveText}>Imagen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateProduct}
            style={styles.saveBtn}
          >
            <Text style={styles.saveText}>Guardar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Editar Producto</Text>

          <TextInput
            style={styles.input}
            value={editProductState?.name}
            onChangeText={(t) =>
              setEditProductState({ ...editProductState, name: t })
            }
          />

          <TextInput
            style={styles.input}
            value={editProductState?.description}
            onChangeText={(t) =>
              setEditProductState({ ...editProductState, description: t })
            }
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={async () => {
              await updateProduct(
                editProductState.id,
                editProductState
              );

              setEditModal(false);
              setEditProductState(null);
            }}
          >
            <Text style={styles.saveText}>Guardar cambios</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 18, fontWeight: "bold" },
  tabs: { flexDirection: "row", justifyContent: "space-around" },
  tab: { fontWeight: "500" },
  activeTab: { fontWeight: "bold" },
  input: { margin: 10, padding: 12, borderWidth: 1, borderRadius: 10 },
  saveBtn: { backgroundColor: "#16A34A", margin: 10, padding: 12 },
  saveText: { color: "#fff", textAlign: "center" },
  card: { margin: 10, padding: 12, borderRadius: 10 },
  productImage: { width: "100%", height: 150, borderRadius: 10 },
  postTitle: { fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#16A34A",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: { padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});