import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import { usePosts } from "../../../../context/PostContext";
import { useAuth } from "../../../../context/AuthContext";

const PostsScreen = () => {
  const { posts, fetchPosts, createPost, deletePost } = usePosts();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ======================
     ➕ CREAR POST
  ====================== */
  const handleCreate = async () => {
    if (!title || !content) return;

    try {
      await createPost({ title, content, image });

      setTitle("");
      setContent("");
      setImage("");
    } catch (error) {
      console.log("Error creando post", error);
    }
  };

  /* ======================
     🗑 ELIMINAR POST
  ====================== */
  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    await deletePost(selectedId);
    setShowModal(false);
    setSelectedId(null);
  };

  /* ======================
     🖼 RENDER ITEM
  ====================== */
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.user}>{item.user?.name}</Text>

      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      )}

      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.content}</Text>

      {user?.id === item.user_id && (
        <TouchableOpacity
          onPress={() => confirmDelete(item.id)}
          style={styles.deleteBtn}
        >
          <Text style={{ color: "#fff" }}>Eliminar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* FORM */}
      <View style={styles.form}>
        <TextInput
          placeholder="Título"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Contenido"
          value={content}
          onChangeText={setContent}
          style={styles.input}
        />

        <TextInput
          placeholder="URL imagen (opcional)"
          value={image}
          onChangeText={setImage}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={{ color: "#fff" }}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      {/* MODAL TIPO NUBE */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¿Eliminar post?</Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer
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
};



export default PostsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },

  /* FORM */
  form: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },

  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  /* CARD POST */
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  user: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginVertical: 8,
  },

  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#e53935",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },

  confirmBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e53935",
  },
});