import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

/* =========================
   DATA
========================= */

const NOTIFICACIONES = [
  {
    id: '1',
    title: 'Nueva respuesta del Dr. Luis Medina',
    message:
      'Hola, con gusto puedo ayudarte. ¿Podrías contarme tus síntomas?',
    time: 'Hace 3 min',
  },
  {
    id: '2',
    title: 'Tu conexión fue aprobada',
    message:
      'La abogada Carla Herrera aceptó tu solicitud. Ahora puedes chatear directamente con ella.',
    time: 'Hace 12 min',
  },
  {
    id: '3',
    title: 'Nuevo producto en tu zona',
    message:
      'Greenleaf Shop acaba de publicar “Tintura CBD Full Spectrum 10%”.',
    time: 'Hace 1 hora',
  },
  {
    id: '4',
    title: 'Evento este fin de semana',
    message:
      'La Asociación Cannábica realizará un taller de cultivo básico este sábado. Cupos limitados.',
    time: 'Hace 2 horas',
  },
];

/* =========================
   COMPONENT
========================= */

export default function NotificacionesScreen() {

      const router = useRouter();
  
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <Text style={styles.message}>{item.message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.back()}>
                      <MaterialCommunityIcons name="chevron-left" size={28} color="#111" />
                    </TouchableOpacity>

        <Text style={styles.headerTitle}>Notificaciones</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* LISTA */}
      <FlatList
        data={NOTIFICACIONES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />

      {/* FOOTER ICON */}
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
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },

  card: {
    backgroundColor: '#C8FBE3',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    color: '#111',
  },

  time: {
    fontSize: 11,
    color: '#666',
  },

  message: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },

  footerIcon: {
    position: 'absolute',
    bottom: 100,
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

  logo: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: '#fff',
    padding: 2,
  },
});