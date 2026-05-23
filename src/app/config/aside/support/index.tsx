import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MaterialCommunityIcons from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/* =========================
   COMPONENT
========================= */

export default function SoporteScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Soporte</Text>
      <Text style={styles.subtitle}>Centro de contacto</Text>

      {/* WHATSAPP */}
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons
          name="whatsapp"
          size={36}
          color="#25D366"
        />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>WhatsApp</Text>
          <Text style={styles.cardText}>
            Conéctate de forma rápida con nuestro equipo a través de WhatsApp.
            Obtén soporte personalizado y resuelve tus dudas en tiempo real.
          </Text>
        </View>
      </TouchableOpacity>

      {/* CORREO */}
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons
          name="email-outline"
          size={36}
          color="#EA4335"
        />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>Correo</Text>
          <Text style={styles.cardText}>
            Si prefieres el correo electrónico, envíanos tu consulta o comentario.
            Nuestro equipo de soporte te responderá lo antes posible.
          </Text>
        </View>
      </TouchableOpacity>

      {/* REPORTAR PROBLEMA */}
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={36}
          color="#F4B400"
        />

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>Reportar un problema</Text>
          <Text style={styles.cardText}>
            ¿Algo no funciona bien en tu Dealer? Cuéntanos qué ocurrió.
            Revisaremos tu caso y te daremos una solución.
          </Text>
        </View>
      </TouchableOpacity>

      {/* FOOTER LOGO */}
      <View style={styles.footerIcon}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={{ width: 140, height: 42, resizeMode: "contain" }}
        />
      </View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    color: '#111',
  },

  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
    color: '#111',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  textContainer: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111',
  },

  cardText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },

  footerIcon: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});