import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../../context/AuthContext";

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Configuración</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* CUENTA */}
      <Text style={styles.sectionTitle}>Cuenta</Text>

      <TouchableOpacity style={styles.item} onPress={() => setShowProfile(true)}>
        <Text style={styles.itemText}>Perfil</Text>
        <Icon name="person-outline" size={20} color="#999" />
      </TouchableOpacity>

      {/* GENERAL */}
      <Text style={styles.sectionTitle}>General</Text>

      <TouchableOpacity style={styles.item} onPress={() => setShowTerms(true)}>
        <Text style={styles.itemText}>Términos de uso</Text>
        <Icon name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => setShowPrivacy(true)}>
        <Text style={styles.itemText}>Política de privacidad</Text>
        <Icon name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#E53935" />
        <Text style={styles.dangerText}>Cerrar sesión</Text>
      </TouchableOpacity>

      {/* LOGO */}
      <View style={styles.footerIcon}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={{ width: 140, height: 42, resizeMode: "contain" }}
        />
      </View>

      {/* ================= PERFIL MODAL ================= */}
      <Modal visible={showProfile} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Mi Perfil</Text>

            <View style={{ width: 26 }} />
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userType}>
              {user?.profileType || "Usuario"}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{user?.email}</Text>

            <View style={styles.divider} />

            <Text style={styles.label}>Tipo de cuenta</Text>
            <Text style={styles.value}>
              {user?.profileType || "user"}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ================= TÉRMINOS ================= */}
      <Modal visible={showTerms} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTerms(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Términos de uso</Text>

            <View style={{ width: 26 }} />
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.text}>
              Aquí van tus términos de uso.
              {"\n\n"}
              - Uso adecuado de la app{"\n"}
              - Responsabilidad del usuario{"\n"}
              - Restricciones de contenido{"\n\n"}
              Puedes reemplazar este texto por tu contenido legal real.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= PRIVACIDAD ================= */}
      <Modal visible={showPrivacy} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPrivacy(false)}>
              <Icon name="close" size={26} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>
              Política de privacidad
            </Text>

            <View style={{ width: 26 }} />
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.text}>
              Aquí va tu política de privacidad.
              {"\n\n"}
              - Recolección de datos{"\n"}
              - Uso de información{"\n"}
              - Protección de datos{"\n\n"}
              Reemplaza esto por tu documento legal real.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  itemText: {
    fontSize: 15,
    color: "#000",
  },

  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  dangerText: {
    fontSize: 15,
    color: "#E53935",
    marginLeft: 8,
  },

  footerIcon: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#fff",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  /* MODAL GENERAL */
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  modalHeader: {
    backgroundColor: "#16A34A",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  content: {
    padding: 16,
  },

  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },

  /* PERFIL */
  avatarContainer: {
    alignItems: "center",
    marginTop: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  userType: {
    color: "#16A34A",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },

  label: {
    color: "#666",
    fontSize: 13,
  },

  value: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
});