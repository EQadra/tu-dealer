import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

export default function User() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    status: "active",
  });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Campos requeridos", "Nombre, correo y contraseña son obligatorios.");
      return;
    }

    const dataToSend = {
      ...form,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Usuario enviado:", dataToSend);
    Alert.alert("Éxito", "Usuario creado correctamente.");

    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "user",
      status: "active",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Usuario</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(text) => setForm({ ...form, phone: text })}
      />

      <Text style={styles.label}>Rol:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.role}
          onValueChange={(itemValue) => setForm({ ...form, role: itemValue })}
        >
          <Picker.Item label="Usuario" value="user" />
          <Picker.Item label="Doctor" value="doctor" />
          <Picker.Item label="Abogado" value="lawyer" />
          <Picker.Item label="Vendedor" value="vendor" />
          <Picker.Item label="Administrador" value="admin" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Guardar Usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backLink}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f7f9fc",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#555",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  backLink: {
    textAlign: "center",
    color: "#0066cc",
    marginTop: 10,
  },
});
