import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Svg, Path } from "react-native-svg";

export default function FooterApp() {
  const { bottom } = useSafeAreaInsets();
  const [modalType, setModalType] = useState<null | "privacidad" | "terminos" | "acerca">(null);

  const renderForm = () => {
    switch (modalType) {
      case "privacidad":
        return (
          <>
            <Text style={styles.formTitle}>Formulario de Contacto</Text>
            <TextInput style={styles.input} placeholder="Tu nombre" />
            <TextInput style={styles.input} placeholder="Tu correo electrónico" />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Tu mensaje"
              multiline
            />
          </>
        );
      case "terminos":
        return (
          <>
            <Text style={styles.formTitle}>Suscribirse a los Términos</Text>
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />
          </>
        );
      case "acerca":
        return (
          <>
            <Text style={styles.formTitle}>Feedback sobre la App</Text>
            <TextInput style={styles.input} placeholder="Nombre" />
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Tu opinión"
              multiline
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.footer, { paddingBottom: bottom }]}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => setModalType("privacidad")}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"
              fill="#047857"
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalType("terminos")}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 4h14a2 2 0 012 2v14l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2z"
              fill="#047857"
            />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalType("acerca")}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0H5z"
              fill="#047857"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>© {new Date().getFullYear()} Me</Text>

      {/* Modal de pantalla completa */}
      <Modal
        animationType="slide"
        visible={modalType !== null}
        onRequestClose={() => setModalType(null)}
      >
        <ScrollView contentContainerStyle={styles.fullModalContainer}>
          <Text style={styles.modalHeaderText}>
            {modalType === "privacidad"
              ? "Política de Privacidad"
              : modalType === "terminos"
              ? "Términos y Condiciones"
              : "Acerca de"}
          </Text>

          {renderForm()}

          <Pressable style={styles.closeButton} onPress={() => setModalType(null)}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80, // o el valor que prefieras
    marginBottom: 8,
  },

  footerText: {
    fontSize: 14,
    color: "#065F46",
  },
  fullModalContainer: {
    flexGrow: 1,
    backgroundColor: "#ECFDF5",
    padding: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  modalHeaderText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#065F46",
    marginBottom: 20,
    textAlign: "center",
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: "#047857",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#10B981",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
