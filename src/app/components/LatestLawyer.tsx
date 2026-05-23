import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLawyers } from "../../context/LawyerContext";

/* ================================
   DARK MODE
================================ */

import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestLawyer = () => {

  const router = useRouter();

  const {
    latestLawyers,
    fetchLatestLawyers,
    loading,
  } = useLawyers();

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
    green: "#00B272",
    badge: darkMode ? "#2A2A2A" : "#EAFBF4",
    shadow: "#000",
  };

  /* ================================
     FETCH LAWYERS
  ================================ */

  useEffect(() => {
    fetchLatestLawyers();
  }, []);

  /* ================================
     LOADING
  ================================ */

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.green}
        style={{ marginTop: 20 }}
      />
    );
  }

  /* ================================
     EMPTY
  ================================ */

  if (!latestLawyers?.length) {
    return (
      <Text
        style={[
          styles.emptyText,
          { color: colors.muted },
        ]}
      >
        No hay abogados disponibles
      </Text>
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

      <Text
        style={[
          styles.title,
          { color: colors.text },
        ]}
      >
        Abogados recientes
      </Text>

      <FlatList
        key="vertical-lawyers"
        data={latestLawyers}
        keyExtractor={(item) =>
          item.id.toString()
        }
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}

        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.badgeCard,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
              },
            ]}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                `/detail/lawyer/${item.id}`
              )
            }
          >

            {/* IMAGE */}

            <Image
              source={{
                uri:
                  item.image ||
                  "https://picsum.photos/400",
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
                {item.first_name}{" "}
                {item.last_name}
              </Text>

              <Text
                style={[
                  styles.specialty,
                  { color: colors.subText },
                ]}
                numberOfLines={1}
              >
                ⚖️ {item.specialty}
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

                {/* SERVICES */}

                <View
                  style={[
                    styles.servicesContainer,
                    {
                      backgroundColor:
                        colors.badge,
                    },
                  ]}
                >

                  <Ionicons
                    name="document-text-outline"
                    size={13}
                    color={colors.green}
                  />

                  <Text
                    style={[
                      styles.services,
                      { color: colors.green },
                    ]}
                  >
                    {item.services?.length ?? 0}
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

export default LatestLawyer;

const styles = StyleSheet.create({

  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
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

  specialty: {
    fontSize: 13,
    marginTop: 4,
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

  servicesContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  services: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "700",
  },

});