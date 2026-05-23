import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const roles = [
  { label: "Usuario", value: "usuario", icon: require("../../../../assets/7.png") },
  { label: "Abogado", value: "abogado", icon: require("../../../../assets/8.png") },
  { label: "Doctor", value: "doctor", icon: require("../../../../assets/6.png") },
  { label: "Asociación", value: "asociacion", icon: require("../../../../assets/10.png") },
  { label: "Tienda", value: "tienda", icon: require("../../../../assets/9.png") },
];

const SignupScreen = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [selectedForm, setSelectedForm] = useState("usuario");
  const [showModal, setShowModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    usuario: { name: "", email: "", password: "", repeatPassword: "", dni: "" },
    abogado: { name: "", email: "", password: "", repeatPassword: "", licencia: "" },
    doctor: { name: "", email: "", password: "", repeatPassword: "", codigoDoctor: "" },
    asociacion: { name: "", email: "", password: "", repeatPassword: "", ruc: "" },
    tienda: { name: "", email: "", password: "", repeatPassword: "", ruc: "" },
  });

  const selectedRole = roles.find((role) => role.value === selectedForm);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [selectedForm]: { ...prev[selectedForm], [field]: value },
    }));
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleSignup = async () => {
    const data = formData[selectedForm];

    if (!data.email || !data.password || !data.repeatPassword) {
      Alert.alert(
        "Campos incompletos",
        "Por favor completa todos los campos."
      );
      return;
    }

    if (!validatePassword(data.password)) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener mínimo 8 caracteres."
      );
      return;
    }

    if (data.password !== data.repeatPassword) {
      Alert.alert(
        "Contraseñas diferentes",
        "Las contraseñas no coinciden."
      );
      return;
    }

    try {
      let payload: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.repeatPassword,
      };

      switch (selectedForm) {
        case "usuario":
          payload.dni = data.dni;
          break;

        case "abogado":
          payload.licencia = data.licencia;
          break;

        case "doctor":
          const nameParts = data.name.trim().split(" ");

          payload.first_name = nameParts[0] || "";
          payload.last_name = nameParts.slice(1).join(" ") || "---";

          payload.degree = "Médico";
          payload.specialty = "General";

          payload.codigoDoctor = data.codigoDoctor;
          break;

        case "asociacion":
          payload.ruc = data.ruc;
          payload.type = "asociacion";
          break;

        case "tienda":
          payload.ruc = data.ruc;
          payload.type = "tienda";
          break;
      }

      await register(payload);

      Alert.alert(
        "Registro exitoso",
        "Tu cuenta fue creada correctamente."
      );

      router.replace("/auth/login");

    } catch (error: any) {
      Alert.alert(
        "Error",
        "Ocurrió un problema al registrarte."
      );
    }
  };

  const inputStyle = (field: string) => ({
    ...styles.input,
    borderColor: focusedField === field ? "#004d32" : "#b4dccf",
  });

  const isFormValid = () => {
    const data = formData[selectedForm];

    if (!data.name || !data.email || !data.password || !data.repeatPassword) {
      return false;
    }

    if (!validatePassword(data.password)) return false;

    if (data.password !== data.repeatPassword) return false;

    if (selectedForm === "usuario" && !data.dni) return false;
    if (selectedForm === "abogado" && !data.licencia) return false;
    if (selectedForm === "doctor" && !data.codigoDoctor) return false;
    if ((selectedForm === "asociacion" || selectedForm === "tienda") && !data.ruc) return false;

    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={60}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../../assets/logo.png")}
            style={{ width: 100, height: 100, resizeMode: "contain" }}
          />
        </View>

        <Text style={styles.title}>Crea Tu Cuenta</Text>

        <Text style={styles.helperText}>
          Selecciona el tipo de cuenta que deseas crear
        </Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowModal(true)}
        >
          <View style={styles.selectorLeft}>
            <Image source={selectedRole?.icon} style={styles.selectorIcon} />
            <Text style={styles.selectorText}>
              {selectedRole?.label}
            </Text>
          </View>

          <Ionicons
            name={showModal ? "chevron-up" : "chevron-down"}
            size={20}
            color="#004d32"
          />
        </TouchableOpacity>

        <Modal visible={showModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContainer}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedForm(role.value);
                    setShowModal(false);
                  }}
                >
                  <Image source={role.icon} style={styles.modalIcon} />
                  <Text style={styles.modalLabel}>{role.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {Object.keys(formData[selectedForm]).map((field) => (
          <View key={field} style={{ width: "100%" }}>
            <TextInput
              style={inputStyle(field)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData[selectedForm][field]}
              onChangeText={(value) => handleInputChange(field, value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={
                field === "password" || field === "repeatPassword"
              }
              placeholderTextColor="#7CA290"
            />

            {field === "password" && (
              <Text
                style={[
                  styles.passwordHint,
                  {
                    color: validatePassword(
                      formData[selectedForm].password
                    )
                      ? "#008f5d"
                      : "#cc3d3d",
                  },
                ]}
              >
                La contraseña debe tener mínimo 8 caracteres
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.registerButton,
            {
              backgroundColor: isFormValid()
                ? "#004d32"
                : "#b4dccf",
            },
          ]}
          onPress={handleSignup}
          disabled={!isFormValid()}
        >
          <Text style={styles.registerText}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("auth/login")}>
          <Text style={styles.link}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#004d32",
    textAlign: "center",
  },

  helperText: {
    fontSize: 14,
    color: "#7CA290",
    marginBottom: 16,
    textAlign: "center",
  },

  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f4fdf9",
    borderColor: "#b4dccf",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    width: "100%",
  },

  selectorLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  selectorIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },

  selectorText: {
    fontSize: 16,
    color: "#004d32",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#f4fdf9",
    color: "#004d32",
    fontSize: 14,
  },

  passwordHint: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },

  registerButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 60,
    marginTop: 10,
  },

  registerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },

  link: {
    color: "#004d32",
    textAlign: "center",
    marginTop: 16,
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 18,
    padding: 20,
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  modalIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },

  modalLabel: {
    fontSize: 16,
    color: "#004d32",
  },
});

export default SignupScreen;