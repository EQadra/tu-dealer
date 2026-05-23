import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useDoctors } from "../../context/DoctorContext";

/* ================================
   DARK MODE
================================ */

import { useDarkMode } from "../../context/app/DarkModeContext";

const LatestDoctors = () => {

  const router = useRouter();

  const {
    latestDoctors,
    loading,
    fetchLatestDoctors,
  } = useDoctors();

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
    fetchLatestDoctors();
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

  if (!latestDoctors.length) {
    return (
      <Text
        style={[
          styles.emptyText,
          { color: colors.muted },
        ]}
      >
        No hay doctores disponibles
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

      {/* TITLE */}

      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text },
        ]}
      >
        Doctores recientes
      </Text>

      {/* LIST */}

      <FlatList
        key="vertical-list"
        data={latestDoctors}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}

        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              styles.badgeCard,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={() =>
              router.push(`/detail/doctor/${item.id}`)
            }
            activeOpacity={0.85}
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
                Dr. {item.first_name}{" "}
                {item.last_name}
              </Text>

              <Text
                style={[
                  styles.specialty,
                  { color: colors.subText },
                ]}
                numberOfLines={1}
              >
                {item.specialty}
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
                    {item.rating}
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

export default LatestDoctors;

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
     CARD
  ================================ */

  badgeCard: {
    width: "100%",
    borderRadius: 36,
    padding: 12,
    marginBottom: 14,

    flexDirection: "row",
    alignItems: "center",

    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
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

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "700",
  },

});