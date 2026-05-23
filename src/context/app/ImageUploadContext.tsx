import React, { createContext, useContext, useState, ReactNode } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Alert } from "react-native";
import { useAuth } from "../AuthContext";

/* =========================
   TYPES
========================= */

type Role = "doctor" | "lawyer" | "shop" | "association";

interface UploadImageParams {
  role: Role;
  id: number | string;
  image: ImagePicker.ImagePickerAsset;
}

interface ImageUploadContextType {
  loading: boolean;
  pickImage: () => Promise<ImagePicker.ImagePickerAsset | null>;
  uploadImageByRole: (params: UploadImageParams) => Promise<any>;
}

/* =========================
   CONTEXT
========================= */

const ImageUploadContext = createContext<ImageUploadContextType | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const ImageUploadProvider = ({ children }: Props) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  /* =========================
     PICK IMAGE
  ========================= */

  const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return null;

    return result.assets[0];
  };

  /* =========================
     UPLOAD BY ROLE
  ========================= */

  const uploadImageByRole = async ({
    role,
    id,
    image,
  }: UploadImageParams) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("image", {
        uri: image.uri,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);

      let endpoint = "";

      switch (role) {
        case "doctor":
          endpoint = `/doctors/upload-image/${id}`;
          break;
        case "lawyer":
          endpoint = `/lawyers/upload-image/${id}`;
          break;
        case "shop":
          endpoint = `/shops/upload-image/${id}`;
          break;
        case "association":
          endpoint = `/associations/upload-image/${id}`;
          break;
        default:
          throw new Error("Rol no soportado");
      }

      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Éxito", "Imagen actualizada correctamente");

      return response.data;
    } catch (error) {
      console.log("Upload error:", error);
      Alert.alert("Error", "No se pudo subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageUploadContext.Provider
      value={{
        loading,
        pickImage,
        uploadImageByRole,
      }}
    >
      {children}
    </ImageUploadContext.Provider>
  );
};

/* =========================
   HOOK
========================= */

export const useImageUpload = () => {
  const context = useContext(ImageUploadContext);

  if (!context) {
    throw new Error(
      "useImageUpload debe usarse dentro de ImageUploadProvider"
    );
  }

  return context;
};