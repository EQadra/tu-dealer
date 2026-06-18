// components/ProductList.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useProducts } from "../../context/ProductContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

interface ProductListProps {
  limit?: number;
  showHeader?: boolean;
  showFavorites?: boolean; // Mostrar solo favoritos
}

const ProductList = ({ limit = 4, showHeader = true, showFavorites = false }: ProductListProps) => {
  const { darkMode } = useDarkMode();
  const { products, loading, fetchLatestProducts } = useProducts();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const colors = {
    background: darkMode ? "#020617" : "#f5f5f5",
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
    green: "#00B272",
    whatsapp: "#25D366",
    red: "#EF4444",
    gold: "#FBBF24",
  };

  // Cargar favoritos desde AsyncStorage
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem("productFavorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const saveFavorites = async (newFavorites: number[]) => {
    try {
      await AsyncStorage.setItem("productFavorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  };

  const toggleFavorite = (productId: number) => {
    let newFavorites: number[];
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter((id) => id !== productId);
    } else {
      newFavorites = [...favorites, productId];
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLatestProducts();
    setRefreshing(false);
  };

  const openProductDetail = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleWhatsApp = (phone: string) => {
    if (!phone) {
      Alert.alert("Contacto no disponible", "El vendedor no tiene número de contacto");
      return;
    }

    let cleanPhone = phone.replace(/\s/g, "").replace(/[^0-9+]/g, "");
    if (!cleanPhone.startsWith("+") && !cleanPhone.startsWith("00")) {
      cleanPhone = `+57${cleanPhone}`;
    }

    Linking.openURL(`https://wa.me/${cleanPhone}`).catch(() => {
      Alert.alert("Error", "No se pudo abrir WhatsApp");
    });
  };

  // Obtener nombre del vendedor según el tipo
  const getSellerName = (product: any) => {
    if (product.shop?.name) return product.shop.name;
    if (product.doctor?.first_name) return `${product.doctor.first_name} ${product.doctor.last_name || ''}`;
    if (product.lawyer?.first_name) return `${product.lawyer.first_name} ${product.lawyer.last_name || ''}`;
    if (product.association?.name) return product.association.name;
    return "Vendedor";
  };

  const renderProduct = ({ item }: { item: any }) => {
    const isFavorite = favorites.includes(item.id);
    const hasImage = item.image || item.image_url;
    const stock = item.stock ?? 0;

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => openProductDetail(item)}
        activeOpacity={0.8}
      >
        {/* Imagen con placeholder */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: hasImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.green + "20" }]}>
              <Ionicons name="image-outline" size={40} color={colors.green} />
            </View>
          )}

          {/* Badge de stock */}
          <View
            style={[
              styles.stockBadge,
              { backgroundColor: stock > 0 ? colors.green : colors.red },
            ]}
          >
            <Text style={styles.stockBadgeText}>
              {stock > 0 ? `Stock: ${stock}` : "Agotado"}
            </Text>
          </View>

          {/* Botón de favoritos */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? colors.red : "#fff"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.name || "Producto"}
          </Text>
          <Text style={[styles.productPrice, { color: colors.green }]}>
            {item.price ? `$${item.price.toLocaleString()}` : "Precio N/A"}
          </Text>
          <Text style={[styles.productShop, { color: colors.secondaryText }]} numberOfLines={1}>
            {getSellerName(item)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && !products.length) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  // Filtrar productos
  let displayProducts = products;
  if (showFavorites) {
    displayProducts = products.filter((p) => favorites.includes(p.id));
  }
  displayProducts = displayProducts.slice(0, limit);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {showFavorites ? "❤️ Favoritos" : "🛍️ Productos"}
          </Text>
          {favorites.length > 0 && !showFavorites && (
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.favoriteCount, { color: colors.gold }]}>
                ❤️ {favorites.length}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={displayProducts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={2}
        scrollEnabled={false}
        renderItem={renderProduct}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
            colors={[colors.green]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={50} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {showFavorites ? "No tienes productos favoritos" : "No hay productos"}
            </Text>
            {showFavorites && (
              <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                Agrega productos a favoritos ❤️
              </Text>
            )}
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Detalle</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedProduct && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalImageContainer}>
                {selectedProduct.image || selectedProduct.image_url ? (
                  <Image
                    source={{ uri: selectedProduct.image || selectedProduct.image_url }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.modalImagePlaceholder, { backgroundColor: colors.green + "20" }]}>
                    <Ionicons name="image-outline" size={60} color={colors.green} />
                  </View>
                )}
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalHeaderInfo}>
                  <Text style={[styles.modalProductName, { color: colors.text }]}>
                    {selectedProduct.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(selectedProduct.id)}
                    style={styles.modalFavoriteButton}
                  >
                    <Ionicons
                      name={favorites.includes(selectedProduct.id) ? "heart" : "heart-outline"}
                      size={28}
                      color={favorites.includes(selectedProduct.id) ? colors.red : colors.secondaryText}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalPrice, { color: colors.green }]}>
                  {selectedProduct.price ? `$${selectedProduct.price.toLocaleString()}` : "Precio N/A"}
                </Text>

                <Text style={[styles.modalShop, { color: colors.secondaryText }]}>
                  🏪 {getSellerName(selectedProduct)}
                </Text>

                {selectedProduct.stock !== undefined && (
                  <View style={styles.modalStock}>
                    <Text style={[styles.modalStockText, { color: selectedProduct.stock > 0 ? colors.green : colors.red }]}>
                      {selectedProduct.stock > 0 ? `✅ Disponible (${selectedProduct.stock} unidades)` : "❌ Agotado"}
                    </Text>
                  </View>
                )}

                {selectedProduct.description && (
                  <View style={styles.modalDescription}>
                    <Text style={[styles.modalDescriptionTitle, { color: colors.text }]}>
                      📝 Descripción
                    </Text>
                    <Text style={[styles.modalDescriptionText, { color: colors.secondaryText }]}>
                      {selectedProduct.description}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.whatsappButton, { backgroundColor: colors.whatsapp }]}
                  onPress={() => handleWhatsApp(selectedProduct.shop?.phone)}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                  <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  favoriteCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    minHeight: 36,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  productShop: {
    fontSize: 11,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  emptySubtext: {
    fontSize: 12,
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalImageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#e0e0e0",
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 20,
  },
  modalHeaderInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalProductName: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  modalFavoriteButton: {
    padding: 8,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  modalShop: {
    fontSize: 14,
    marginTop: 4,
  },
  modalStock: {
    marginTop: 8,
  },
  modalStockText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalDescription: {
    marginTop: 16,
    marginBottom: 16,
  },
  modalDescriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  modalDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  whatsappButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProductList;