import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useAssociations } from "../../../context/AssociationContext";

export default function AssociationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { fetchAssociationById } = useAssociations();

  const [association, setAssociation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("perfil");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadAssociation = async () => {
      const associationId = Array.isArray(id) ? id[0] : id;

      const data = await fetchAssociationById(
        Number(associationId)
      );

      if (data) setAssociation(data);

      setLoading(false);
    };

    if (id) loadAssociation();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#00B272"
        />
      </View>
    );
  }

  if (!association) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la asociación</Text>
      </View>
    );
  }

  const rating =
    association.feedbacks?.reduce(
      (sum: number, f: any) =>
        sum + f.rating,
      0
    ) /
    (association.feedbacks?.length || 1);

  /* =========================
     TAB CONTENT
  ========================= */

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil":
        return (
          <View style={styles.section}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                Descripción
              </Text>

              <Text style={styles.description}>
                {association.description ||
                  "Sin descripción disponible"}
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>
                Información
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  📍 Ciudad
                </Text>

                <Text style={styles.infoValue}>
                  {association.city || "-"}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  📞 Teléfono
                </Text>

                <Text style={styles.infoValue}>
                  {association.phone || "-"}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  🌐 Website
                </Text>

                <Text style={styles.infoValue}>
                  {association.website || "-"}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  🏠 Dirección
                </Text>

                <Text style={styles.infoValue}>
                  {association.address || "-"}
                </Text>
              </View>
            </View>
          </View>
        );

     case "posts":
  return (
    <View style={styles.section}>
      {association.posts?.length ? (
        association.posts.map((item: any) => (
          <View
            key={item.id}
            style={styles.card}
          >
            {/* POST IMAGE */}
            <Image
              source={{
                uri:
                  item.image ||
                  "https://picsum.photos/400",
              }}
              style={styles.newsImage}
            />

            {/* POST TITLE */}
            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

            {/* POST CONTENT */}
            <Text style={styles.cardText}>
              {item.short_content ||
                item.content}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>
          No hay publicaciones disponibles
        </Text>
      )}
    </View>
  );

      case "productos":
        return (
          <View style={styles.section}>
            {association.products?.length ? (
              association.products.map(
                (item: any) => (
                  <View
                    key={item.id}
                    style={styles.card}
                  >
                    {item.image ? (
                      <Image
                        source={{
                          uri: item.image,
                        }}
                        style={styles.newsImage}
                      />
                    ) : null}

                    <Text
                      style={styles.cardTitle}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={styles.cardText}
                    >
                      {item.description}
                    </Text>

                    <View
                      style={styles.priceBox}
                    >
                      <Text style={styles.price}>
                        ${item.price}
                      </Text>
                    </View>
                  </View>
                )
              )
            ) : (
              <Text style={styles.emptyText}>
                No hay productos disponibles
              </Text>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={[1]}
        keyExtractor={() => "main"}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
          <View style={{ paddingBottom: 30 }}>
            {renderTabContent()}
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* HEADER */}
            <View style={styles.header}>
              <Image
                source={{
                  uri:
                    association.image ||
                    "https://picsum.photos/200",
                }}
                style={styles.image}
              />

              <Text style={styles.name}>
                {association.name}
              </Text>

              <Text style={styles.city}>
                📍 {association.city}
              </Text>
            </View>

            {/* RATING */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.rating}>
                  ⭐ {rating.toFixed(1)}
                </Text>

                <Text style={styles.reviewText}>
                  {association.feedbacks
                    ?.length || 0}{" "}
                  reviews
                </Text>
              </View>
            </View>

            {/* TABS */}
            <View style={styles.tabs}>
              {[
                "perfil",
                "posts",
                "productos",
              ].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() =>
                    setActiveTab(tab)
                  }
                  style={[
                    styles.tabButton,
                    activeTab === tab &&
                      styles.activeTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab &&
                        styles.activeTabText,
                    ]}
                  >
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text>Modal content</Text>

          <TouchableOpacity
            onPress={() =>
              setModalVisible(false)
            }
          >
            <Text style={styles.closeText}>
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
   STYLES
========================= */

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
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  closeText: {
    marginTop: 20,
    color: "#00B272",
    fontWeight: "700",
    fontSize: 15,
  },
});