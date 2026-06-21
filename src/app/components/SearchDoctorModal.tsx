import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ExploreScreen from "./ExploreScreen";
import LatestDoctors from "./LatestDoctor";
import LatestNews from "./LatestNews";
import SearchDoctorModal from "./SearchAssociationModal";

import { useDarkMode } from "../../context/app/DarkModeContext";

const DoctorListScreen = () => {
  const { darkMode } = useDarkMode();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const backgroundColor = darkMode ? "#020617" : "#ffffff";
  const textColor = darkMode ? "#FFFFFF" : "#124E2C";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* STATUS BAR */}
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      {/* HEADER CON BOTÓN DE BÚSQUEDA */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Doctores
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* LISTA PRINCIPAL CON SCROLLVIEW */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor }}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 40,
          backgroundColor,
        }}
      >
        <LatestDoctors />
        <ExploreScreen />
        <LatestNews />
      </ScrollView>

      {/* MODAL DE BÚSQUEDA */}
      <SearchDoctorModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </View>
  );
};

export default DoctorListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  searchButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});