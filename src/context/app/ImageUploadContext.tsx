import React, {
  createContext,
  ReactNode,
  useContext,
} from "react";

import * as ImagePicker from "expo-image-picker";
import api from "../../utils/axios";

type Role =
  | "doctor"
  | "lawyer"
  | "association"
  | "shop";

interface UploadParams {
  role: Role;
  image: string;
}

interface ImageUploadContextType {
  pickImage: () => Promise<string | null>;
  uploadImageByRole: (
    params: UploadParams
  ) => Promise<any>;
}

const ImageUploadContext =
  createContext<ImageUploadContextType>(
    {} as ImageUploadContextType
  );

export const ImageUploadProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (result.canceled) return null;

    return result.assets[0].uri;
  };

  const uploadImageByRole = async ({
    role,
    image,
  }: UploadParams) => {
    try {
      const formData = new FormData();

      const filename =
        image.split("/").pop() ||
        `image-${Date.now()}.jpg`;

      const ext =
        filename
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const mimeType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
          ? "image/webp"
          : "image/jpeg";

      formData.append("image", {
        uri: image,
        name: filename,
        type: mimeType,
      } as any);

      const endpoints = {
        doctor: "/doctor/image",
        lawyer: "/lawyer/image",
        association: "/association/image",
        shop: "/shop/image",
      };

      console.log("SUBIENDO:");
      console.log({
        uri: image,
        name: filename,
        type: mimeType,
      });

      const response = await api.post(
        endpoints[role],
        formData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type":
              "multipart/form-data",
          },
          transformRequest: () => formData,
        }
      );

      return response.data;
    } catch (error: any) {
      console.log(
        "UPLOAD ERROR",
        error?.response?.data || error
      );

      return null;
    }
  };

  return (
    <ImageUploadContext.Provider
      value={{
        pickImage,
        uploadImageByRole,
      }}
    >
      {children}
    </ImageUploadContext.Provider>
  );
};

export const useImageUpload = () =>
  useContext(ImageUploadContext);