import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useLawyers } from "../../../context/LawyerContext";

export default function LawyerDetailScreen() {
  const { id } = useLocalSearchParams();

  const {
    lawyer,
    fetchLawyerById,
    loading,
    error,
  } = useLawyers();

  const [activeTab, setActiveTab] =
    useState("sobre");

  const [modalVisible, setModalVisible] =
    useState(false);

  useEffect(() => {
    if (id) {
      fetchLawyerById(Number(id));
    }
  }, [id]);

  const rating = useMemo(() => {
    if (!lawyer?.feedbacks?.length) return 0;

    const total =
      lawyer.feedbacks.reduce(
        (acc, f) =>
          acc + Number(f.rating),
        0
      );

    return (
      total /
      lawyer.feedbacks.length
    );
  }, [lawyer]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>
          Cargando abogado...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.center}>
        <Text>
          Abogado no encontrado
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
        {/* HEADER */}
        <View style={styles.card}>
          <Image
            source={{
              uri:
                lawyer.image ||
                "https://picsum.photos/400",
            }}
            style={styles.image}
          />

          <Text style={styles.name}>
            {lawyer.first_name}{" "}
            {lawyer.last_name}
          </Text>

          <Text
            style={
              styles.specialty
            }
          >
            {lawyer.specialty}
          </Text>

          <Text style={styles.sub}>
            Código:{" "}
            {lawyer.license_code}
          </Text>

          <Text style={styles.sub}>
            📍 {lawyer.city}
          </Text>

          <Text style={styles.sub}>
            🎓{" "}
            {lawyer.university}
          </Text>

          <Text style={styles.sub}>
            👤{" "}
            {lawyer.user?.name}
          </Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {[
            "sobre",
            "posts",
            "feedbacks",
            "services",
          ].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab ===
                  tab &&
                  styles.tabActive,
              ]}
              onPress={() =>
                setActiveTab(tab)
              }
            >
              <Text
                style={
                  activeTab ===
                  tab
                    ? styles.tabTextActive
                    : styles.tabText
                }
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SOBRE */}
        {activeTab ===
          "sobre" && (
          <View style={styles.card}>
            <Text
              style={
                styles.title
              }
            >
              Descripción
            </Text>

            <Text
              style={
                styles.text
              }
            >
              {
                lawyer.description
              }
            </Text>

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
          </View>
        )}

        {/* POSTS */}
        {activeTab ===
          "posts" && (
          <View>
            {lawyer.posts?.map(
              (post) => (
                <View
                  key={
                    post.id
                  }
                  style={
                    styles.card
                  }
                >
                  <Text
                    style={
                      styles.title
                    }
                  >
                    {
                      post.title
                    }
                  </Text>

                  <Text
                    style={
                      styles.text
                    }
                  >
                    {post.short_content ||
                      post.content}
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        {/* FEEDBACKS */}
        {activeTab ===
          "feedbacks" && (
          <View>
            {lawyer.feedbacks?.map(
              (f) => (
                <View
                  key={f.id}
                  style={
                    styles.card
                  }
                >
                  <Text
                    style={
                      styles.rating
                    }
                  >
                    ⭐{" "}
                    {
                      f.rating
                    }
                  </Text>

                  <Text
                    style={
                      styles.text
                    }
                  >
                    {
                      f.comment
                    }
                  </Text>
                </View>
              )
            )}
          </View>
        )}

        {/* SERVICES */}
        {activeTab ===
          "services" && (
          <View style={styles.card}>
            <Text
              style={
                styles.title
              }
            >
              Servicios
            </Text>

            {lawyer.services
              ?.slice(0, 2)
              .map((s) => (
                <View
                  key={s.id}
                  style={
                    styles.serviceCard
                  }
                >
                  <Text
                    style={
                      styles.title
                    }
                  >
                    {s.name}
                  </Text>

                  <Text
                    style={
                      styles.text
                    }
                  >
                    {
                      s.description
                    }
                  </Text>

                  <Text
                    style={
                      styles.price
                    }
                  >
                    S/{" "}
                    {Number(
                      s.price
                    ).toFixed(
                      2
                    )}
                  </Text>
                </View>
              ))}

            <TouchableOpacity
              style={styles.btn}
              onPress={() =>
                setModalVisible(
                  true
                )
              }
            >
              <Text
                style={
                  styles.btnText
                }
              >
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modal}>
          <View
            style={
              styles.modalContent
            }
          >
            <FlatList
              data={
                lawyer.services ||
                []
              }
              keyExtractor={(
                item
              ) =>
                item.id.toString()
              }
              renderItem={({
                item,
              }) => (
                <View
                  style={
                    styles.serviceCard
                  }
                >
                  <Text
                    style={
                      styles.title
                    }
                  >
                    {
                      item.name
                    }
                  </Text>

                  <Text
                    style={
                      styles.text
                    }
                  >
                    {
                      item.description
                    }
                  </Text>

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
              )}
            />

            <TouchableOpacity
              style={styles.btn}
              onPress={() =>
                setModalVisible(
                  false
                )
              }
            >
              <Text
                style={
                  styles.btnText
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
/* ESTILOS (los tuyos están bien, no los toqué) */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7F9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    margin: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 3,
  },
  image: { width: "100%", height: 200, borderRadius: 10 },
  name: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  specialty: { color: "#1C7C54", marginTop: 4 },
  sub: { color: "#777", marginTop: 2 },
  tabs: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap" },
  tab: {
    borderWidth: 1,
    borderColor: "#1C7C54",
    padding: 6,
    borderRadius: 20,
    margin: 5,
  },
  tabActive: { backgroundColor: "#1C7C54" },
  tabText: { color: "#1C7C54" },
  tabTextActive: { color: "#fff" },
  title: { fontWeight: "bold", marginBottom: 6 },
  text: { color: "#555" },
  rating: { marginTop: 10, color: "#FF9900" },
  serviceCard: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  price: { color: "#1C7C54", marginTop: 4 },
  btn: {
    backgroundColor: "#1C7C54",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff" },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    maxHeight: "80%",
  },
});