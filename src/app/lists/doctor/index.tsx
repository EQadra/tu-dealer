// DoctorListScreen - VERSIÓN FINAL CORREGIDA
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// IMPORTAR COMPONENTES CON VERIFICACIÓN
let ExploreScreen, LatestDoctors, LatestNews, SearchDoctorModal;

try {
  // Intentar importar con require para mejor manejo de errores
  ExploreScreen = require("../../components/ExploreScreen").default;
  LatestDoctors = require("../../components/LatestDoctor").default;
  LatestNews = require("../../components/LatestNews").default;
  SearchDoctorModal = require("../../components/SearchDoctorModal").default;
} catch (error) {
  console.error("Error importing components:", error);
}

import { useDarkMode } from "../../../context/app/DarkModeContext";

// COMPONENTES DE RESPALDO EN CASO DE ERROR
const FallbackComponent = ({ name }) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackText}>⚠️ {name} no disponible</Text>
  </View>
);

const DoctorListScreen = () => {
  const { darkMode } = useDarkMode();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [componentsLoaded, setComponentsLoaded] = useState(false);

  const backgroundColor = darkMode ? "#020617" : "#ffffff";
  const textColor = darkMode ? "#FFFFFF" : "#124E2C";

  useEffect(() => {
    // Verificar que todos los componentes estén cargados
    const checkComponents = async () => {
      try {
        const components = {
          ExploreScreen,
          LatestDoctors,
          LatestNews,
          SearchDoctorModal
        };

        const missing = Object.entries(components)
          .filter(([name, comp]) => !comp || typeof comp !== 'function')
          .map(([name]) => name);

        if (missing.length === 0) {
          setComponentsLoaded(true);
        } else {
          console.error('Componentes faltantes o inválidos:', missing);
        }
      } catch (error) {
        console.error('Error verificando componentes:', error);
      } finally {
        setLoading(false);
      }
    };

    checkComponents();
  }, []);

  // Renderizado seguro de componentes
  const SafeComponent = ({ Component, name, fallback, ...props }) => {
    if (!Component || typeof Component !== 'function') {
      return fallback || <FallbackComponent name={name} />;
    }
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error(`Error renderizando ${name}:`, error);
      return <FallbackComponent name={name} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Doctores
        </Text>
        <TouchableOpacity
          style={[styles.searchButton, { 
            backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" 
          }]}
          onPress={() => setSearchModalVisible(true)}
        >
          <Ionicons name="search-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { backgroundColor }]}
        contentContainerStyle={[styles.scrollContent, { backgroundColor }]}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionWrapper}>
          <SafeComponent 
            Component={LatestDoctors} 
            name="LatestDoctors" 
          />
        </View>
        
        <View style={styles.sectionWrapper}>
          <SafeComponent 
            Component={ExploreScreen} 
            name="ExploreScreen" 
          />
        </View>
        
        <View style={styles.sectionWrapper}>
          <SafeComponent 
            Component={LatestNews} 
            name="LatestNews" 
          />
        </View>
      </ScrollView>

      <SafeComponent 
        Component={SearchDoctorModal}
        name="SearchDoctorModal"
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default DoctorListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
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
  },
  sectionWrapper: {
    width: "100%",
    minHeight: 50,
  },
  fallbackContainer: {
    padding: 20,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    margin: 10,
    alignItems: 'center',
  },
  fallbackText: {
    color: '#dc2626',
    fontSize: 14,
  },
});