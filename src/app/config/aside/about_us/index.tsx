import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";

import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

export default function AboutUs() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#ffffff" }}
      contentContainerStyle={{ padding: 20, paddingTop: top + 20 }}
    >
      {/* HEADER */}
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Image
          source={{
            uri: "https://tudealer.app/imagenes_app/logo.png",
          }}
          style={{ width: 90, height: 90, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#064e3b" }}>
          Sobre Nosotros
        </Text>
      </View>

      {/* DESCRIPCIÓN */}
      <Text style={styles.paragraph}>
        Somos una red social dedicada a la{" "}
        <Text style={styles.highlight}>educación, información y acompañamiento</Text>{" "}
        sobre el uso de cannabis con fines medicinales.
      </Text>

      <Text style={styles.paragraph}>
        Nuestra misión es crear una comunidad segura donde pacientes, médicos,
        especialistas y usuarios puedan compartir experiencias, resolver dudas
        y acceder a información confiable basada en evidencia científica.
      </Text>

      {/* MISIÓN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌱 Nuestra misión</Text>
        <Text style={styles.cardText}>
          Facilitar el acceso a información clara, responsable y actualizada
          sobre el cannabis medicinal, promoviendo su uso consciente y legal
          como alternativa terapéutica.
        </Text>
      </View>

      {/* VISIÓN */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👁️ Nuestra visión</Text>
        <Text style={styles.cardText}>
          Ser la comunidad digital líder en Latinoamérica sobre cannabis
          medicinal, conectando personas, conocimiento y bienestar.
        </Text>
      </View>

      {/* VALORES */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💚 Nuestros valores</Text>
        <Text style={styles.cardText}>• Educación basada en ciencia</Text>
        <Text style={styles.cardText}>• Respeto y confidencialidad</Text>
        <Text style={styles.cardText}>• Uso responsable y legal</Text>
        <Text style={styles.cardText}>• Comunidad y apoyo mutuo</Text>
      </View>

      {/* DISCLAIMER */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Esta plataforma no reemplaza la consulta médica profesional.
          Recomendamos siempre acudir a un especialista de la salud antes de
          iniciar cualquier tratamiento.
        </Text>
      </View>

      {/* BOTÓN */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 16,
  },
  highlight: {
    color: "#047857",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: "#064e3b",
    marginBottom: 4,
  },
  disclaimer: {
    backgroundColor: "#fef3c7",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#92400e",
    textAlign: "center",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#064e3b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});


