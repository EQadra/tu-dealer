import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../../../context/AuthContext";
import { useNews } from "../../../../context/NewsContext";

const NewsScreen = () => {
  const { news, fetchNews, createNews, deleteNews } = useNews();
  const { user } = useAuth();
const [url, setUrl] = useState("");
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
  formData.append("url", url);
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
  <Text style={styles.title}>
    {item.titulo}
  </Text>

  <Text style={styles.description}>
    {item.descripcion}
  </Text>

  {item.url && (
    <TouchableOpacity>
      <Text style={styles.link}>
        Ver fuente →
      </Text>
    </TouchableOpacity>
  )}
</View>
  );

  return (
    <View style={styles.container}>
      {/* FORM */}
      <View style={styles.form}>
  <Text style={styles.formTitle}>
    Publicar noticia
  </Text>

  <TextInput
    placeholder="📰 Título de la noticia"
    value={titulo}
    onChangeText={setTitulo}
    style={styles.input}
  />

  <TextInput
    placeholder="✍️ Describe la noticia..."
    value={descripcion}
    onChangeText={setDescripcion}
    multiline
    numberOfLines={4}
    style={[styles.input, styles.textArea]}
  />

  <TextInput
    placeholder="🔗 Enlace de la noticia (https://...)"
    value={url}
    onChangeText={setUrl}
    keyboardType="url"
    autoCapitalize="none"
    autoCorrect={false}
    style={styles.input}
  />

  <TouchableOpacity
    style={styles.button}
    onPress={handleCreate}
  >
    <Text style={styles.buttonText}>
      Publicar noticia
    </Text>
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
formTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#222",
  marginBottom: 15,
},

textArea: {
  minHeight: 100,
  textAlignVertical: "top",
},

buttonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 15,
},
  deleteBtn: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  description: {
  fontSize: 14,
  color: "#555",
  lineHeight: 22,
  marginTop: 8,
  marginBottom: 12,
},

link: {
  color: "#2E7D32",
  fontWeight: "600",
  fontSize: 14,
},


});

export default NewsScreen;