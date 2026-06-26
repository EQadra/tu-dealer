// components/Header.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import * as ImagePicker from 'expo-image-picker';
import { useImageUpload } from "../../context/app/ImageUploadContext";

import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useAuth } from "../../context/AuthContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* =========================
   MENU DATA (COMPLETO)
========================= */

const sections = [
  {
    title: "General",
    items: [
      { title: "Inicio", route: "/aplication/home-app", icon: "home-outline" },
      { title: "Noticias", route: "/config/all/new", icon: "newspaper-outline" },
      { title: "Posts", route: "/config/all/post", icon: "document-text-outline" },
      { title: "Servicios", route: "/config/all/service", icon: "construct-outline" },
    ],
  },
  {
    title: "Perfil",
    items: [
      { title: "Perfil Asociación", route: "/config/all/association", icon: "business-outline" },
      { title: "Perfil Doctor", route: "/config/all/doctor", icon: "medkit-outline" },
      { title: "Perfil Abogado", route: "/config/all/lawyer", icon: "briefcase-outline" },
      { title: "Perfil Tienda", route: "/config/all/store", icon: "storefront-outline" },
      { title: "Perfil Usuario", route: "/config/all/user", icon: "person-outline" },
    ],
  },
  {
    title: "Configuración",
    items: [
      { title: "Configuración", route: "/config/aside/configuration", icon: "settings-outline" },
      { title: "Nosotros", route: "/config/aside/about_us", icon: "information-circle-outline" },
      { title: "Ayuda", route: "/config/aside/help", icon: "help-circle-outline" },
      { title: "Favoritos", route: "/config/aside/favorites", icon: "heart-outline" },
      { title: "Historial", route: "/config/aside/history", icon: "time-outline" },
      { title: "Soporte", route: "/config/aside/support", icon: "lock-closed-outline" },
      { title: "Dark Mode", route: "/config/aside/dark_mode", icon: "moon-outline" },
    ],
  },
];

export default function Header() {
  const { darkMode } = useDarkMode();
  const { user, updateAvatar, deleteAvatar } = useAuth();
  const { pickImage, uploadImageByRole } = useImageUpload();

  const { top } = useSafeAreaInsets();

  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<any>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const slideAnim = useState(new Animated.Value(-280))[0];

  /* =========================
     OBTENER IMAGEN DEL PERFIL
  ========================= */
  const getProfileImage = () => {
    // Priorizar avatar del usuario
    if (user?.avatar_url) {
      return user.avatar_url;
    }
    if (user?.avatar) {
      return user.avatar;
    }
    // Fallback: imagen del perfil asociado
    if (user?.profile?.image_url) {
      return user.profile.image_url;
    }
    if (user?.profile?.image) {
      return user.profile.image;
    }
    return null;
  };

  useEffect(() => {
    setProfileImage(getProfileImage());
  }, [user]);

  const role = user?.profileType;

  /* =========================
     FILTER MENU
  ========================= */
  const getFilteredSections = () => {
    return sections.map((section) => {
      if (section.title === "General") {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (item.title === "Servicios") {
              return role === "doctor" || role === "lawyer";
            }
            return true;
          }),
        };
      }

      if (section.title === "Perfil") {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (item.title === "Perfil Doctor") return role === "doctor";
            if (item.title === "Perfil Abogado") return role === "lawyer";
            if (item.title === "Perfil Asociación") return role === "association";
            if (item.title === "Perfil Tienda") return role === "shop";
            if (item.title === "Perfil Usuario") return role === "user";
            return false;
          }),
        };
      }

      return section;
    });
  };

  /* =========================
     CAMBIAR IMAGEN (PERFIL ASOCIADO)
  ========================= */
  const changeRoleImage = async () => {
    try {
      const image = await pickImage();
      if (!image) return;

      const roleMap = {
        doctor: "doctor",
        lawyer: "lawyer",
        association: "association",
        shop: "shop",
      } as const;

      const role = roleMap[user?.profileType as keyof typeof roleMap];
      if (!role) {
        Alert.alert("Error", "Este perfil no permite cambiar imagen");
        return;
      }

      const res = await uploadImageByRole({ role, image });

      if (res?.image) {
        const newImageUrl = `${res.image}?t=${Date.now()}`;
        setProfileImage(newImageUrl);
        Alert.alert("Correcto", "Imagen actualizada");
      } else {
        Alert.alert("Error", "No se recibió la nueva imagen");
      }
    } catch (error) {
      console.log("❌ Error al cambiar imagen:", error);
      Alert.alert("Error", "No se pudo actualizar la imagen");
    }
  };

  /* =========================
     CAMBIAR AVATAR (USUARIO)
  ========================= */
  const changeImage = async () => {
    try {
      Alert.alert(
        "Foto de perfil",
        "¿Qué deseas hacer?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Cambiar foto",
            onPress: async () => {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!permissionResult.granted) {
                Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería");
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.8,
                aspect: [1, 1],
              });

              if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                Alert.alert("Actualizando...", "Por favor espera");
                const newAvatar = await updateAvatar(imageUri);
                setProfileImage(newAvatar);
                Alert.alert("✅ Correcto", "Foto de perfil actualizada");
              }
            }
          },
          ...(profileImage ? [{
            text: "Eliminar foto",
            style: "destructive" as const,
            onPress: async () => {
              Alert.alert(
                "Confirmar",
                "¿Estás seguro de eliminar tu foto de perfil?",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive" as const,
                    onPress: async () => {
                      await deleteAvatar();
                      setProfileImage(null);
                      Alert.alert("✅ Correcto", "Foto eliminada");
                    }
                  }
                ]
              );
            }
          }] : [])
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo actualizar la imagen");
    }
  };

  /* =========================
     NAVIGATION
  ========================= */
  const navigate = (route: string) => {
    if (!route) return;
    router.push(route as any);
    setMenuOpen(false);
  };

  /* =========================
     MENU
  ========================= */
  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -280,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  /* =========================
     COLORS
  ========================= */
  const colors = {
    bg: darkMode ? "#0f172a" : "#ffffff",
    card: darkMode ? "#1e293b" : "#f9fafb",
    text: darkMode ? "#e5e7eb" : "#111827",
    subText: darkMode ? "#9ca3af" : "#6b7280",
    primary: darkMode ? "#22c55e" : "#065f46",
    border: darkMode ? "#334155" : "#e5e7eb",
    activeBg: darkMode ? "#064e3b" : "#ecfdf5",
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: top, zIndex: 999 }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          height: 60,
          backgroundColor: colors.primary,
        }}
      >
        {/* MENU BUTTON */}
        <TouchableOpacity onPress={menuOpen ? closeMenu : openMenu}>
          <Ionicons name={menuOpen ? "close" : "menu"} size={26} color="#fff" />
        </TouchableOpacity>

        {/* LOGO */}
        <TouchableOpacity
          style={{ flex: 1, alignItems: "center" }}
          onPress={() => {
            router.push("/aplication/home-app");
            closeMenu();
          }}
          activeOpacity={0.7}
        >
          <Image
            source={require("../../assets/logo.png")}
            resizeMode="contain"
            style={{ width: 140, height: 42 }}
          />
        </TouchableOpacity>

        {/* NOTIFICATIONS */}
        <TouchableOpacity
          onPress={() => router.push("/config/aside/notifications")}
          style={{ position: "relative" }}
        >
          <Ionicons name="notifications-outline" size={26} color="#fff" />
          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#ef4444",
            }}
          />
        </TouchableOpacity>
      </View>

      {/* OVERLAY */}
      {menuOpen && (
        <Pressable
          onPress={closeMenu}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
        />
      )}

      {/* SIDEBAR CON SCROLL CORREGIDO */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          position: "absolute",
          top: top + 60,
          left: 0,
          width: 280,
          height: SCREEN_HEIGHT - top - 10 - 10,
          backgroundColor: colors.bg,
          borderTopRightRadius: 40,
          borderBottomRightRadius: 40,
          zIndex: 1000,
          elevation: 1000,
          overflow: 'hidden',
        }}
        pointerEvents={menuOpen ? "auto" : "none"}
      >
        {/* PERFIL - Fijo en la parte superior */}
        <View
          style={{
            padding: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            backgroundColor: colors.card,
          }}
        >
          <TouchableOpacity onPress={changeImage}>
            <Image
              key={profileImage || "default"}
              source={{
                uri: profileImage || "https://i.pravatar.cc/150?img=1",
              }}
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={changeImage}>
            <Text
              style={{
                color: colors.primary,
                marginTop: 6,
                fontSize: 12,
              }}
            >
              {profileImage ? "Cambiar foto" : "Agregar foto"}
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: colors.text,
              marginTop: 10,
              fontWeight: "700",
            }}
          >
            {user?.name}
          </Text>

          <Text style={{ color: colors.subText }}>{user?.email}</Text>
        </View>

        {/* MENÚ ITEMS CON SCROLL */}
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: 40,
            }}
            style={{ flex: 1 }}
          >
            {getFilteredSections().map((section) => {
              const isOpen = expanded[section.title];

              return (
                <View key={section.title} style={{ marginBottom: 10 }}>
                  {/* SECTION TITLE */}
                  <TouchableOpacity
                    onPress={() =>
                      setExpanded((prev: any) => ({
                        ...prev,
                        [section.title]: !prev[section.title],
                      }))
                    }
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.subText,
                        fontSize: 12,
                      }}
                    >
                      {section.title.toUpperCase()}
                    </Text>

                    <Ionicons
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.subText}
                    />
                  </TouchableOpacity>

                  {/* ITEMS */}
                  {isOpen &&
                    section.items.map((item) => {
                      const active = pathname === item.route;

                      return (
                        <TouchableOpacity
                          key={item.title}
                          onPress={() => navigate(item.route)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 10,
                            borderRadius: 10,
                            backgroundColor: active ? colors.activeBg : "transparent",
                            marginTop: 4,
                          }}
                        >
                          <Ionicons
                            name={item.icon as any}
                            size={20}
                            color={active ? colors.primary : colors.subText}
                            style={{ marginRight: 10 }}
                          />

                          <Text
                            style={{
                              color: active ? colors.primary : colors.text,
                            }}
                          >
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              );
            })}
            
            {/* INDICADOR DE FINAL - Versión Compacta Elegante */}
            <View style={{ 
              paddingVertical: 20, 
              alignItems: 'center',
              marginTop: 5,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <View style={{
                  width: 25,
                  height: 1,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                }} />
                <Ionicons 
                  name="chevron-down" 
                  size={14} 
                  color={colors.primary} 
                  style={{ opacity: 0.3 }}
                />
                <View style={{
                  width: 25,
                  height: 1,
                  backgroundColor: colors.primary,
                  opacity: 0.2,
                }} />
              </View>
              <Text style={{ 
                color: colors.subText, 
                fontSize: 9,
                marginTop: 6,
                opacity: 0.25,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}>
                Final
              </Text>
            </View>
          </ScrollView>
        </View>
      </Animated.View>
    </GestureHandlerRootView>
  );
}