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
  View,
} from "react-native";

import { useImageUpload } from "../../context/app/ImageUploadContext";

import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useAuth } from "../../context/AuthContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* =========================
   MENU DATA
========================= */

const sections = [
  {
    title: "General",
    items: [
      {
        title: "Inicio",
        route: "/aplication/home-app",
        icon: "home-outline",
      },
      {
        title: "Noticias",
        route: "/config/all/new",
        icon: "newspaper-outline",
      },
      {
        title: "Posts",
        route: "/config/all/post",
        icon: "document-text-outline",
      },
      {
        title: "Servicios",
        route: "/config/all/service",
        icon: "construct-outline",
      },
    ],
  },

  {
    title: "Perfil",
    items: [
      {
        title: "Perfil Asociación",
        route: "/config/all/association",
        icon: "business-outline",
      },
      {
        title: "Perfil Doctor",
        route: "/config/all/doctor",
        icon: "medkit-outline",
      },
      {
        title: "Perfil Abogado",
        route: "/config/all/lawyer",
        icon: "briefcase-outline",
      },
      {
        title: "Perfil Tienda",
        route: "/config/all/store",
        icon: "storefront-outline",
      },
      {
        title: "Perfil Usuario",
        route: "/config/all/user",
        icon: "person-outline",
      },
    ],
  },

  {
    title: "Configuración",
    items: [
      {
        title: "Configuración",
        route: "/config/aside/configuration",
        icon: "settings-outline",
      },
      {
        title: "Nosotros",
        route: "/config/aside/about_us",
        icon: "information-circle-outline",
      },
      {
        title: "Ayuda",
        route: "/config/aside/help",
        icon: "help-circle-outline",
      },
      {
        title: "Favoritos",
        route: "/config/aside/favorites",
        icon: "heart-outline",
      },
      {
        title: "Historial",
        route: "/config/aside/history",
        icon: "time-outline",
      },
      {
        title: "Soporte",
        route: "/config/aside/support",
        icon: "lock-closed-outline",
      },
      {
        title: "Dark Mode",
        route: "/config/aside/dark_mode",
        icon: "moon-outline",
      },
    ],
  },
];

export default function Header() {
  const { darkMode } = useDarkMode();
  const { user, updateUserProfile } = useAuth(); // ✅ Obtener updateUserProfile
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
    if (user?.profile?.image_url) {
      return user.profile.image_url;
    }
    if (user?.profile?.image) {
      return user.profile.image;
    }
    if (user?.avatar) {
      return user.avatar;
    }
    return null;
  };

  // ✅ Actualizar imagen cuando cambia el usuario
  useEffect(() => {
    setProfileImage(getProfileImage());
  }, [user]);

  /* =========================
     ROLE
  ========================= */
  const role = user?.profileType;

  /* =========================
     FILTER MENU
  ========================= */
  const getFilteredSections = () => {
    return sections.map((section) => {
      /* =========================
         GENERAL
      ========================= */
      if (section.title === "General") {
        return {
          ...section,
          items: section.items.filter((item) => {
            // Solo doctor y lawyer pueden ver Servicios
            if (item.title === "Servicios") {
              return role === "doctor" || role === "lawyer";
            }
            return true;
          }),
        };
      }

      /* =========================
         PERFIL
      ========================= */
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
     CAMBIAR IMAGEN - ✅ CON UPDATEUSERPROFILE
  ========================= */
  const changeImage = async () => {
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

      const res = await uploadImageByRole({
        role,
        image,
      });

      console.log("📸 RESPUESTA UPLOAD:", JSON.stringify(res, null, 2));

      if (res?.image) {
        const newImageUrl = `${res.image}?t=${Date.now()}`;

        // ✅ Actualizar imagen localmente
        setProfileImage(newImageUrl);

        // ✅ ACTUALIZAR EL USUARIO EN EL CONTEXTO GLOBAL
        if (user?.profile) {
          await updateUserProfile({
            profile: {
              ...user.profile,
              image: res.image,
              image_url: newImageUrl,
            },
          });
        } else {
          await updateUserProfile({
            avatar: newImageUrl,
          });
        }

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
    <View style={{ paddingTop: top, zIndex: 999 }}>
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
        <View style={{ flex: 1, alignItems: "center" }}>
          <Image
            source={require("../../assets/logo.png")}
            resizeMode="contain"
            style={{
              width: 140,
              height: 42,
            }}
          />
        </View>

        {/* NOTIFICATIONS */}
        <TouchableOpacity
          onPress={() => router.push("/config/aside/notifications")}
          style={{
            position: "relative",
          }}
        >
          <Ionicons name="notifications-outline" size={26} color="#fff" />

          {/* BADGE */}
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
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* SIDEBAR */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          position: "absolute",
          top: top + 60,
          left: 0,
          width: 280,
          height: SCREEN_HEIGHT,
          backgroundColor: colors.bg,
          borderTopRightRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        {/* PROFILE */}
        <View
          style={{
            padding: 20,
            borderBottomWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            backgroundColor: colors.card,
          }}
        >
          <Image
            key={profileImage || "default"}
            source={{
              uri: profileImage || "https://i.pravatar.cc/150",
            }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              borderWidth: 3,
              borderColor: colors.primary,
            }}
          />

          <TouchableOpacity onPress={changeImage}>
            <Text
              style={{
                color: colors.primary,
                marginTop: 6,
                fontSize: 12,
              }}
            >
              Cambiar foto
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

        {/* MENU ITEMS */}
        <View style={{ padding: 12 }}>
          {getFilteredSections().map((section) => {
            const isOpen = expanded[section.title];

            return (
              <View key={section.title} style={{ marginBottom: 10 }}>
                {/* SECTION */}
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
                          style={{
                            marginRight: 10,
                          }}
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
        </View>
      </Animated.View>
    </View>
  );
}