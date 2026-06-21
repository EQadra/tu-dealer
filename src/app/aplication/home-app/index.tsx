// screens/HomeScreen.tsx - VERSIÓN COMPLETA EN TYPESCRIPT CON TABS
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

// ============================================================
// TIPOS
// ============================================================

type TabType = 'news' | 'posts';

interface User {
  id: number;
  name: string;
  email: string;
  profile?: {
    image?: string;
  };
}

interface Colors {
  background: string;
  text: string;
  card: string;
  border: string;
  primary: string;
  secondaryText: string;
  tabInactive: string;
  tabBackground: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const HomeScreen: React.FC = () => {
  const { darkMode } = useDarkMode();
  const { user } = useAuth();
  const { fetchLatestProducts } = useProducts();
  const { fetchLatestNews } = useNewsRole();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('news');

  // ============================================================
  // COLORES
  // ============================================================

  const colors: Colors = {
    background: darkMode ? "#020617" : "#f0f9f4",
    text: darkMode ? "#F8FAFC" : "#222222",
    card: darkMode ? "#1E293B" : "#FFFFFF",
    border: darkMode ? "#334155" : "#E5E5E5",
    primary: darkMode ? "#4ADE80" : "#00B272",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    tabInactive: darkMode ? "#475569" : "#94A3B8",
    tabBackground: darkMode ? "#1E293B" : "#FFFFFF",
  };

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    fetchLatestProducts();
    fetchLatestNews();
  }, [fetchLatestProducts, fetchLatestNews]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await Promise.all([fetchLatestProducts(), fetchLatestNews()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabPress = (tab: TabType): void => {
    setActiveTab(tab);
  };

  // ============================================================
  // RENDER: TABS
  // ============================================================

  const renderTabs = (): JSX.Element => {
    return (
      <View style={[styles.tabsWrapper, { paddingHorizontal: 16, marginTop: 16 }]}>
        <View style={[styles.tabsContainer, { backgroundColor: colors.tabBackground }]}>
          {/* Tab: Noticias */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'news' && { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              },
            ]}
            onPress={() => handleTabPress('news')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { 
                  color: activeTab === 'news' ? '#FFFFFF' : colors.tabInactive,
                  fontWeight: activeTab === 'news' ? '700' : '600',
                },
              ]}
            >
              📰 Noticias
            </Text>
          </TouchableOpacity>

          {/* Tab: Posts */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'posts' && { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              },
            ]}
            onPress={() => handleTabPress('posts')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { 
                  color: activeTab === 'posts' ? '#FFFFFF' : colors.tabInactive,
                  fontWeight: activeTab === 'posts' ? '700' : '600',
                },
              ]}
            >
              📝 Posts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ============================================================
  // RENDER: TAB CONTENT
  // ============================================================

  const renderTabContent = (): JSX.Element => {
    if (activeTab === 'news') {
      return (
        <View style={styles.tabContent}>
          <LatestNews />
        </View>
      );
    } else {
      return (
        <View style={styles.tabContent}>
          <LatestPost />
        </View>
      );
    }
  };

  // ============================================================
  // RENDER: HEADER
  // ============================================================

  const renderHeader = (): JSX.Element => {
    const userAvatar = user?.profile?.image || "https://i.pravatar.cc/150";
    const userName = user?.name || "Usuario";

    return (
      <LinearGradient
        colors={darkMode ? ["#0F172A", "#020617"] : ["#00B272", "#00994C"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>¡Hola! 👋</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
          />
        </View>
      </LinearGradient>
    );
  };

  // ============================================================
  // RENDER: FOOTER
  // ============================================================

  const renderFooter = (): JSX.Element => {
    return (
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text }]}>
          © 2024 - Todos los derechos reservados
        </Text>
      </View>
    );
  };

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {renderHeader()}

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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Role Carousel */}
        <View style={styles.sectionWrapper}>
          <RoleCarousel />
        </View>

        {/* Product List */}
        <View style={styles.sectionWrapper}>
          <ProductList limit={4} showHeader={true} />
        </View>

        {/* Tabs para Noticias y Posts */}
        <View style={styles.sectionWrapper}>
          {renderTabs()}
          {renderTabContent()}
        </View>

        {/* Footer */}
        {renderFooter()}
      </ScrollView>
    </View>
  );
};

// ============================================================
// ESTILOS
// ============================================================

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
  scrollContent: {
    paddingBottom: 20,
  },
  sectionWrapper: {
    width: "100%",
  },
  // Tabs styles - Versión píldora
  tabsWrapper: {
    width: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    borderRadius: 30,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabContent: {
    paddingVertical: 8,
  },
  footer: {
    paddingVertical: 24,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});

export default HomeScreen;