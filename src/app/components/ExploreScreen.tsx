import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useProducts } from "../../context/ProductContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const ExploreScreen = () => {
  const { products, loading, fetchProducts } = useProducts();
  const { darkMode } = useDarkMode();

  const colors = darkMode ? darkColors : lightColors;

  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;

    return products.filter((item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, products]);

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.card }]}
      onPress={() => openDetail(item)}
    >
      <Image
        source={{ uri: item.image || "https://picsum.photos/200" }}
        style={styles.productImage}
      />

      <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>

      <Text style={[styles.price, { color: colors.primary }]}>
        S/ {item.price}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Explorar Productos
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      )}

      {/* ================= MODAL DETALLE ================= */}

      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdropCenter}>
          <View style={[styles.detailModal, { backgroundColor: colors.card }]}>
            
            {/* CLOSE */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDetailModalVisible(false)}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>

            {selectedProduct && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {/* IMAGE */}
                <Image
                  source={{
                    uri: selectedProduct.image || "https://picsum.photos/400",
                  }}
                  style={styles.detailImage}
                />

                {/* NAME */}
                <Text style={[styles.detailTitle, { color: colors.text }]}>
                  {selectedProduct.name}
                </Text>

                {/* PRICE */}
                <Text style={[styles.detailPrice, { color: colors.primary }]}>
                  S/ {selectedProduct.price}
                </Text>

                {/* DESCRIPTION */}
                <Text
                  style={[
                    styles.detailDescription,
                    { color: colors.secondaryText },
                  ]}
                >
                  {selectedProduct.description || "Sin descripción"}
                </Text>

                {/* STORE */}
                <View style={styles.storeBadge}>
                  <Ionicons name="storefront" size={18} color="#00B272" />
                  <Text style={{ marginLeft: 8, color: colors.text }}>
                    {selectedProduct.productable?.name || "Tienda"}
                  </Text>
                </View>

                {/* ================= WHATSAPP ================= */}

                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => {
                      const phone = "51999999999"; // cambia tu número real
                      const message = `Hola, me interesa el producto: ${selectedProduct.name} - S/ ${selectedProduct.price}`;

                      const url = `https://wa.me/${phone}?text=${encodeURIComponent(
                        message
                      )}`;

                      Linking.openURL(url);
                    }}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                    <Text style={styles.buyButtonText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExploreScreen;

/* ================= COLORS ================= */

const lightColors = {
  background: "#fff",
  card: "#fff",
  text: "#222",
  primary: "#00B272",
  secondaryText: "#666",
};

const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#fff",
  primary: "#22C55E",
  secondaryText: "#aaa",
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  productCard: {
    flex: 1,
    margin: 6,
    padding: 10,
    borderRadius: 14,
  },

  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },

  productName: {
    marginTop: 8,
    fontWeight: "700",
  },

  price: {
    marginTop: 6,
    fontWeight: "700",
  },

  /* MODAL */

  modalBackdropCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  detailModal: {
    width: "90%",
    maxHeight: "85%",
    borderRadius: 24,
    padding: 20,
  },

  closeButton: {
    alignSelf: "flex-end",
  },

  detailImage: {
    width: "100%",
    height: 200,
    borderRadius: 18,
    marginBottom: 16,
  },

  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  detailPrice: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  detailDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 22,
  },

  storeBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 10,
    borderRadius: 12,
  },

  /* WHATSAPP */

  actionContainer: {
    marginTop: 20,
  },

  whatsappButton: {
    backgroundColor: "#25D366",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buyButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
});