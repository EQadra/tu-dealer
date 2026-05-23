import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useNews } from "../../../../context/NewsContext";
import { useAuth } from "../../../../context/AuthContext";

const NewsScreen = () => {
  const { news, fetchNews, createNews, deleteNews } = useNews();
  const { user } = useAuth();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  /* ======================
     ➕ CREAR
  ====================== */
  const handleCreate = async () => {
    if (!titulo || !descripcion) return;

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);

    try {
      await createNews(formData);

      setTitulo("");
      setDescripcion("");

      Alert.alert("✅ Noticia creada");
    } catch {
      Alert.alert("❌ Error", "No se pudo crear");
    }
  };

  /* ======================
     🗑 DELETE
  ====================== */
  const handleDelete = (id: number) => {
    Alert.alert(
      "Eliminar",
      "¿Seguro que deseas eliminar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            await deleteNews(id);
          },
        },
      ]
    );
  };

  /* ======================
     🖼 ITEM
  ====================== */
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.user}>{item.user?.name}</Text>

      {item.image && (
        <Image
          source={{ uri: `http://TU_BACKEND/storage/${item.image}` }}
          style={styles.image}
        />
      )}

      <Text style={styles.title}>{item.titulo}</Text>
      <Text>{item.descripcion}</Text>

      {/* SOLO dueño */}
      {user?.id === item.user?.id && (
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
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
          value={titulo}
          onChangeText={setTitulo}
          style={styles.input}
        />

        <TextInput
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={{ color: "#fff" }}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <FlatList
        data={news}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  form: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    elevation: 4,
  },

  user: {
    fontWeight: "bold",
    marginBottom: 5,
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
    marginBottom: 10,
  },

  deleteBtn: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});

export default NewsScreen;