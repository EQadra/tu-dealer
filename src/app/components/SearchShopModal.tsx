// components/modals/SearchShopModal.tsx
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
import { useShops } from "../../context/ShopContext";

interface SearchShopModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchShopModal = ({ visible, onClose }: SearchShopModalProps) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const { 
    searchShops, 
    searchResults = [], 
    searching = false, 
    clearSearch,
    error 
  } = useShops();
  
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
      console.log("🔍 Buscando tiendas:", text);
      await searchShops(text);
    } else if (text.length === 0) {
      clearSearch();
    }
  };

  // Colores según dark mode
  const colors = {
    background: darkMode ? "#020617" : "#F8FAFC",
    card: darkMode ? "#0F172A" : "#FFFFFF",
    text: darkMode ? "#F8FAFC" : "#124E2C",
    subText: darkMode ? "#94A3B8" : "#64748B",
    muted: darkMode ? "#94A3B8" : "#94A3B8",
    border: darkMode ? "#1E293B" : "#E2E8F0",
    inputBg: darkMode ? "#1E293B" : "#F1F5F9",
    green: darkMode ? "#4ADE80" : "#00B272",
    red: "#FF4444",
    badge: darkMode ? "#1E293B" : "#ECFDF5",
  };

  // Renderizar cada item
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
          router.push(`/detail/store/${item.id}`);
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
            🏪 {item.category || "Tienda"}
          </Text>
          <Text style={[styles.resultCity, { color: colors.muted }]}>
            📍 {item.city || "Ciudad no especificada"}
          </Text>
          <View style={styles.resultBadges}>
            <View style={[styles.resultBadge, { backgroundColor: colors.badge }]}>
              <Ionicons name="construct-outline" size={12} color={colors.green} />
              <Text style={[styles.resultBadgeText, { color: colors.green }]}>
                {item.services?.length || 0} servicios
              </Text>
            </View>
            <View style={[styles.resultBadge, { backgroundColor: colors.badge }]}>
              <Ionicons name="bag-handle-outline" size={12} color={colors.green} />
              <Text style={[styles.resultBadgeText, { color: colors.green }]}>
                {item.products?.length || 0} productos
              </Text>
            </View>
          </View>
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
            Buscar tiendas
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
            placeholder="Buscar por nombre, categoría o ciudad..."
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

        {/* Mostrar error si existe */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={colors.red} />
            <Text style={[styles.errorText, { color: colors.red }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Contenido */}
        {isSearching ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.green} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Buscando tiendas...
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
              No hay tiendas que coincidan con "{query}"
            </Text>
            <TouchableOpacity 
              style={[styles.tryAgainButton, { borderColor: colors.green }]}
              onPress={() => handleSearch(query)}
            >
              <Text style={[styles.tryAgainText, { color: colors.green }]}>
                Intentar de nuevo
              </Text>
            </TouchableOpacity>
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
            <Ionicons name="storefront-outline" size={64} color={colors.muted} />
            <Text style={[styles.messageText, { color: colors.muted }]}>
              Busca tiendas por nombre, categoría o ciudad
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFE5E5",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
  resultBadges: {
    flexDirection: "row",
    marginTop: 6,
    gap: 8,
  },
  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
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
  tryAgainButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  tryAgainText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SearchShopModal;