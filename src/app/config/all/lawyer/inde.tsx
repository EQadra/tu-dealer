import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useAuth } from "../../../../context/AuthContext";

import api from "../../../../utils/axios";

import { useDarkMode } from "../../../../context/app/DarkModeContext";

export default function LawyerScreen() {

  /* =========================================================
     DARK MODE
  ========================================================= */

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",

    card: darkMode ? "#0F172A" : "#FFFFFF",

    input: darkMode ? "#1E293B" : "#FFFFFF",

    text: darkMode ? "#F8FAFC" : "#111827",

    secondaryText: darkMode ? "#22C55E" : "#16A34A",

    muted: darkMode ? "#94A3B8" : "#6B7280",

    border: darkMode ? "#334155" : "#E5E7EB",

    button: "#22C55E",

    placeholder: darkMode ? "#94A3B8" : "#999999",
  };

  /* =========================================================
     AUTH
  ========================================================= */

  const { user } = useAuth();

  const lawyer = user?.profile;

  /* =========================================================
     STATES
  ========================================================= */

  const [tab, setTab] = useState("perfil");

  const [form, setForm] = useState<any>({});

  const [loading, setLoading] = useState(false);

  /* =========================================================
     EFFECT
  ========================================================= */

  useEffect(() => {
    if (lawyer) {
      setForm(lawyer);
    }
  }, [lawyer]);

  /* =========================================================
     UPDATE
  ========================================================= */

  const handleUpdate = async () => {
    try {

      setLoading(true);

      await api.put("/lawyers", {
        first_name: form.first_name,
        last_name: form.last_name,
        specialty: form.specialty,
        city: form.city,
        university: form.university,
        license_code: form.license_code,
      });

      alert("✅ Actualizado");

    } catch {

      alert("❌ Error");

    } finally {

      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!lawyer) {

    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#22c55e"
        />
      </View>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <View style={styles.header}>

        <Image
          source={{
            uri:
              form.image ||
              "https://picsum.photos/200",
          }}
          style={styles.avatar}
        />

        <Text
          style={[
            styles.name,
            {
              color: colors.text,
            },
          ]}
        >
          {form.first_name} {form.last_name}
        </Text>

        <Text
          style={[
            styles.sub,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {form.specialty}
        </Text>
      </View>

      {/* =========================================================
          INPUTS
      ========================================================= */}

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              colors.input,
            borderColor:
              colors.border,
            color:
              colors.text,
          },
        ]}
        placeholder="Nombre"
        placeholderTextColor={
          colors.placeholder
        }
        value={form.first_name}
        onChangeText={(t) =>
          setForm({
            ...form,
            first_name: t,
          })
        }
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              colors.input,
            borderColor:
              colors.border,
            color:
              colors.text,
          },
        ]}
        placeholder="Apellido"
        placeholderTextColor={
          colors.placeholder
        }
        value={form.last_name}
        onChangeText={(t) =>
          setForm({
            ...form,
            last_name: t,
          })
        }
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              colors.input,
            borderColor:
              colors.border,
            color:
              colors.text,
          },
        ]}
        placeholder="Código Licencia"
        placeholderTextColor={
          colors.placeholder
        }
        value={form.license_code}
        onChangeText={(t) =>
          setForm({
            ...form,
            license_code: t,
          })
        }
      />

      {/* =========================================================
          BUTTON
      ========================================================= */}

      <TouchableOpacity
        style={styles.btn}
        onPress={handleUpdate}
      >
        <Text style={styles.btnText}>
          {loading
            ? "Guardando..."
            : "Guardar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    padding: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },

  sub: {
    marginTop: 4,
    fontWeight: "600",
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  tab: {
    fontWeight: "500",
  },

  activeTab: {
    fontWeight: "bold",
  },

  input: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  btn: {
    backgroundColor: "#22c55e",

    margin: 12,

    padding: 14,

    borderRadius: 10,

    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    margin: 10,
    padding: 12,
    borderRadius: 10,
  },

  bold: {
    fontWeight: "bold",
  },

  price: {
    color: "#22c55e",
    marginTop: 4,
  },
});