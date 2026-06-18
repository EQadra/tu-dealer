import { Stack, useSegments } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

import { AuthProvider } from "../context/AuthContext";
import { NewsProvider } from "../context/NewsContext";

import { NewsRoleProvider } from "../context/NewsRoleContext";
import { ImageUploadProvider } from "../context/app/ImageUploadContext";

import { AssociationProvider } from "../context/AssociationContext";
import { DoctorProvider } from "../context/DoctorContext";
import { LawyerProvider } from "../context/LawyerContext";
import { PostProvider } from "../context/PostContext";
import { ProductProvider } from "../context/ProductContext";
import { ServiceProvider } from "../context/ServiceContext";

import { ShopProvider } from "../context/ShopContext";

import { CommentProvider } from "../context/CommentContext";
import { DarkModeProvider, useDarkMode } from "../context/app/DarkModeContext";

import Header from "./components/Header";

/* =========================
   CONTENIDO INTERNO (USA DARKMODE)
========================= */

function AppContent() {
  const { darkMode } = useDarkMode();
  const segments = useSegments();

  const hideLayout =
    segments.length === 0 ||
    segments[0] === "auth" ||
    segments[0] === "intro" ||
    (segments[0] === "aplication" && segments[1] === "countrys");

  /* =========================
     COLORES GLOBALES
  ========================= */

  const colors = {
    background: darkMode ? "#020617" : "#ffffff",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER */}
      {!hideLayout && (
        <View style={styles.header}>
          <Header />
        </View>
      )}

      {/* STACK */}
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* LISTS */}
        <Stack.Screen name="lists/doctor" />
        <Stack.Screen name="lists/lawyer" />
        <Stack.Screen name="lists/association" />
        <Stack.Screen name="lists/store" />

        {/* INTRO */}
        <Stack.Screen name="intro" />
        <Stack.Screen name="intro/v1" />
        <Stack.Screen name="intro/v2" />
        <Stack.Screen name="intro/v3" />

        {/* APPLICATION */}
        <Stack.Screen name="aplication/home-app" />
        <Stack.Screen name="aplication/home-news" />
        <Stack.Screen name="aplication/countrys" />

        {/* AUTH */}
        <Stack.Screen name="auth/options" />
        <Stack.Screen name="auth/profile" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/reset-password-form" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/auth-intro" />

        {/* CONFIG ALL */}
        <Stack.Screen name="config/all/asociation" />
        <Stack.Screen name="config/all/doctor" />
        <Stack.Screen name="config/all/lawyer" />
        <Stack.Screen name="config/all/store" />
        <Stack.Screen name="config/all/user" />
        <Stack.Screen name="config/all/post" />
        <Stack.Screen name="config/all/new" />

        {/* CONFIG ASIDE */}
        <Stack.Screen name="config/aside/about_us" />
        <Stack.Screen name="config/aside/configuration" />
        <Stack.Screen name="config/aside/dark_mode" />
        <Stack.Screen name="config/aside/favorites" />
        <Stack.Screen name="config/aside/help" />
        <Stack.Screen name="config/aside/history" />
        <Stack.Screen name="config/aside/log_out" />
        <Stack.Screen name="config/aside/notifications" />
        <Stack.Screen name="config/aside/support" />
      </Stack>
    </View>
  );
}

/* =========================
   ROOT LAYOUT
========================= */

export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DarkModeProvider>
          <AssociationProvider>
              <NewsRoleProvider>

            <NewsProvider>
            <ImageUploadProvider>
              <PostProvider>  
              <LawyerProvider>
                <ShopProvider>
                <ServiceProvider>
                  <ProductProvider>
                    <DoctorProvider>
                      <CommentProvider>
                      <AppContent />
                      </CommentProvider>
                    </DoctorProvider>
                  </ProductProvider>
                  </ServiceProvider>
                </ShopProvider>
              </LawyerProvider>
              </PostProvider>
                        </ImageUploadProvider>

            </NewsProvider>
              </NewsRoleProvider>

          </AssociationProvider>
        </DarkModeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // ❌ SIN COLOR FIJO (IMPORTANTE)
  },
});