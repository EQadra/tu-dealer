import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileScreen(): JSX.Element {
  const { user } = useAuth();

  const params = useLocalSearchParams();

  // Combina datos del contexto y params
  const userData = user || params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Lawyer Dashboard
      </Text>

      <Text style={styles.welcomeText}>
        Welcome, {userData.fullName}!
      </Text>

      <Text style={styles.infoText}>
        Specialty: {userData.specialty}
      </Text>

      <Text style={styles.infoText}>
        Experience: {userData.experience}
      </Text>

      <Text style={styles.infoText}>
        Location: {userData.location}
      </Text>

      <Text style={styles.infoText}>
        Selected Country: {userData.selectedCountry}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#166534",
  },

  welcomeText: {
    marginTop: 16,
    fontSize: 18,
    color: "#14532d",
    fontWeight: "600",
  },

  infoText: {
    marginTop: 8,
    fontSize: 16,
    color: "#4b5563",
  },
});