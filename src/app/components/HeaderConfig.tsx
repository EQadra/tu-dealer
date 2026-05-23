import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, NavigationProp } from "@react-navigation/native";

// Define las pantallas del stack
type RootStackParamList = {
  HeaderConfig: undefined;
  CuentaSeguridad: undefined;
  Notificaciones: undefined;
  Favoritos: undefined;
  Historial: undefined;
  Configuracion: undefined;
  ModoOscuro: undefined;
  SobreNosotros: undefined;
  Ayuda: undefined;
  Soporte: undefined;
};

// Tipo para cada item de menú
type MenuItem = {
  label: string;
  icon: React.ReactNode;
  screen?: keyof RootStackParamList;
};

const HeaderConfig: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const menuItems: MenuItem[] = [
    { label: "Cuenta y seguridad", icon: <Ionicons name="shield-checkmark" size={24} color="#1DA1F2" />, screen: "CuentaSeguridad" },
    { label: "Notificaciones", icon: <Ionicons name="notifications-outline" size={24} color="#1DA1F2" />, screen: "Notificaciones" },
    { label: "Favoritos", icon: <FontAwesome name="bookmark" size={24} color="#FF4D6D" />, screen: "Favoritos" },
    { label: "Historial", icon: <MaterialIcons name="history" size={24} color="#1DA1F2" />, screen: "Historial" },
    { label: "Configuración", icon: <Ionicons name="settings-outline" size={24} color="#1DA1F2" />, screen: "Configuracion" },
    { label: "Modo oscuro", icon: <Ionicons name="moon-outline" size={24} color="#6B7280" />, screen: "ModoOscuro" },
    { label: "Sobre nosotros", icon: <Ionicons name="information-circle-outline" size={24} color="#10B981" />, screen: "SobreNosotros" },
    { label: "Ayuda", icon: <Ionicons name="help-circle-outline" size={24} color="#3B82F6" />, screen: "Ayuda" },
    { label: "Soporte", icon: <Ionicons name="settings-outline" size={24} color="#2563EB" />, screen: "Soporte" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: "https://i.imgur.com/yourProfilePic.png" }} 
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>Camilo Tevez</Text>
          <TouchableOpacity>
            <Text style={styles.edit}>Editar mi perfil &gt;</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem} 
            onPress={() => item.screen && navigation.navigate(item.screen)}
          >
            {item.icon}
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.logout} onPress={() => alert("Cerrar sesión")}>
        <MaterialIcons name="logout" size={24} color="#10B981" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  name: { fontSize: 20, fontWeight: "bold" },
  edit: { color: "#6B7280", marginTop: 2 },
  menu: { flex: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  menuLabel: { fontSize: 16, marginLeft: 15, color: "#111827" },
  logout: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  logoutText: { color: "#10B981", fontSize: 16, marginLeft: 10 },
});

export default HeaderConfig;
