import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useShops } from "../../context/ShopContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestShops = () => {
  const router = useRouter();

  const { darkMode } = useDarkMode();

  const { latestShops, loading } = useShops();

  /* =========================
     COLORS
  ========================= */

  const colors = {
    background: darkMode ? "#020617" : "#F8FAFC",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#124E2C",
    secondary: darkMode ? "#94A3B8" : "#64748B",
    green: darkMode ? "#4ADE80" : "#00B272",
    badge: darkMode ? "#1E293B" : "#ECFDF5",
    meta: darkMode ? "#111827" : "#F1F5F9",
    border: darkMode ? "#1E293B" : "#E2E8F0",
  };

  /* =========================
     SAFE ARRAY
  ========================= */

  const displayedShops = useMemo(() => {
    if (!latestShops) return [];

    const shopsArray = Array.isArray(latestShops)
      ? latestShops
      : latestShops?.data || [];

    return shopsArray
      .filter(Boolean)
      .slice(0, 6);
  }, [latestShops]);

  /* =========================
     LOADING
  ========================= */

  if (loading && displayedShops.length === 0) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginVertical: 20 }}
      />
    );
  }

  /* =========================
     EMPTY
  ========================= */

  if (!loading && displayedShops.length === 0) {
    return (
      <Text
        style={[
          styles.emptyText,
          { color: colors.secondary },
        ]}
      >
        No hay tiendas disponibles
      </Text>
    );
  }

  /* =========================
     COMPONENT
  ========================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* HEADER */}

      <View style={styles.headerRow}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Últimas Tiendas
        </Text>

        <TouchableOpacity
          style={[
            styles.viewAllBadge,
            {
              backgroundColor:
                colors.green,
            },
          ]}
          onPress={() =>
            router.push("/lists/store")
          }
        >
          <Text style={styles.viewAllText}>
            Ver más
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color="#fff"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>
      </View>

      {/* LIST */}

      <FlatList
        data={displayedShops}
        keyExtractor={(item, index) =>
          `${item.id}-${index}`
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.badgeCard,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={() => {
              if (!item?.id) return;

              router.push(
                `/detail/store/${item.id}`
              );
            }}
          >
            {/* IMAGE */}

            <Image
              source={{
                uri:
                  item.image ||
                  "https://picsum.photos/400",
              }}
              style={styles.badgeImage}
            />

            {/* CONTENT */}

            <View style={styles.badgeContent}>
              {/* TOP ROW */}

              <View style={styles.topRow}>
                {/* RATING LEFT */}

                <View
                  style={
                    styles.ratingMiniBadge
                  }
                >
                  <Ionicons
                    name="star"
                    size={11}
                    color="#FFD700"
                  />

                  <Text
                    style={[
                      styles.ratingMiniText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    4.5
                  </Text>
                </View>

                {/* STORE BADGE */}

                <View
                  style={[
                    styles.storeBadge,
                    {
                      backgroundColor:
                        colors.green,
                    },
                  ]}
                >
                  <Ionicons
                    name="storefront"
                    size={10}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.storeBadgeText
                    }
                  >
                    Tienda
                  </Text>
                </View>
              </View>

              {/* NAME */}

              <Text
                style={[
                  styles.badgeName,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              {/* DESCRIPTION */}

              <Text
                style={[
                  styles.badgeDescription,
                  {
                    color:
                      colors.secondary,
                  },
                ]}
                numberOfLines={2}
              >
                {item.description ||
                  "Sin descripción"}
              </Text>

              {/* CITY */}

              <View
                style={[
                  styles.cityBadge,
                  {
                    backgroundColor:
                      colors.badge,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={11}
                  color={colors.green}
                />

                <Text
                  style={[
                    styles.cityText,
                    {
                      color:
                        colors.green,
                    },
                  ]}
                >
                  {item.city ||
                    "Sin ciudad"}
                </Text>
              </View>

              {/* SMALL BADGES */}

              <View style={styles.badgesRow}>
                <View
                  style={[
                    styles.smallBadge,
                    {
                      backgroundColor:
                        colors.meta,
                    },
                  ]}
                >
                  <Ionicons
                    name="construct-outline"
                    size={11}
                    color={
                      colors.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.smallBadgeText,
                      {
                        color:
                          colors.secondary,
                      },
                    ]}
                  >
                    {item.services
                      ?.length ?? 0}{" "}
                    servicios
                  </Text>
                </View>

                <View
                  style={[
                    styles.smallBadge,
                    {
                      backgroundColor:
                        colors.meta,
                    },
                  ]}
                >
                  <Ionicons
                    name="bag-handle-outline"
                    size={11}
                    color={
                      colors.secondary
                    }
                  />

                  <Text
                    style={[
                      styles.smallBadgeText,
                      {
                        color:
                          colors.secondary,
                      },
                    ]}
                  >
                    {item.products
                      ?.length ?? 0}{" "}
                    productos
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default LatestShops;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingBottom: 10,
    flex: 1,
  },

  /* =========================
     HEADER
  ========================= */

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  viewAllBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  viewAllText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  /* =========================
     CARD
  ========================= */

  badgeCard: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 24,
    borderWidth: 1,

    padding: 12,

    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  /* =========================
     IMAGE
  ========================= */

  badgeImage: {
    width: 95,
    height: 95,
    borderRadius: 20,
  },

  /* =========================
     CONTENT
  ========================= */

  badgeContent: {
    flex: 1,
    marginLeft: 14,
  },

  /* =========================
     TOP ROW
  ========================= */

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  /* =========================
     STORE BADGE
  ========================= */

  storeBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 20,
  },

  storeBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: 4,
  },

  /* =========================
     NAME
  ========================= */

  badgeName: {
    fontSize: 15,
    fontWeight: "700",
  },

  /* =========================
     DESCRIPTION
  ========================= */

  badgeDescription: {
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  /* =========================
     CITY
  ========================= */

  cityBadge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 20,

    marginTop: 10,
  },

  cityText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  /* =========================
     BADGES
  ========================= */

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  smallBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 14,

    marginRight: 8,
    marginBottom: 8,
  },

  smallBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  /* =========================
     RATING
  ========================= */

  ratingMiniBadge: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 14,

    backgroundColor:
      "rgba(255,215,0,0.15)",
  },

  ratingMiniText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  /* =========================
     EMPTY
  ========================= */

  emptyText: {
    textAlign: "center",
    marginVertical: 20,
    fontSize: 13,
  },
});