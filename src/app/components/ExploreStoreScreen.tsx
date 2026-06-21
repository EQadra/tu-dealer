import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useProducts } from "../../context/ProductContext";
import { useDarkMode } from "../../context/app/DarkModeContext";

const ExploreStoreScreen = () => {
  const {
    products,
    loading,
    fetchProducts,
  } = useProducts();

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

  const [selectedSearch, setSelectedSearch] =
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
    if (!searchText.trim())
      return products;

    return products.filter((item) => {
      const text =
        searchText.toLowerCase();

      return (
        item.name
          ?.toLowerCase()
          .includes(text) ||
        item.description
          ?.toLowerCase()
          .includes(text) ||
        item.productable?.name
          ?.toLowerCase()
          .includes(text)
      );
    });
  }, [searchText, products]);

  /* ================================
     OPEN DETAIL
  ================================= */

  const openDetail = (product: any) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  /* ================================
     RENDER PRODUCTS GRID CON VIEW + MAP
  ================================= */

  const renderProductsGrid = (productList: any[], isModal: boolean = false) => {
    const rows = [];
    const itemsPerRow = 2;

    for (let i = 0; i < productList.length; i += itemsPerRow) {
      const rowItems = productList.slice(i, i + itemsPerRow);
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={[
                isModal ? styles.modalProductCard : styles.productCard,
                {
                  backgroundColor: colors.card,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => {
                if (isModal) {
                  setSelectedSearch(item.name);
                  setModalVisible(false);
                  openDetail(item);
                } else {
                  openDetail(item);
                }
              }}
            >
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://picsum.photos/200",
                }}
                style={isModal ? styles.modalProductImage : styles.productImage}
              />

              <Text
                style={[
                  isModal ? styles.modalBadge : styles.badge,
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
                  isModal ? styles.modalProductName : styles.productName,
                  { color: colors.text },
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              <Text
                style={[
                  isModal ? styles.modalDescription : styles.description,
                  { color: colors.subText },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>

              <Text
                style={[
                  isModal ? styles.modalProductPrice : styles.price,
                  { color: colors.primary },
                ]}
              >
                S/ {item.price}
              </Text>
            </TouchableOpacity>
          ))}
          {rowItems.length === 1 && <View style={styles.emptyCard} />}
        </View>
      );
    }
    return rows;
  };

  /* ================================
     HEADER
  ================================= */

  const renderHeader = () => (
    <>
      <Text
        style={[
          styles.title,
          { color: colors.title },
        ]}
      >
        Explorar Productos
      </Text>

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
              color: selectedSearch
                ? colors.text
                : colors.placeholder,
            },
          ]}
          numberOfLines={1}
        >
          {selectedSearch ||
            "Buscar productos..."}
        </Text>

        {selectedSearch ? (
          <TouchableOpacity
            onPress={() => {
              setSelectedSearch("");
              setSearchText("");
            }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* HEADER */}
      {renderHeader()}

      {/* PRODUCTS - View + map en lugar de FlatList */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsContainer}
        >
          {products.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.subText,
                },
              ]}
            >
              No hay productos disponibles
            </Text>
          ) : (
            renderProductsGrid(products, false)
          )}
        </ScrollView>
      )}

      {/* ================================
          SEARCH MODAL
      ================================= */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <SafeAreaView
          edges={["top"]}
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

              {searchText.length >
                0 && (
                <TouchableOpacity
                  onPress={() =>
                    setSearchText("")
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              )}
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

          {/* RESULTS - View + map en lugar de FlatList */}
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchResultsContainer}
          >
            {filteredProducts.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors.subText,
                  },
                ]}
              >
                No se encontraron productos
              </Text>
            ) : (
              renderProductsGrid(filteredProducts, true)
            )}
          </ScrollView>
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

            {/* DETAIL CONTENT */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailContent}
            >
              {selectedProduct && (
                <>
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
                </>
              )}
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
    paddingHorizontal: 16,
  },

  scrollContainer: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 10,
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
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },

  productsContainer: {
    paddingBottom: 30,
  },

  searchResultsContainer: {
    paddingBottom: 30,
    paddingTop: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  emptyCard: {
    width: "48%",
  },

  productCard: {
    width: "48%",
    padding: 12,
    borderRadius: 18,

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
    fontSize: 14,
  },

  searchModalContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
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

  detailContent: {
    paddingBottom: 40,
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