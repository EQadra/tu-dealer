// components/modals/SearchAssociationModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";
import { useAssociations } from "../../context/AssociationContext";

interface SearchAssociationModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchAssociationModal = ({ visible, onClose }: SearchAssociationModalProps) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { searchAssociations, searchResults = [], searching = false, clearSearch } = useAssociations();
  
  const [query, setQuery] = useState("");

  // Limpiar búsqueda al cerrar el modal
  useEffect(() => {
    if (!visible) {
      setQuery("");
      clearSearch();
    }
  }, [visible]);

  // Manejar la búsqueda
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length >= 2) {
      await searchAssociations(text);
    } else if (text.length === 0) {
      clearSearch();
    }
  };

  // Colores según dark mode
  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#124E2C",
    subText: darkMode ? "#B0B0B0" : "#666",
    muted: darkMode ? "#999" : "#777",
    border: darkMode ? "#333" : "#E0E0E0",
    inputBg: darkMode ? "#2A2A2A" : "#F5F5F5",
    green: "#00B272",
  };

  // Renderizar cada item con map
  const renderResults = () => {
    const results = Array.isArray(searchResults) ? searchResults : [];
    
    if (results.length === 0) return null;

    return results.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.resultItem,
          { 
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          }
        ]}
        onPress={() => {
          onClose();
          router.push(`/detail/association/${item.id}`);
        }}
      >
        <Image
          source={{ uri: item.image || "https://picsum.photos/400" }}
          style={styles.avatar}
        />
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.resultSpecialty, { color: colors.subText }]}>
            🏛️ {item.description?.substring(0, 50) || "Asociación"}
          </Text>
          <Text style={[styles.resultCity, { color: colors.muted }]}>
            📍 {item.city || "Ciudad no especificada"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </TouchableOpacity>
    ));
  };

  const results = Array.isArray(searchResults) ? searchResults : [];
  const hasResults = results.length > 0;
  const isSearching = searching === true;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header con botón de cerrar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Buscar asociaciones
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Input de búsqueda */}
        <View style={[styles.searchContainer, { 
          backgroundColor: colors.inputBg,
          borderColor: colors.border,
        }]}>
          <Ionicons name="search-outline" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre, ciudad o descripción..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Contenido */}
        {isSearching ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Buscando...
            </Text>
          </View>
        ) : hasResults ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {renderResults()}
          </ScrollView>
        ) : query.length >= 2 ? (
          <View style={styles.centerContent}>
            <Ionicons name="search-outline" size={64} color={colors.muted} />
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No se encontraron resultados
            </Text>
            <Text style={[styles.noResultsSub, { color: colors.muted }]}>
              No hay asociaciones que coincidan con "{query}"
            </Text>
          </View>
        ) : query.length > 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="text-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Escribe al menos 2 caracteres
            </Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Ionicons name="people-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Busca asociaciones por nombre, ciudad o descripción
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultSpecialty: {
    fontSize: 13,
    marginTop: 2,
  },
  resultCity: {
    fontSize: 12,
    marginTop: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  noResultsSub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
});

export default SearchAssociationModal;