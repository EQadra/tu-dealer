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

export default function DoctorScreen() {

  /* =========================================================
     DARK MODE
  ========================================================= */

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#F9FAFB",

    card: darkMode ? "#0F172A" : "#FFFFFF",

    input: darkMode ? "#1E293B" : "#FFFFFF",

    text: darkMode ? "#F8FAFC" : "#111827",

    secondaryText: darkMode ? "#94A3B8" : "#666666",

    border: darkMode ? "#334155" : "#E5E7EB",

    button: "#16A34A",

    placeholder: darkMode ? "#94A3B8" : "#999999",
  };

  /* =========================================================
     CONTEXT
  ========================================================= */

  const { user } = useAuth();

  const doctor = user?.profile;

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
    if (doctor) {
      setForm(doctor);
    }
  }, [doctor]);

  /* =========================================================
     UPDATE
  ========================================================= */

  const handleUpdate = async () => {
    try {

      setLoading(true);

      await api.put("/doctors", {
        first_name: form.first_name,
        last_name: form.last_name,
        specialty: form.specialty,
        city: form.city,
        university: form.university,
        description: form.description,
        schedule: form.schedule,
      });

      alert("✅ Perfil actualizado");

    } catch (err) {

      alert("❌ Error");

    } finally {

      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (!doctor) {

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
          TABS
      ========================================================= */}

      <View style={styles.tabs}>

        <Text
          onPress={() =>
            setTab("perfil")
          }
          style={
            tab === "perfil"
              ? [
                  styles.activeTab,
                  {
                    color: "#22c55e",
                  },
                ]
              : [
                  styles.tab,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]
          }
        >
          Perfil
        </Text>

        <Text
          onPress={() =>
            setTab("services")
          }
          style={
            tab === "services"
              ? [
                  styles.activeTab,
                  {
                    color: "#22c55e",
                  },
                ]
              : [
                  styles.tab,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]
          }
        >
          Servicios
        </Text>

        <Text
          onPress={() =>
            setTab("posts")
          }
          style={
            tab === "posts"
              ? [
                  styles.activeTab,
                  {
                    color: "#22c55e",
                  },
                ]
              : [
                  styles.tab,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]
          }
        >
          Posts
        </Text>
      </View>

      {/* =========================================================
          PERFIL
      ========================================================= */}

      {tab === "perfil" && (
        <View>

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
            placeholder="Especialidad"
            placeholderTextColor={
              colors.placeholder
            }
            value={form.specialty}
            onChangeText={(t) =>
              setForm({
                ...form,
                specialty: t,
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
            placeholder="Ciudad"
            placeholderTextColor={
              colors.placeholder
            }
            value={form.city}
            onChangeText={(t) =>
              setForm({
                ...form,
                city: t,
              })
            }
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdate}
          >
            <Text
              style={styles.saveText}
            >
              {loading
                ? "Guardando..."
                : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* =========================================================
          SERVICES
      ========================================================= */}

      {tab === "services" && (
        <View>
          {doctor.services?.map(
            (s: any) => (
              <View
                key={s.id}
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      colors.card,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.postTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {s.name}
                </Text>

                <Text
                  style={{
                    color:
                      colors.secondaryText,
                  }}
                >
                  {s.description}
                </Text>

                <Text
                  style={styles.price}
                >
                  ${s.price}
                </Text>
              </View>
            )
          )}
        </View>
      )}

      {/* =========================================================
          POSTS
      ========================================================= */}

      {tab === "posts" && (
        <View>
          {doctor.posts?.map(
            (p: any) => (
              <View
                key={p.id}
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      colors.card,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.postTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {p.title}
                </Text>

                <Text
                  style={[
                    styles.postText,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  {p.short_content ||
                    p.content}
                </Text>
              </View>
            )
          )}
        </View>
      )}
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
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },

  tab: {
    fontWeight: "500",
  },

  activeTab: {
    fontWeight: "bold",
  },

  input: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  saveBtn: {
    backgroundColor: "#16A34A",
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    margin: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },

  postTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 15,
  },

  postText: {
    marginTop: 5,
    lineHeight: 20,
  },

  row: {
    flexDirection: "row",
    marginTop: 10,
    gap: 6,
  },

  price: {
    marginTop: 10,
    fontWeight: "bold",
    color: "#16A34A",
    fontSize: 15,
  },
});