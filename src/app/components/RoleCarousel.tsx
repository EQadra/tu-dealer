// components/RoleCarousel.tsx - VERSIÓN HORIZONTAL (CAROUSEL)
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

const { width: screenWidth } = Dimensions.get("window");

const RoleCarousel = () => {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
      route: "lists/doctor",
      icon: "medical-outline",
      color: "#4ADE80",
      gradient: ["#4ADE80", "#22D3EE"],
    },
    {
      id: "2",
      title: "Tiendas",
      image: require("../../assets/home/store.png"),
      route: "lists/store",
      icon: "storefront-outline",
      color: "#60A5FA",
      gradient: ["#60A5FA", "#818CF8"],
    },
    {
      id: "3",
      title: "Asociaciones",
      image: require("../../assets/home/asociation.png"),
      route: "lists/association",
      icon: "people-outline",
      color: "#FBBF24",
      gradient: ["#FBBF24", "#F472B6"],
    },
    {
      id: "4",
      title: "Abogados",
      image: require("../../assets/home/lawyer.png"),
      route: "lists/lawyer",
      icon: "briefcase-outline",
      color: "#F87171",
      gradient: ["#F87171", "#FB923C"],
    },
  ];

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (screenWidth * 0.75 + 16));
    setActiveIndex(index);
  };

  // Scroll a la siguiente tarjeta
  const scrollToNext = () => {
    const nextIndex = Math.min(activeIndex + 1, roles.length - 1);
    scrollViewRef.current?.scrollTo({
      x: nextIndex * (screenWidth * 0.75 + 16),
      animated: true,
    });
    setActiveIndex(nextIndex);
  };

  // Scroll a la tarjeta anterior
  const scrollToPrev = () => {
    const prevIndex = Math.max(activeIndex - 1, 0);
    scrollViewRef.current?.scrollTo({
      x: prevIndex * (screenWidth * 0.75 + 16),
      animated: true,
    });
    setActiveIndex(prevIndex);
  };

  return (
    <View style={styles.container}>
      {/* Header con título y controles */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          ¿A quién deseas visitar? 👋
        </Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { opacity: activeIndex === 0 ? 0.3 : 1 },
            ]}
            onPress={scrollToPrev}
            disabled={activeIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              { opacity: activeIndex === roles.length - 1 ? 0.3 : 1 },
            ]}
            onPress={scrollToNext}
            disabled={activeIndex === roles.length - 1}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carousel Horizontal */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth * 0.75 + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {roles.map((role, index) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                shadowColor: colors.shadow,
                width: screenWidth * 0.75,
                marginRight: index === roles.length - 1 ? 0 : 16,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => handlePress(role.route)}
          >
            <LinearGradient
              colors={role.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />

            {/* Icono */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: role.color + "20" },
              ]}
            >
              <Ionicons name={role.icon as any} size={32} color={role.color} />
            </View>

            {/* Imagen */}
            <Image source={role.image} style={styles.cardImage} resizeMode="contain" />

            {/* Título */}
            <Text style={[styles.roleTitle, { color: colors.text }]}>
              {role.title}
            </Text>

            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: role.color }]}>
              <Text style={styles.badgeText}>Ver más</Text>
            </View>

            {/* Indicador de posición */}
            <View style={styles.positionIndicator}>
              <Text style={[styles.positionText, { color: colors.secondaryText }]}>
                {index + 1} / {roles.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Indicadores de página (puntos) */}
      <View style={styles.dotsContainer}>
        {roles.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  activeIndex === index ? colors.text : colors.border,
                width: activeIndex === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingVertical: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },

  controls: {
    flexDirection: "row",
    gap: 8,
  },

  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
    minHeight: 220,
  },

  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.08,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },

  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  positionIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  positionText: {
    fontSize: 10,
    opacity: 0.5,
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },

  dot: {
    height: 8,
    borderRadius: 4,
    transitionDuration: "300ms",
  },
});

export default RoleCarousel;