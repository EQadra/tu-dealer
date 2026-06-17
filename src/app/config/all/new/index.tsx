import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useNews } from "../../../../context/NewsContext";

export default function NewsScreen() {
  const {
    news,
    fetchMyLatestNews,
    createNews,
    updateNews,
    deleteNews,
  } = useNews();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🔥 LOAD DATA
  useEffect(() => {
    fetchMyLatestNews();
  }, []);

  // 🔥 OPEN EDIT
  const openEditModal = (item: any) => {
    setEditingId(item.id);
    setTitulo(item.titulo || "");
    setDescripcion(item.descripcion || "");
    setUrl(item.url || "");
    setModalVisible(true);
  };

  // 🔥 RESET FORM
  const resetForm = () => {
    setTitulo("");
    setDescripcion("");
    setUrl("");
    setEditingId(null);
  };

  // 🔥 SAVE (CREATE / UPDATE)
  const handleSave = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert("Error", "Título y descripción obligatorios");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descripcion", descripcion);

      if (url.trim()) {
        formData.append("url", url);
      }

      if (editingId) {
        await updateNews(editingId, formData);
        Alert.alert("OK", "Noticia actualizada");
      } else {
        await createNews(formData);
        Alert.alert("OK", "Noticia creada");
      }

      resetForm();
      setModalVisible(false);

      // 🔥 REFRESH DATA
      await fetchMyLatestNews();

    } catch (e) {
      console.log("SAVE ERROR:", e);
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  // 🔥 DELETE
  const handleDelete = (id: number) => {
    Alert.alert("Eliminar", "¿Seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNews(id);
            await fetchMyLatestNews();
          } catch (e) {
            console.log("DELETE ERROR:", e);
          }
        },
      },
    ]);
  };

  // 🔥 RENDER ITEM (FIX NULL SAFETY)
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item?.titulo}</Text>

      <Text style={styles.description}>
        {item?.descripcion}
      </Text>

      {!!item?.url && (
        <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
          <Text style={styles.link}>Ver fuente</Text>
        </TouchableOpacity>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Text style={styles.edit}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.delete}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.addText}>+ Nueva noticia</Text>
      </TouchableOpacity>

      {/* 🔥 FIX: ensure list renders properly */}
      <FlatList
        data={news || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>
              {editingId ? "Editar noticia" : "Nueva noticia"}
            </Text>

            <TextInput
              placeholder="Título"
              value={titulo}
              onChangeText={setTitulo}
              style={styles.input}
            />

            <TextInput
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              style={[styles.input, { height: 100 }]}
            />

            <TextInput
              placeholder="URL"
              value={url}
              onChangeText={setUrl}
              style={styles.input}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>
                {editingId ? "Actualizar" : "Crear"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>
                Cancelar
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
  },

  title: { fontSize: 16, fontWeight: "700" },

  description: { marginTop: 5, color: "#444" },

  link: { color: "green", marginTop: 8 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  edit: { color: "#2563EB", fontWeight: "600" },
  delete: { color: "#DC2626", fontWeight: "600" },

  addButton: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addText: { color: "#fff", textAlign: "center", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 10,
  },

  saveText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});