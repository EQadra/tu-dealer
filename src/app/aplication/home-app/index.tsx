// screens/HomeScreen.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDarkMode } from "../../../context/app/DarkModeContext";
import { useAuth } from "../../../context/AuthContext";
import { useNewsRole } from "../../../context/NewsRoleContext";
import { useProducts } from "../../../context/ProductContext";

import LatestNews from "../../components/LatestNews";
import LatestPost from "../../components/LatestPost";
import ProductList from "../../components/ProductList";
import RoleCarousel from "../../components/RoleCarousel";

const HomeScreen = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const { fetchLatestProducts } = useProducts();
  const { fetchLatestNews } = useNewsRole();

  const [refreshing, setRefreshing] = useState(false);

  const colors = {
    background: darkMode ? "#020617" : "#f0f9f4",
    text: darkMode ? "#F8FAFC" : "#222222",
  };

  useEffect(() => {
    fetchLatestProducts();
    fetchLatestNews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLatestProducts(), fetchLatestNews()]);
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={darkMode ? ["#0F172A", "#020617"] : ["#00B272", "#00994C"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola! 👋</Text>
            <Text style={styles.userName}>{user?.name || "Usuario"}</Text>
          </View>
          <Image
            source={{
              uri: user?.profile?.image || "https://i.pravatar.cc/150",
            }}
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00B272"
            colors={["#00B272"]}
          />
        }
      >
        {/* 1. Roles */}
        <RoleCarousel />

        {/* 2. Productos */}
        <ProductList limit={4} showHeader={true} />

        {/* 3. Noticias */}
        <LatestNews />

        {/* 4. Posts */}
        <LatestPost />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text }]}>
            © 2024 - Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  userName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});

export default HomeScreen;