import React, {
  useState,
  useMemo,
  useEffect,
} from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useShops } from "../../../context/ShopContext";
import { useProducts } from "../../../context/ProductContext";
import { useNews } from "../../../context/NewsContext";

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();

  const {
    shops,
    loading,
    fetchShops,
  } = useShops();

  const {
    products,
    fetchLatestProducts,
  } = useProducts();

  const {
    news,
    fetchNews,
  } = useNews();

  const [activeTab, setActiveTab] =
    useState("sobre");

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const [
    productModalVisible,
    setProductModalVisible,
  ] = useState(false);

  useEffect(() => {
    fetchShops();
    fetchLatestProducts();
    fetchNews();
  }, []);

  /* =========================
     SHOP
  ========================= */

  const shop = useMemo(() => {
    if (!shops) return null;

    const shopsArray = Array.isArray(
      shops
    )
      ? shops
      : shops.data || [];

    return shopsArray.find(
      (s) =>
        Number(s.id) === Number(id)
    );
  }, [shops, id]);

  /* =========================
     PRODUCTS
  ========================= */

  const shopProducts =
    useMemo(() => {
      if (!products) return [];

      return products.filter(
        (p) =>
          Number(
            p.productable_id
          ) === Number(id)
      );
    }, [products, id]);

  /* =========================
     NEWS
  ========================= */

  const shopNews = useMemo(() => {
    if (!news) return [];

    return news.filter(
      (item) =>
        Number(
          item.newable_id
        ) === Number(id) &&
        item.newable_type ===
          "App\\Models\\Shop"
    );
  }, [news, id]);

  /* =========================
     RATING
  ========================= */

  const rating = useMemo(() => {
    if (!shop?.feedbacks?.length)
      return 0;

    const total =
      shop.feedbacks.reduce(
        (acc, f) =>
          acc +
          Number(f.rating),
        0
      );

    return (
      total /
      shop.feedbacks.length
    );
  }, [shop]);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>
          Cargando tienda...
        </Text>
      </View>
    );
  }

  /* =========================
     NOT FOUND
  ========================= */

  if (!shop) {
    return (
      <View style={styles.center}>
        <Text>
          Tienda no encontrada
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <Image
            source={{
              uri:
                shop.image ||
                "https://picsum.photos/300",
            }}
            style={styles.image}
          />

          <Text style={styles.name}>
            {shop.name}
          </Text>

          <Text style={styles.city}>
            📍 {shop.city}
          </Text>

          {/* RATING */}

          <View
            style={
              styles.ratingContainer
            }
          >
            <View
              style={
                styles.ratingBox
              }
            >
              <Text
                style={
                  styles.rating
                }
              >
                ⭐{" "}
                {rating.toFixed(
                  1
                )}
              </Text>

              <Text
                style={
                  styles.reviewText
                }
              >
                {
                  shop.feedbacks
                    ?.length
                }{" "}
                opiniones
              </Text>
            </View>
          </View>
        </View>

        {/* =========================
            TABS
        ========================= */}

        <View style={styles.tabs}>
          {[
            "sobre",
            "productos",
            "posts",
            "feedbacks",
          ].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab ===
                  tab &&
                  styles.activeTab,
              ]}
              onPress={() =>
                setActiveTab(tab)
              }
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab ===
                    tab &&
                    styles.activeTabText,
                ]}
              >
                {tab === "sobre"
                  ? "Sobre"
                  : tab ===
                    "productos"
                  ? "Productos"
                  : tab ===
                    "posts"
                  ? "Posts"
                  : "Opiniones"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* =========================
            SOBRE
        ========================= */}

        {activeTab ===
          "sobre" && (
          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Información
            </Text>

            <View
              style={
                styles.infoCard
              }
            >
              <Text
                style={
                  styles.description
                }
              >
                {shop.description ||
                  "Sin descripción"}
              </Text>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Horario
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {shop.schedule ||
                    "No disponible"}
                </Text>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Teléfono
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {shop.phone ||
                    "No disponible"}
                </Text>
              </View>

              <View
                style={
                  styles.divider
                }
              />

              <View
                style={
                  styles.infoRow
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Propietario
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {shop.user?.name ||
                    "No disponible"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* =========================
            PRODUCTS
        ========================= */}

        {activeTab ===
          "productos" && (
          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Productos
            </Text>

            {shopProducts.length ===
              0 && (
              <Text
                style={
                  styles.emptyText
                }
              >
                No hay productos
              </Text>
            )}

            {shopProducts.map(
              (item) => (
                <TouchableOpacity
                  key={item.id}
                  style={
                    styles.card
                  }
                  activeOpacity={
                    0.9
                  }
                  onPress={() => {
                    setSelectedProduct(
                      item
                    );

                    setProductModalVisible(
                      true
                    );
                  }}
                >
                  <Image
                    source={{
                      uri:
                        item.image ||
                        "https://picsum.photos/400",
                    }}
                    style={
                      styles.newsImage
                    }
                  />

                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={
                      styles.cardText
                    }
                  >
                    {item.description}
                  </Text>

                  <View
                    style={
                      styles.priceBox
                    }
                  >
                    <Text
                      style={
                        styles.price
                      }
                    >
                      S/{" "}
                      {Number(
                        item.price
                      ).toFixed(
                        2
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* =========================
            NEWS
        ========================= */}

        {activeTab ===
          "posts" && (
          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Posts
            </Text>

            {shopNews.length ===
              0 && (
              <Text
                style={
                  styles.emptyText
                }
              >
                No hay noticias
              </Text>
            )}

            {shopNews.map(
              (item) => (
                <View
                  key={item.id}
                  style={
                    styles.card
                  }
                >
                  <Image
                    source={{
                      uri:
                        item.url ||
                        "https://picsum.photos/400",
                    }}
                    style={
                      styles.newsImage
                    }
                  />

                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {item.titulo}
                  </Text>

                  <Text
                    style={
                      styles.cardText
                    }
                  >
                    {
                      item.descripcion
                    }
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        {/* =========================
            FEEDBACKS
        ========================= */}

        {activeTab ===
          "feedbacks" && (
          <View
            style={styles.section}
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Opiniones
            </Text>

            {shop.feedbacks
              ?.length ===
              0 && (
              <Text
                style={
                  styles.emptyText
                }
              >
                No hay opiniones
              </Text>
            )}

            {shop.feedbacks?.map(
              (f) => (
                <View
                  key={f.id}
                  style={
                    styles.card
                  }
                >
                  <Text
                    style={
                      styles.cardTitle
                    }
                  >
                    {
                      f.user
                        ?.name
                    }{" "}
                    ⭐ {f.rating}
                  </Text>

                  <Text
                    style={
                      styles.cardText
                    }
                  >
                    {f.comment}
                  </Text>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* =========================
          MODAL
      ========================= */}

      <Modal
        visible={
          productModalVisible
        }
        transparent
        animationType="slide"
      >
        <View style={styles.modal}>
          <View
            style={[
              styles.card,
              {
                width: "90%",
              },
            ]}
          >
            {selectedProduct && (
              <>
                <Image
                  source={{
                    uri:
                      selectedProduct.image ||
                      "https://picsum.photos/400",
                  }}
                  style={
                    styles.newsImage
                  }
                />

                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {
                    selectedProduct.name
                  }
                </Text>

                <Text
                  style={
                    styles.cardText
                  }
                >
                  {
                    selectedProduct.description
                  }
                </Text>

                <View
                  style={
                    styles.priceBox
                  }
                >
                  <Text
                    style={
                      styles.price
                    }
                  >
                    S/{" "}
                    {Number(
                      selectedProduct.price
                    ).toFixed(
                      2
                    )}
                  </Text>
                </View>

                <Text
                  style={{
                    textAlign:
                      "center",
                    marginTop: 12,
                    color:
                      "#64748B",
                  }}
                >
                  Stock:{" "}
                  {
                    selectedProduct.stock
                  }
                </Text>
              </>
            )}

            <TouchableOpacity
              onPress={() =>
                setProductModalVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.closeText
                }
              >
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },

  image: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: "#00B272",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  city: {
    marginTop: 6,
    fontSize: 13,
    color: "#00B272",
    fontWeight: "500",
  },

  /* =========================
     RATING
  ========================= */

  ratingContainer: {
    alignItems: "center",
    marginTop: 12,
  },

  ratingBox: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  rating: {
    fontSize: 16,
    fontWeight: "700",
    color: "#047857",
  },

  reviewText: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  /* =========================
     TABS
  ========================= */

  tabs: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 20,
    marginBottom: 16,
    gap: 8,
  },

  tabButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#00B272",
  },

  tabText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  /* =========================
     SECTION
  ========================= */

  section: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  /* =========================
     INFO CARD
  ========================= */

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  description: {
    fontSize: 13,
    lineHeight: 22,
    color: "#475569",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },

  infoValue: {
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
    fontSize: 12,
    color: "#64748B",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
  },

  /* =========================
     CARD
  ========================= */

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  newsImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },

  cardText: {
    fontSize: 13,
    lineHeight: 22,
    color: "#475569",
    textAlign: "center",
  },

  /* =========================
     PRICE
  ========================= */

  priceBox: {
    marginTop: 14,
    alignSelf: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },

  price: {
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
  },

  /* =========================
     EMPTY
  ========================= */

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#64748B",
    fontSize: 13,
  },

  /* =========================
     MODAL
  ========================= */

  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      "rgba(0,0,0,0.4)",
    padding: 20,
  },

  closeText: {
    marginTop: 20,
    color: "#00B272",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
});