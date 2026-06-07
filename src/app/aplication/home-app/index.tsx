import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { Ionicons } from "@expo/vector-icons";

import { Link } from "expo-router";

import { useRouter } from "expo-router";

import { useAuth } from "../../../context/AuthContext";

import { useProducts } from "../../../context/ProductContext";

import { useDarkMode } from "../../../context/app/DarkModeContext";

import NewsFeed from "../../components/NewsFeed";

const { width } = Dimensions.get("window");

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  item,
  onPress,
  colors,
  darkMode,
}: any) {
  return (
    <TouchableOpacity
      style={styles.productWrapper}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      <View
        style={[
          styles.proCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{
            uri:
              item.image ||
              item.productable?.image ||
              "https://picsum.photos/200",
          }}
          style={styles.proImage}
        />

        <View style={styles.proContent}>
          <Text
            style={[
              styles.proTitle,
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={[
              styles.proDescription,
              {
                color: colors.secondaryText,
              },
            ]}
            numberOfLines={2}
          >
            {item.description ||
              "Sin descripción"}
          </Text>

          <Text
            style={{
              color: darkMode
                ? "#4ADE80"
                : "#00B272",
              fontWeight: "700",
              marginTop: 6,
              fontSize: 15,
            }}
          >
            ${item.price}
          </Text>

          <Text
            style={{
              fontSize: 11,
              color: colors.secondaryText,
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {item.productable?.name ||
              "Tienda"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   HOME SCREEN
========================================================= */

export default function HomeScreen() {
  const router = useRouter();

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode
      ? "#020617"
      : "#f0f9f4",

    card: darkMode
      ? "#0F172A"
      : "#ffffff",

    text: darkMode
      ? "#F8FAFC"
      : "#222222",

    secondaryText: darkMode
      ? "#94A3B8"
      : "#555555",

    border: darkMode
      ? "#1E293B"
      : "#eeeeee",

    input: darkMode
      ? "#1E293B"
      : "#ffffff",

    modal: darkMode
      ? "#0F172A"
      : "#ffffff",
  };

  const { user } = useAuth();

  const {
    products,
    fetchLatestProducts,
  } = useProducts();

  const carouselItems = [
    {
      id: "1",
      title: "Doctor",
      image: require(
        "../../../../assets/home/doctor.png"
      ),
      href: "/lists/doctor",
    },

    {
      id: "2",
      title: "Tienda",
      image: require(
        "../../../../assets/home/store.png"
      ),
      href: "/lists/store",
    },

    {
      id: "3",
      title: "Asociación",
      image: require(
        "../../../../assets/home/asociation.png"
      ),
      href: "/lists/asociation",
    },

    {
      id: "4",
      title: "Abogado",
      image: require(
        "../../../../assets/home/lawyer.png"
      ),
      href: "/lists/lawyer",
    },
  ];

  /* ================================
     PRODUCT DETAIL
  ================================= */

  const [detailVisible, setDetailVisible] =
    useState(false);

  const [selectedItem, setSelectedItem] =
    useState<any>(null);

  /* ================================
     SEARCH
  ================================= */

  const [
    searchModalVisible,
    setSearchModalVisible,
  ] = useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [filteredProducts, setFilteredProducts] =
    useState<any[]>([]);

  /* ================================
     FETCH
  ================================= */

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  /* ================================
     FILTER PRODUCTS
  ================================= */

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredProducts(
        products || []
      );

      return;
    }

    const filtered = products.filter(
      (product: any) =>
        product.name
          ?.toLowerCase()
          .includes(
            searchText.toLowerCase()
          )
    );

    setFilteredProducts(filtered);
  }, [searchText, products]);

  /* ================================
     DETAIL
  ================================= */

  const openDetail = (item: any) => {
    setSelectedItem(item);

    setDetailVisible(true);
  };

  const closeDetail = () => {
    setSelectedItem(null);

    setDetailVisible(false);
  };

const avatar = useMemo(() => {
  if (!user?.profile) {
    return "https://i.pravatar.cc/150";
  }

  return user.profile.image_url
    ? `${user.profile.image_url}?t=${Date.now()}`
    : "https://i.pravatar.cc/150";
}, [user]);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* HEADER */}

      <LinearGradient
        colors={
          darkMode
            ? ["#0F172A", "#020617"]
            : ["#00B272", "#00994C"]
        }
        style={styles.header}
      >
        <View>
          <Text
            style={[
              styles.title,
              { color: "#fff" },
            ]}
          >
            Hola,{" "}
            {user?.name ?? "Usuario"} 👋
          </Text>

          <Text style={styles.subtitle}>
            Bienvenido de nuevo
          </Text>
        </View>

        <TouchableOpacity>
         <Image
          source={{
            uri:
              user?.profile?.image_url
                ? `${user.profile.image_url}?t=${Date.now()}`
                : "https://i.pravatar.cc/150",
          }}
          style={styles.avatar}
        />
        </TouchableOpacity>
      </LinearGradient>

      {/* CONTENT */}

      <FlatList
        data={products}
        keyExtractor={(item) =>
          item.id.toString()
        }
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent:
            "space-between",
          paddingHorizontal: 16,
        }}
        ListHeaderComponent={
          <>
            {/* CARRUSEL */}

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              ¿A quién desea visitar hoy?
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingHorizontal: 16,
              }}
            >
              {carouselItems.map((item) => (
                <AnimatedCard
                  key={item.id}
                  item={item}
                />
              ))}
            </ScrollView>

            {/* PRODUCTOS */}

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              Productos
            </Text>

            {/* SEARCH */}

            <TouchableOpacity
              style={[
                styles.searchBox,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,
                },
              ]}
              onPress={() =>
                setSearchModalVisible(
                  true
                )
              }
            >
              <Ionicons
                name="search"
                size={20}
                color={
                  darkMode
                    ? "#94A3B8"
                    : "#777"
                }
              />

              <Text
                style={{
                  marginLeft: 10,
                  color: darkMode
                    ? "#94A3B8"
                    : "#777",
                }}
              >
                Buscar productos...
              </Text>
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={openDetail}
            colors={colors}
            darkMode={darkMode}
          />
        )}
        ListFooterComponent={
          <View style={{ marginTop: 10 }}>
            <NewsFeed />
          </View>
        }
      />

      {/* SEARCH MODAL */}

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.searchModal,
              {
                backgroundColor:
                  colors.modal,
              },
            ]}
          >
            <View style={styles.searchHeader}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                }}
              >
                Buscar Productos
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSearchModalVisible(
                    false
                  );

                  setSearchText("");
                }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchInputContainer,
                {
                  backgroundColor:
                    colors.input,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={
                  darkMode
                    ? "#94A3B8"
                    : "#777"
                }
              />

              <TextInput
                placeholder="Buscar productos..."
                placeholderTextColor={
                  darkMode
                    ? "#94A3B8"
                    : "#777"
                }
                value={searchText}
                onChangeText={
                  setSearchText
                }
                style={{
                  flex: 1,
                  marginLeft: 10,
                  color: colors.text,
                }}
              />
            </View>

            <FlatList
              data={filteredProducts}
              keyExtractor={(item) =>
                item.id.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.searchItem,
                    {
                      backgroundColor:
                        colors.card,

                      borderColor:
                        colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSearchModalVisible(
                      false
                    );

                    openDetail(item);
                  }}
                >
                  <Image
                    source={{
                      uri:
                        item.image ||
                        "https://picsum.photos/200",
                    }}
                    style={
                      styles.searchItemImage
                    }
                  />

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: "700",
                      }}
                    >
                      {item.name}
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={{
                        color:
                          colors.secondaryText,

                        fontSize: 12,

                        marginTop: 4,
                      }}
                    >
                      {item.description}
                    </Text>

                    <Text
                      style={{
                        color: "#00B272",

                        fontWeight: "700",

                        marginTop: 6,
                      }}
                    >
                      ${item.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

{/* PRODUCT DETAIL */}

<Modal
  visible={detailVisible}
  animationType="fade"
  transparent
>
  <View style={styles.modalBackdropCenter}>
    <View
      style={[
        styles.detailModal,
        {
          backgroundColor:
            colors.modal,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.closeButton}
        onPress={closeDetail}
      >
        <Ionicons
          name="close"
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>

      {selectedItem && (
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
        >
          <Image
            source={{
              uri:
                selectedItem.image ||
                "https://picsum.photos/400",
            }}
            style={styles.detailImage}
          />

          <Text
            style={[
              styles.detailTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {selectedItem.name}
          </Text>

          <Text
            style={[
              styles.detailPrice,
              {
                color: darkMode
                  ? "#4ADE80"
                  : "#00B272",
              },
            ]}
          >
            ${selectedItem.price}
          </Text>

          <Text
            style={[
              styles.detailDescription,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {selectedItem.description ||
              "Sin descripción"}
          </Text>

          <View
            style={[
              styles.storeBadge,
              {
                backgroundColor:
                  darkMode
                    ? "#1E293B"
                    : "#f0fdf4",
              },
            ]}
          >
            <Ionicons
              name="storefront"
              size={18}
              color="#00B272"
            />

            <Text
              style={{
                marginLeft: 8,
                color: colors.text,
                fontWeight: "600",
              }}
            >
              {selectedItem
                .productable?.name ||
                "Tienda"}
            </Text>
          </View>

          {/* BOTONES */}

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.whatsappButton}
            >
              <Ionicons
                name="logo-whatsapp"
                size={20}
                color="#fff"
              />

              <Text
                style={
                  styles.buyButtonText
                }
              >
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  </View>
</Modal>
    </View>
  );
}

/* =========================================================
   ANIMATED CARD
========================================================= */

function AnimatedCard({ item }: any) {
  const scale =
    new Animated.Value(1);

  return (
    <Link href={item.href} asChild>
      <Pressable>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale }],
            },
          ]}
        >
          <Image
            source={item.image}
            style={styles.cardImage}
          />

          <LinearGradient
            colors={[
              "rgba(0,0,0,0.25)",
              "rgba(0,0,0,0.6)",
            ]}
            style={styles.overlay}
          >
            <Text
              style={
                styles.overlayText
              }
            >
              {item.title}
            </Text>

            <Ionicons
              name="arrow-forward-circle"
              size={24}
              color="#fff"
            />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Link>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,

    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    color: "#e6f9ef",
    fontSize: 14,
    marginTop: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
    margin: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
    marginLeft: 20,
  },

  card: {
    width: width * 0.45,
    height: 220,
    borderRadius: 18,
    marginRight: 18,
    marginTop: 8,
    marginBottom: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
    padding: 10,
  },

  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    resizeMode: "cover",
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    padding: 12,
  },

  overlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  productWrapper: {
    width: "48%",
    marginBottom: 16,
  },

  proCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },

  proImage: {
    width: "100%",
    height: 150,
  },

  proContent: {
    padding: 10,
  },

  proTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  proDescription: {
    fontSize: 12,
    marginTop: 4,
  },

  searchBox: {
    marginHorizontal: 16,
    marginBottom: 18,

    borderWidth: 1,

    borderRadius: 14,

    paddingHorizontal: 14,
    paddingVertical: 14,

    flexDirection: "row",

    alignItems: "center",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  searchModal: {
    flex: 1,
    marginTop: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },

  searchHeader: {
    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 16,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,

    borderRadius: 14,

    paddingHorizontal: 14,

    marginBottom: 20,

    height: 50,
  },

  searchItem: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },

  searchItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },

  detailModal: {
    maxHeight: "92%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },

  detailImage: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    marginBottom: 20,
  },

  detailTitle: {
    fontSize: 24,
    fontWeight: "700",
  },

  detailPrice: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },

  detailDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
  },

  storeBadge: {
    marginTop: 20,
    padding: 12,
    borderRadius: 14,

    flexDirection: "row",

    alignItems: "center",
  },

  buyButton: {
    marginTop: 24,
    backgroundColor: "#00B272",
    borderRadius: 16,
    paddingVertical: 14,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
  },

  buyButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 16,
  },
  modalBackdropCenter: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
},

detailModal: {
  width: "90%",
  height: "60%",
  borderRadius: 28,
  padding: 20,
},

detailImage: {
  width: "100%",
  height: 200,
  borderRadius: 20,
  marginBottom: 16,
},

actionContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 24,
},

buyButton: {
  flex: 1,
  marginRight: 8,
  backgroundColor: "#00B272",
  borderRadius: 16,
  paddingVertical: 14,

  alignItems: "center",
  justifyContent: "center",

  flexDirection: "row",
},

whatsappButton: {
  flex: 1,
  marginLeft: 8,
  backgroundColor: "#25D366",
  borderRadius: 16,
  paddingVertical: 14,

  alignItems: "center",
  justifyContent: "center",

  flexDirection: "row",
},
});