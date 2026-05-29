
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useServices } from "../../../../context/ServiceContext";

import { useDarkMode } from "../../../../context/app/DarkModeContext";

const ServicesScreen = () => {

  /* =========================================================
     DARK MODE
  ========================================================= */

  const { darkMode } = useDarkMode();

  const colors = {
    background: darkMode ? "#020617" : "#FFFFFF",

    card: darkMode ? "#0F172A" : "#ECFDF5",

    text: darkMode ? "#F8FAFC" : "#111827",

    secondaryText: darkMode ? "#CBD5E1" : "#374151",

    border: darkMode ? "#334155" : "#DDDDDD",

    primary: darkMode ? "#22C55E" : "#065F46",

    warning: darkMode ? "#3F2A00" : "#FEF3C7",

    warningText: darkMode ? "#FCD34D" : "#92400E",

    buttonText: "#FFFFFF",
  };

  /* =========================================================
     CONTEXT
  ========================================================= */

  const {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  } = useServices();

  /* =========================================================
     STATES
  ========================================================= */

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");

  const [duration, setDuration] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* =========================================================
     EFFECT
  ========================================================= */

  useEffect(() => {
    fetchServices();
  }, []);

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
    setEditingId(null);
  };

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async () => {

    if (!name || !price) return;

    const payload = {
      name,
      description,
      price: Number(price),
      duration: Number(duration),
    };

    try {

      if (editingId) {

        await updateService(
          editingId,
          payload
        );

      } else {

        await createService(payload);
      }

      resetForm();

      fetchServices();

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (item: any) => {

    setEditingId(item.id);

    setName(item.name);

    setDescription(
      item.description || ""
    );

    setPrice(String(item.price));

    setDuration(
      String(item.duration)
    );
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDelete = (id: number) => {

    setSelectedId(id);

    setShowDeleteModal(true);
  };

  const handleDelete = async () => {

    if (!selectedId) return;

    try {

      await deleteService(selectedId);

      setShowDeleteModal(false);

      setSelectedId(null);

      fetchServices();

    } catch (err) {

      console.log(err);
    }
  };

  /* =========================================================
     RENDER ITEM
  ========================================================= */

  const renderItem = ({ item }: any) => (

    <View
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
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        {item.name}
      </Text>

      {!!item.description && (
        <Text
          style={[
            styles.description,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          {item.description}
        </Text>
      )}

      <Text
        style={[
          styles.price,
          {
            color:
              colors.primary,
          },
        ]}
      >
        S/ {item.price}
      </Text>

      <Text
        style={[
          styles.duration,
          {
            color:
              colors.secondaryText,
          },
        ]}
      >
        {item.duration} min
      </Text>

      <View style={styles.actions}>

        <TouchableOpacity
          style={[
            styles.editBtn,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={() =>
            handleEdit(item)
          }
        >
          <Text
            style={[
              styles.btnText,
              {
                color:
                  colors.buttonText,
              },
            ]}
          >
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() =>
            confirmDelete(item.id)
          }
        >
          <Text
            style={[
              styles.btnText,
              {
                color:
                  colors.buttonText,
              },
            ]}
          >
            Eliminar
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

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
          color={colors.primary}
        />
      </View>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >

      {/* FORM */}

      <View
        style={[
          styles.form,
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
            styles.formTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          {editingId
            ? "Editar Servicio"
            : "Nuevo Servicio"}
        </Text>

        <TextInput
          placeholder="Nombre"
          placeholderTextColor={
            colors.secondaryText
          }
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            {
              backgroundColor:
                colors.background,

              borderColor:
                colors.border,

              color:
                colors.text,
            },
          ]}
        />

        <TextInput
          placeholder="Descripción"
          placeholderTextColor={
            colors.secondaryText
          }
          value={description}
          onChangeText={
            setDescription
          }
          style={[
            styles.input,
            {
              backgroundColor:
                colors.background,

              borderColor:
                colors.border,

              color:
                colors.text,
            },
          ]}
        />

        <TextInput
          placeholder="Precio"
          placeholderTextColor={
            colors.secondaryText
          }
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              backgroundColor:
                colors.background,

              borderColor:
                colors.border,

              color:
                colors.text,
            },
          ]}
        />

        <TextInput
          placeholder="Duración en minutos"
          placeholderTextColor={
            colors.secondaryText
          }
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
          style={[
            styles.input,
            {
              backgroundColor:
                colors.background,

              borderColor:
                colors.border,

              color:
                colors.text,
            },
          ]}
        />

        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
          onPress={handleSubmit}
        >
          <Text
            style={[
              styles.btnText,
              {
                color:
                  colors.buttonText,
              },
            ]}
          >
            {editingId
              ? "Actualizar"
              : "Crear"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* LIST */}

      <FlatList
        data={services}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* DELETE MODAL */}

      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>

          <View
            style={[
              styles.modalBox,
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
                styles.modalTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ¿Eliminar servicio?
            </Text>

            <View
              style={styles.modalActions}
            >

              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor:
                      colors.warning,
                  },
                ]}
                onPress={() =>
                  setShowDeleteModal(false)
                }
              >
                <Text
                  style={{
                    color:
                      colors.warningText,

                    fontWeight:
                      "bold",
                  }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.confirmBtn
                }
                onPress={
                  handleDelete
                }
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color:
                        colors.buttonText,
                    },
                  ]}
                >
                  Eliminar
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
};

export default ServicesScreen;

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  form: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },

  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  submitBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  description: {
    marginVertical: 8,
  },

  price: {
    fontWeight: "bold",
  },

  duration: {
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },

  editBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  confirmBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

