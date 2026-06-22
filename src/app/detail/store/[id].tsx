// StoreDetailScreen.tsx - COMPLETO CORREGIDO
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
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import { useNews } from "../../../context/NewsContext";
import { useProducts } from "../../../context/ProductContext";
import { useShops } from "../../../context/ShopContext";

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();

  const {
    shops,
    loading: shopLoading,
    fetchShops,
  } = useShops();

  const {
    products,
    loading: productLoading,
    fetchProducts,
  } = useProducts();

  const {
    news,
    loading: newsLoading,
    fetchNews,
  } = useNews();

  const [activeTab, setActiveTab] = useState("sobre");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  // 🔥 Cargar datos
  useEffect(() => {
    fetchShops();
    fetchProducts();
    fetchNews();
  }, []);

  const loading = shopLoading || productLoading || newsLoading;

  /* =========================
     SHOP - CORREGIDO
  ========================= */
  const shop = useMemo(() => {
    console.log("🔍 Buscando tienda ID:", id);
    console.log("📦 shops recibido:", shops);
    
    if (!shops) {
      console.log("⚠️ shops es null o undefined");
      return null;
    }
    
    // 🔥 Extraer el array de datos correctamente
    let shopsArray = [];
    
    if (Array.isArray(shops)) {
      shopsArray = shops;
    } else if (shops?.data) {
      shopsArray = Array.isArray(shops.data) ? shops.data : [];
    } else if (shops?.data?.data) {
      shopsArray = Array.isArray(shops.data.data) ? shops.data.data : [];
    }
    
    console.log("📊 shopsArray:", shopsArray.length, "tiendas");
    
    const found = shopsArray.find((s) => Number(s.id) === Number(id));
    console.log("✅ Tienda encontrada:", found?.name || "❌ No encontrada");
    
    return found || null;
  }, [shops, id]);

  /* =========================
     PRODUCTOS - CORREGIDO
  ========================= */
  const shopProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    console.log("📦 products:", products.length);
    
    // Filtrar productos que pertenecen a esta tienda
    const filtered = products.filter(
      (item) =>
        Number(item.productable_id) === Number(id) &&
        item.productable_type === "App\\Models\\Shop"
    );
    
    console.log("📊 Productos de tienda:", filtered.length);
    return filtered;
  }, [products, id]);

  /* =========================
     NEWS - CORREGIDO
  ========================= */
  const shopNews = useMemo(() => {
    if (!news || !Array.isArray(news)) return [];
    
    console.log("📦 news:", news.length);
    
    const filtered = news.filter(
      (item) =>
        Number(item.newable_id) === Number(id) &&
        item.newable_type === "App\\Models\\Shop"
    );
    
    console.log("📊 Noticias de tienda:", filtered.length);
    return filtered;
  }, [news, id]);

  /* =========================
     RATING
  ========================= */
  const rating = useMemo(() => {
    if (!shop?.feedbacks?.length) return 0;
    const total = shop.feedbacks.reduce((acc, f) => acc + Number(f.rating), 0);
    return total / shop.feedbacks.length;
  }, [shop]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00B272" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>Cargando tienda...</Text>
      </View>
    );
  }

  /* =========================
     NOT FOUND
  ========================= */
  if (!shop) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: "#64748B" }}>Tienda no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{
              uri: shop.image || "https://picsum.photos/300",
            }}
            style={styles.image}
          />
          <Text style={styles.name}>{shop.name}</Text>
          <Text style={styles.city}>📍 {shop.city}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingBox}>
              <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>
              <Text style={styles.reviewText}>
                {shop.feedbacks?.length || 0} opiniones
              </Text>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["sobre", "productos", "posts", "feedbacks"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === "sobre"
                  ? "Sobre"
                  : tab === "productos"
                  ? "Productos"
                  : tab === "posts"
                  ? "Posts"
                  : "Opiniones"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SOBRE */}
        {activeTab === "sobre" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información</Text>
            <View style={styles.infoCard}>
              <Text style={styles.description}>
                {shop.description || "Sin descripción"}
              </Text>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Horario</Text>
                <Text style={styles.infoValue}>{shop.schedule || "No disponible"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{shop.phone || "No disponible"}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Propietario</Text>
                <Text style={styles.infoValue}>{shop.user?.name || "No disponible"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* PRODUCTOS */}
        {activeTab === "productos" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos ({shopProducts.length})</Text>
            {shopProducts.length === 0 && (
              <Text style={styles.emptyText}>No hay productos</Text>
            )}
            {shopProducts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedProduct(item);
                  setProductModalVisible(true);
                }}
              >
                <Image
                  source={{
                    uri: item.image || "https://picsum.photos/400",
                  }}
                  style={styles.newsImage}
                />
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardText}>{item.description}</Text>
                <View style={styles.priceBox}>
                  <Text style={styles.price}>S/ {Number(item.price).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* POSTS */}
        {activeTab === "posts" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posts ({shopNews.length})</Text>
            {shopNews.length === 0 && (
              <Text style={styles.emptyText}>No hay noticias</Text>
            )}
            {shopNews.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image
                  source={{
                    uri: item.url || "https://picsum.photos/400",
                  }}
                  style={styles.newsImage}
                />
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardText}>{item.descripcion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* FEEDBACKS */}
        {activeTab === "feedbacks" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opiniones</Text>
            {!shop.feedbacks || shop.feedbacks.length === 0 ? (
              <Text style={styles.emptyText}>No hay opiniones</Text>
            ) : (
              shop.feedbacks.map((f) => (
                <View key={f.id} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {f.user?.name || "Usuario"} ⭐ {f.rating}
                  </Text>
                  <Text style={styles.cardText}>{f.comment}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={productModalVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={[styles.card, { width: "90%" }]}>
            {selectedProduct && (
              <>
                <Image
                  source={{
                    uri: selectedProduct.image || "https://picsum.photos/400",
                  }}
                  style={styles.newsImage}
                />
                <Text style={styles.cardTitle}>{selectedProduct.name}</Text>
                <Text style={styles.cardText}>{selectedProduct.description}</Text>
                <View style={styles.priceBox}>
                  <Text style={styles.price}>S/ {Number(selectedProduct.price).toFixed(2)}</Text>
                </View>
                <Text style={{ textAlign: "center", marginTop: 12, color: "#64748B" }}>
                  Stock: {selectedProduct.stock}
                </Text>
              </>
            )}
            <TouchableOpacity onPress={() => setProductModalVisible(false)}>
              <Text style={styles.closeText}>Cerrar</Text>
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
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
    justifyContent: "space-between",
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#64748B",
    fontSize: 13,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
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