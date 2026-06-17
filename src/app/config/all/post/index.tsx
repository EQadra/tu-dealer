import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../../../context/AuthContext";
import { usePosts } from "../../../../context/PostContext";

export default function PostsScreen() {
  const {
    posts,
    fetchMyPosts,
    createPost,
    deletePost,
  } = usePosts();

  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    await fetchMyPosts();
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

    try {
      await createPost({
        title,
        content,
        image,
      });

      setTitle("");
      setContent("");
      setImage(null);

      await loadPosts();
    } catch (error) {
      console.log("Error creando post:", error);
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

  const renderPost = ({ item }: any) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {item.user?.name}
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

      <Text style={styles.postTitle}>
        {item.title}
      </Text>

      <Text style={styles.postContent}>
        {item.content}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Text style={styles.deleteText}>
          Eliminar publicación
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* CREAR POST */}
      <View style={styles.createCard}>
        <Text style={styles.screenTitle}>
          Mis publicaciones
        </Text>

        <TextInput
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="¿Qué deseas publicar?"
          multiline
          value={content}
          onChangeText={setContent}
          style={[styles.input, styles.contentInput]}
        />

        <TouchableOpacity
          style={styles.imagePicker}
          onPress={pickImage}
        >
          <Text style={styles.imagePickerText}>
            📷 Seleccionar imagen
          </Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
          />
        )}

        <TouchableOpacity
          style={styles.publishButton}
          onPress={handleCreate}
        >
          <Text style={styles.publishText}>
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      />

      {/* MODAL ELIMINAR */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              ¿Eliminar publicación?
            </Text>

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
                <Text style={{ color: "#fff" }}>
                  Eliminar
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
    backgroundColor: "#F4F6F8",
  },

  createCard: {
    backgroundColor: "#FFF",
    margin: 15,
    padding: 15,
    borderRadius: 16,
    elevation: 2,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  contentInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  imagePicker: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#16A34A",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#F0FDF4",
  },

  imagePickerText: {
    color: "#16A34A",
    fontWeight: "600",
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },

  publishButton: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  publishText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  postCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 16,
    padding: 15,
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

  deleteButton: {
    alignSelf: "flex-end",
    marginTop: 12,
  },

  deleteText: {
    color: "#DC2626",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },

  modalText: {
    color: "#6B7280",
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  cancelBtn: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  confirmBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
});