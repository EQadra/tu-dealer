import React, { useEffect } from "react";
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

/* ================================
   DARK MODE
================================ */

import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestAssociations = () => {

  const router = useRouter();

  const {
    latestAssociations,
    loading,
    fetchLatestAssociations,
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
  };

  /* ================================
     FETCH
  ================================ */

  useEffect(() => {
    fetchLatestAssociations();
  }, []);

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginVertical: 20 }}
      />
    );
  }

  /* ================================
     EMPTY
  ================================ */

  if (
    !latestAssociations ||
    latestAssociations.length === 0
  ) {
    return (
      <Text
        style={[
          styles.emptyText,
          { color: colors.muted },
        ]}
      >
        No hay asociaciones recientes
      </Text>
    );
  }

  const handlePress = (id: number) => {
    router.push(`/detail/association/${id}`);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* TITLE */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text },
        ]}
      >
        Últimas Asociaciones
      </Text>

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
            onPress={() =>
              handlePress(item.id)
            }
          >
            {/* IMAGE */}
            <Image
              source={{
                uri:
                  item.image ||
                  "https://picsum.photos/300",
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
                <View
                  style={styles.cityContainer}
                >
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
                      backgroundColor:
                        colors.badge,
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
                        color: darkMode
                          ? "#FFF"
                          : "#444",
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 14,
  },

  /* ================================
     LIST CONTENT (NUEVO)
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