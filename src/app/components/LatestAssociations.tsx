// components/LatestAssociations.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAssociations } from "../../context/AssociationContext";
// ✅ CORREGIDO: Importar desde la ruta correcta
import SearchAssociationModal from "../components/SearchAssociationModal";

/* ================================
   DARK MODE
================================ */

import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestAssociations = () => {

  const router = useRouter();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const {
    latestAssociations,
    loading,
    fetchLatestAssociations,
    error,
  } = useAssociations();

  const { darkMode } = useDarkMode();

  /* ================================
     COLORS
  ================================ */

  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    badge: darkMode ? "#2A2A2A" : "#FFF8DD",
    green: "#00B272",
    shadow: "#000",
    red: "#FF4444",
  };

  /* ================================
     FETCH
  ================================ */

  useEffect(() => {
    console.log("📡 Fetching latest associations...");
    fetchLatestAssociations();
  }, []);

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={colors.green}
          style={{ marginVertical: 20 }}
        />
        <Text style={[styles.loadingText, { color: colors.muted }]}>
          Cargando asociaciones...
        </Text>
      </View>
    );
  }

  /* ================================
     ERROR
  ================================ */

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.red }]}>
          Error: {error}
        </Text>
        <TouchableOpacity onPress={() => fetchLatestAssociations()}>
          <Text style={[styles.retryText, { color: colors.green }]}>
            Reintentar
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePress = (id: number) => {
    router.push(`/detail/association/${id}`);
  };

  /* ================================
     EMPTY
  ================================ */

  if (!latestAssociations || latestAssociations.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background }
        ]}
      >
        {/* Header con botón de búsqueda */}
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            Últimas Asociaciones
          </Text>
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
            style={styles.searchButton}
          >
            <Ionicons name="search-outline" size={24} color={colors.green} />
          </TouchableOpacity>
        </View>

        <Text
          style={[
            styles.emptyText,
            { color: colors.muted },
          ]}
        >
          No hay asociaciones disponibles
        </Text>

        {/* Modal de búsqueda */}
        <SearchAssociationModal
          visible={searchModalVisible}
          onClose={() => setSearchModalVisible(false)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Header con botón de búsqueda */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Últimas Asociaciones
        </Text>
        <TouchableOpacity
          onPress={() => setSearchModalVisible(true)}
          style={styles.searchButton}
        >
          <Ionicons name="search-outline" size={24} color={colors.green} />
        </TouchableOpacity>
      </View>

      {/* LIST - View + map en lugar de FlatList */}
      <View style={styles.listContent}>
        {latestAssociations.map((item) => (
          <TouchableOpacity
            key={item.id.toString()}
            style={[
              styles.badgeCard,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => handlePress(item.id)}
          >
            {/* IMAGE */}
            <Image
              source={{
                uri: item.image || "https://picsum.photos/300",
              }}
              style={styles.avatar}
            />

            {/* INFO */}
            <View style={styles.info}>
              <Text
                style={[
                  styles.name,
                  { color: colors.text },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                style={[
                  styles.description,
                  { color: colors.subText },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              {/* BOTTOM */}
              <View style={styles.bottomRow}>
                {/* CITY */}
                <View style={styles.cityContainer}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={colors.muted}
                  />
                  <Text
                    style={[
                      styles.city,
                      { color: colors.muted },
                    ]}
                    numberOfLines={1}
                  >
                    {item.city}
                  </Text>
                </View>

                {/* RATING */}
                <View
                  style={[
                    styles.ratingContainer,
                    {
                      backgroundColor: colors.badge,
                    },
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={13}
                    color="#FFD700"
                  />
                  <Text
                    style={[
                      styles.rating,
                      {
                        color: darkMode ? "#FFF" : "#444",
                      },
                    ]}
                  >
                    4.5
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal de búsqueda */}
      <SearchAssociationModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </View>
  );
};

export default LatestAssociations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },

  /* ================================
     HEADER
  ================================ */

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },

  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },

  loadingText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },

  errorText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },

  retryText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },

  /* ================================
     LIST CONTENT
  ================================ */

  listContent: {
    flex: 1,
  },

  /* ================================
     CARD
  ================================ */

  badgeCard: {
    width: "100%",
    borderRadius: 30,
    padding: 12,
    marginBottom: 14,

    flexDirection: "row",
    alignItems: "center",

    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
  },

  description: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },

  /* ================================
     BOTTOM
  ================================ */

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  city: {
    fontSize: 12,
    marginLeft: 4,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },
});