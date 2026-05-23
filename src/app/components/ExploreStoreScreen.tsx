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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useProducts } from "../../context/ProductContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const ExploreStoreScreen = () => {
  const { products, loading, fetchProducts } =
    useProducts();

  /* ================================
     DARK MODE
  ================================= */

  const { darkMode } = useDarkMode();

  const colors = darkMode
    ? darkColors
    : lightColors;

  /* ================================
     STATES
  ================================= */

  const [searchText, setSearchText] =
    useState("");

  const [modalVisible, setModalVisible] =
    useState(false);

  const [
    detailModalVisible,
    setDetailModalVisible,
  ] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<any>(null);

  /* ================================
     FETCH PRODUCTS
  ================================= */

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================================
     FILTER PRODUCTS
  ================================= */

  const filteredProducts = useMemo(() => {
    if (!searchText) return products;

    return products.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, products]);

  /* ================================
     OPEN DETAIL
  ================================= */

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  /* ================================
     PRODUCT CARD
  ================================= */

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        {
          backgroundColor: colors.card,
        },
      ]}
      activeOpacity={0.85}
      onPress={() => openDetail(item)}
    >
      <Image
        source={{
          uri:
            item.image ||
            "https://picsum.photos/200",
        }}
        style={styles.productImage}
      />

      <Text
        style={[
          styles.badge,
          {
            backgroundColor:
              colors.badgeBackground,
            color: colors.primary,
          },
        ]}
      >
        {item.productable?.name ||
          "Producto"}
      </Text>

      <Text
        style={[
          styles.productName,
          { color: colors.text },
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>

      <Text
        style={[
          styles.description,
          { color: colors.subText },
        ]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <Text
        style={[
          styles.price,
          { color: colors.primary },
        ]}
      >
        S/ {item.price}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* TITLE */}

      <Text
        style={[
          styles.title,
          { color: colors.title },
        ]}
      >
        Explorar Productos
      </Text>

      {/* SEARCH */}

      <TouchableOpacity
        style={[
          styles.searchContainer,
          {
            backgroundColor:
              colors.inputBackground,
          },
        ]}
        activeOpacity={0.9}
        onPress={() =>
          setModalVisible(true)
        }
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.icon}
        />

        <Text
          style={[
            styles.searchPlaceholder,
            {
              color:
                colors.placeholder,
            },
          ]}
        >
          Buscar productos...
        </Text>
      </TouchableOpacity>

      {/* PRODUCTS */}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.id.toString()
          }
          numColumns={2}
          columnWrapperStyle={{
            justifyContent:
              "space-between",
          }}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 30,
          }}
        />
      )}

      {/* ================================
          SEARCH MODAL
      ================================= */}

      <Modal
        visible={modalVisible}
        animationType="slide"
      >
        <SafeAreaView
          style={[
            styles.searchModalContainer,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >
          {/* HEADER */}

          <View
            style={
              styles.searchModalHeader
            }
          >
            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor:
                    colors.inputBackground,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={colors.icon}
              />

              <TextInput
                placeholder="Buscar productos..."
                placeholderTextColor={
                  colors.placeholder
                }
                style={[
                  styles.searchInput,
                  {
                    color:
                      colors.text,
                  },
                ]}
                value={searchText}
                onChangeText={
                  setSearchText
                }
                autoFocus
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchText("");
              }}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          {/* RESULTS */}

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) =>
              item.id.toString()
            }
            numColumns={2}
            showsVerticalScrollIndicator={
              false
            }
            columnWrapperStyle={{
              justifyContent:
                "space-between",
            }}
            contentContainerStyle={{
              paddingBottom: 30,
              paddingTop: 10,
            }}
            ListEmptyComponent={
              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.subText,
                  },
                ]}
              >
                No se encontraron
                productos
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalProductCard,
                  {
                    backgroundColor:
                      colors.card,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  openDetail(item)
                }
              >
                <Image
                  source={{
                    uri:
                      item.image ||
                      "https://picsum.photos/200",
                  }}
                  style={
                    styles.modalProductImage
                  }
                />

                <Text
                  style={[
                    styles.modalBadge,
                    {
                      backgroundColor:
                        colors.badgeBackground,
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {item.productable
                    ?.name || "Producto"}
                </Text>

                <Text
                  style={[
                    styles.modalProductName,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.modalDescription,
                    {
                      color:
                        colors.subText,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                <Text
                  style={[
                    styles.modalProductPrice,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  S/ {item.price}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* ================================
          DETAIL MODAL
      ================================= */}

      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
      >
        <View
          style={styles.detailOverlay}
        >
          <View
            style={[
              styles.detailContainer,
              {
                backgroundColor:
                  colors.card,
              },
            ]}
          >
            {/* CLOSE */}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setDetailModalVisible(
                  false
                )
              }
            >
              <Ionicons
                name="close"
                size={26}
                color={colors.text}
              />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {/* IMAGE */}

              <Image
                source={{
                  uri:
                    selectedProduct?.image ||
                    "https://picsum.photos/400",
                }}
                style={
                  styles.detailImage
                }
              />

              {/* BADGE */}

              <View
                style={[
                  styles.detailBadge,
                  {
                    backgroundColor:
                      colors.badgeBackground,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      colors.primary,
                    fontWeight:
                      "700",
                    fontSize: 12,
                  }}
                >
                  {selectedProduct
                    ?.productable
                    ?.name ||
                    "Producto"}
                </Text>
              </View>

              {/* NAME */}

              <Text
                style={[
                  styles.detailName,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  selectedProduct?.name
                }
              </Text>

              {/* PRICE */}

              <Text
                style={[
                  styles.detailPrice,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                S/{" "}
                {
                  selectedProduct?.price
                }
              </Text>

              {/* RATING */}

              <View
                style={
                  styles.ratingContainer
                }
              >
                <Ionicons
                  name="star"
                  size={18}
                  color="#f39c12"
                />

                <Text
                  style={[
                    styles.detailRating,
                    {
                      color:
                        colors.subText,
                    },
                  ]}
                >
                  5.0
                </Text>
              </View>

              {/* DESCRIPTION */}

              <Text
                style={[
                  styles.detailDescription,
                  {
                    color:
                      colors.subText,
                  },
                ]}
              >
                {
                  selectedProduct?.description
                }
              </Text>

              {/* STOCK */}

              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor:
                      colors.badgeBackground,
                  },
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={16}
                  color={
                    colors.primary
                  }
                />

                <Text
                  style={{
                    color:
                      colors.primary,
                    marginLeft: 6,
                    fontWeight:
                      "700",
                  }}
                >
                  Stock:{" "}
                  {
                    selectedProduct?.stock
                  }
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExploreStoreScreen;

/* ================================
   COLORS
================================ */

const lightColors = {
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#222222",
  subText: "#666666",
  title: "#124E2C",
  primary: "#00B272",
  inputBackground: "#F3F3F3",
  placeholder: "#999999",
  icon: "#777777",
  badgeBackground: "#E6F6EF",
};

const darkColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#FFFFFF",
  subText: "#B0B0B0",
  title: "#4ADE80",
  primary: "#22C55E",
  inputBackground: "#2A2A2A",
  placeholder: "#888888",
  icon: "#CCCCCC",
  badgeBackground: "#1F3A2E",
};

/* ================================
   STYLES
================================ */

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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 18,
  },

  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
  },

  productCard: {
    width: "48%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    marginBottom: 8,
  },

  badge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  productName: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },

  description: {
    fontSize: 12,
    marginTop: 4,
  },

  price: {
    marginTop: 8,
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },

  searchModalContainer: {
    flex: 1,
    padding: 16,
  },

  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },

  cancelText: {
    marginLeft: 12,
    fontWeight: "600",
  },

  modalProductCard: {
    width: "48%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  modalProductImage: {
    width: "100%",
    height: 120,
    borderRadius: 14,
    marginBottom: 8,
  },

  modalBadge: {
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  modalProductName: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },

  modalDescription: {
    fontSize: 12,
    marginTop: 4,
  },

  modalProductPrice: {
    marginTop: 8,
    fontWeight: "700",
  },

  /* DETAIL MODAL */

  detailOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  detailContainer: {
    height: "85%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },

  detailImage: {
    width: "100%",
    height: 260,
    borderRadius: 24,
  },

  detailBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
  },

  detailName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 14,
  },

  detailPrice: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  detailRating: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
  },

  detailDescription: {
    marginTop: 18,
    fontSize: 14,
    lineHeight: 24,
  },

  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
});