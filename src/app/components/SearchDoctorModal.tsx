// components/SearchDoctorModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
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
import { useProducts } from "../../context/ProductContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  productable?: {
    name: string;
  };
}

interface SearchDoctorModalProps {
  visible: boolean;
  onClose: () => void;
}

const SearchDoctorModal: React.FC<SearchDoctorModalProps> = ({ visible, onClose }) => {
  const { darkMode } = useDarkMode();
  const { products, loading } = useProducts();
  const [searchText, setSearchText] = useState<string>("");

  const colors = {
    background: darkMode ? "#121212" : "#FFFFFF",
    card: darkMode ? "#1E1E1E" : "#FFFFFF",
    text: darkMode ? "#FFFFFF" : "#222222",
    subText: darkMode ? "#B0B0B0" : "#666666",
    primary: darkMode ? "#4ADE80" : "#00B272",
    inputBackground: darkMode ? "#2A2A2A" : "#F3F3F3",
    placeholder: darkMode ? "#888888" : "#999999",
    icon: darkMode ? "#CCCCCC" : "#777777",
  };

  const filteredProducts = useMemo(() => {
    if (!searchText.trim()) return [];
    return products.filter((item: Product) => {
      const text = searchText.toLowerCase();
      return (
        item.name?.toLowerCase().includes(text) ||
        item.description?.toLowerCase().includes(text) ||
        item.productable?.name?.toLowerCase().includes(text)
      );
    });
  }, [searchText, products]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Buscar productos
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search" size={20} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar productos..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.subText }]}>
              Cargando productos...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsContainer}
          >
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={60} color={colors.placeholder} />
                <Text style={[styles.emptyText, { color: colors.placeholder }]}>
                  {searchText.trim() ? "No se encontraron productos" : "Busca un producto"}
                </Text>
                {searchText.trim() && (
                  <Text style={[styles.emptySubText, { color: colors.subText }]}>
                    Intenta con otras palabras clave
                  </Text>
                )}
              </View>
            ) : (
              filteredProducts.map((item: Product) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.resultItem, { backgroundColor: colors.card }]}
                  onPress={() => {
                    onClose();
                    setSearchText("");
                  }}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.image || "https://picsum.photos/200" }}
                    style={styles.resultImage}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.resultDescription, { color: colors.subText }]}>
                      {item.description}
                    </Text>
                    <View style={styles.resultBottom}>
                      <Text style={[styles.resultPrice, { color: colors.primary }]}>
                        S/ {item.price}
                      </Text>
                      <View style={[styles.resultBadge, { backgroundColor: colors.inputBackground }]}>
                        <Text style={[styles.resultBadgeText, { color: colors.subText }]}>
                          {item.productable?.name || "Producto"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  resultsContainer: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 4,
  },
  resultItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: "center",
  },
  resultName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 13,
    marginBottom: 6,
  },
  resultBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultPrice: {
    fontSize: 15,
    fontWeight: "700",
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default SearchDoctorModal;