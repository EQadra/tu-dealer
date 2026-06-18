// components/RoleCarousel.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";

const { width } = Dimensions.get("window");

const RoleCarousel = () => {
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const colors = {
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    cardBg: darkMode ? "#0F172A" : "#ffffff",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
    border: darkMode ? "#1E293B" : "#eeeeee",
  };

  const roles = [
    {
      id: "1",
      title: "Doctores",
      image: require("../../assets/home/doctor.png"),
      route: "lists/doctor", // ✅ Ruta correcta según tu layout
      icon: "medical-outline",
      color: "#4ADE80",
      gradient: ["#4ADE80", "#22D3EE"],
    },
    {
      id: "2",
      title: "Tiendas",
      image: require("../../assets/home/store.png"),
      route: "lists/store", // ✅ Ruta correcta según tu layout
      icon: "storefront-outline",
      color: "#60A5FA",
      gradient: ["#60A5FA", "#818CF8"],
    },
    {
      id: "3",
      title: "Asociaciones",
      image: require("../../assets/home/asociation.png"),
      route: "lists/association", // ✅ Ruta correcta según tu layout
      icon: "people-outline",
      color: "#FBBF24",
      gradient: ["#FBBF24", "#F472B6"],
    },
    {
      id: "4",
      title: "Abogados",
      image: require("../../assets/home/lawyer.png"),
      route: "lists/lawyer", // ✅ Ruta correcta según tu layout
      icon: "briefcase-outline",
      color: "#F87171",
      gradient: ["#F87171", "#FB923C"],
    },
  ];

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ¿A quién deseas visitar? 👋
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={() => handlePress(role.route)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={role.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />

            <View style={[styles.iconContainer, { backgroundColor: role.color + "20" }]}>
              <Ionicons name={role.icon as any} size={28} color={role.color} />
            </View>

            <Image source={role.image} style={styles.cardImage} resizeMode="contain" />

            <Text style={[styles.roleTitle, { color: colors.text }]}>
              {role.title}
            </Text>

            <View style={[styles.badge, { backgroundColor: role.color }]}>
              <Text style={styles.badgeText}>Ver más</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  card: {
    width: width * 0.45,
    marginHorizontal: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.06,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default RoleCarousel;