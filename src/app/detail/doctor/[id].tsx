import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { useDoctors } from "../../../context/DoctorContext";

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams();
  const doctorId = Number(id);

  const { doctor, fetchDoctorById, loading, error } = useDoctors();

  const [activeTab, setActiveTab] = useState("sobre");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (doctorId) fetchDoctorById(doctorId);
  }, [doctorId]);

  const rating = useMemo(() => {
    if (!doctor?.feedbacks?.length) return 0;

    const total = doctor.feedbacks.reduce(
      (acc, f) => acc + Number(f.rating),
      0
    );

    return total / doctor.feedbacks.length;
  }, [doctor]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Cargando doctor...</Text>
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

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el doctor</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.card}>
          <Image
            source={{
              uri:
                doctor.image ||
                "https://via.placeholder.com/400x300.png?text=Doctor",
            }}
            style={styles.image}
          />

          <Text style={styles.name}>
            {doctor.first_name} {doctor.last_name}
          </Text>

          <Text style={styles.specialty}>
            {doctor.specialty}
          </Text>

          <Text style={styles.sub}>
            Código: {doctor.graduation_code}
          </Text>

          <Text style={styles.sub}>📍 {doctor.city}</Text>
          <Text style={styles.sub}>
            🎓 {doctor.university}
          </Text>
          <Text style={styles.sub}>
            👤 {doctor.user?.name}
          </Text>
          <Text style={styles.sub}>
            🕓 {doctor.schedule}
          </Text>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {["sobre", "posts", "feedbacks", "services"].map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab &&
                    styles.tabActive,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={
                    activeTab === tab
                      ? styles.tabTextActive
                      : styles.tabText
                  }
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* SOBRE */}
        {activeTab === "sobre" && (
          <View style={styles.card}>
            <Text style={styles.title}>
              Descripción
            </Text>

            <Text style={styles.text}>
              {doctor.description}
            </Text>

            <Text style={styles.rating}>
              ⭐ {rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* POSTS - View + map */}
        {activeTab === "posts" && (
          <View>
            {doctor.posts?.map((post) => (
              <View
                key={post.id}
                style={styles.card}
              >
                <Text style={styles.title}>
                  {post.title}
                </Text>

                <Text style={styles.text}>
                  {post.short_content ||
                    post.content}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* FEEDBACKS - View + map */}
        {activeTab === "feedbacks" && (
          <View>
            {doctor.feedbacks?.map((f) => (
              <View
                key={f.id}
                style={styles.card}
              >
                <Text style={styles.rating}>
                  ⭐ {f.rating}
                </Text>

                <Text style={styles.text}>
                  {f.comment}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* SERVICES - View + map */}
        {activeTab === "services" && (
          <View style={styles.card}>
            <Text style={styles.title}>
              Servicios
            </Text>

            {doctor.services
              ?.slice(0, 2)
              .map((s) => (
                <View
                  key={s.id}
                  style={styles.serviceCard}
                >
                  <Text style={styles.title}>
                    {s.name}
                  </Text>

                  <Text style={styles.text}>
                    {s.description}
                  </Text>

                  <Text style={styles.price}>
                    S/{" "}
                    {Number(
                      s.price
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}

            <TouchableOpacity
              style={styles.btn}
              onPress={() =>
                setModalVisible(true)
              }
            >
              <Text style={styles.btnText}>
                Ver más
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL - View + map en lugar de FlatList */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {doctor.services?.map((item) => (
                <View
                  key={item.id}
                  style={styles.serviceCard}
                >
                  <Text style={styles.title}>
                    {item.name}
                  </Text>

                  <Text style={styles.text}>
                    {item.description}
                  </Text>

                  <Text style={styles.price}>
                    S/{" "}
                    {Number(
                      item.price
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.btn}
              onPress={() =>
                setModalVisible(false)
              }
            >
              <Text style={styles.btnText}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🎨 ESTILOS LIMPIOS */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  image: {
    width: "100%",
    height: 240,
    borderRadius: 16,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
    color: "#1C1C1C",
  },

  specialty: {
    color: "#1C7C54",
    marginTop: 6,
    fontWeight: "600",
    fontSize: 14,
  },

  sub: {
    color: "#666",
    marginTop: 4,
    fontSize: 13,
  },

  /* TABS */
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 10,
  },

  tab: {
    borderWidth: 1.5,
    borderColor: "#1C7C54",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 25,
    margin: 6,
  },

  tabActive: {
    backgroundColor: "#1C7C54",
  },

  tabText: {
    color: "#1C7C54",
    fontWeight: "500",
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  /* TEXT */
  title: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 15,
    color: "#1C1C1C",
  },

  text: {
    color: "#555",
    fontSize: 13,
    lineHeight: 18,
  },

  rating: {
    marginTop: 10,
    color: "#FF9900",
    fontWeight: "bold",
    fontSize: 15,
  },

  /* SERVICES */
  serviceCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#FAFAFA",
  },

  price: {
    color: "#1C7C54",
    marginTop: 6,
    fontWeight: "700",
  },

  /* BUTTON */
  btn: {
    backgroundColor: "#1C7C54",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 12,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* MODAL */
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
});