import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from 'react-native';
const historialData = [
  {
    id: 1,
    fecha: '15 Feb 2025',
    titulo: 'Dr. Luis Medina',
    descripcion: 'Consulta medicina online + receta digital',
    monto: '120',
  },
  {
    id: 2,
    fecha: '02 Feb 2025',
    titulo: 'LegalGreen Abogados',
    descripcion: 'Asesoría legal sobre cultivo personal',
    monto: '250',
  },
  {
    id: 3,
    fecha: '22 Ene 2025',
    titulo: 'Asociación Raíces Libres',
    descripcion: 'Inscripción Taller de Cultivo Básico',
    monto: '40',
  },
  {
    id: 4,
    fecha: '10 Ene 2025',
    titulo: 'NaturalMed farmacia',
    descripcion: 'Cápsulas de CBD - 30 unidades',
    monto: '110',
  },
];

export default function HistorialScreen() {
    const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

      {/* Header */}
      <View style={styles.header}>
             <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi historial</Text>
        <View style={{ width: 28 }} /> {/* Espacio simétrico */}
      </View>

      {/* Lista de historial */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {historialData.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.fecha}>{item.fecha}</Text>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.descripcion}>{item.descripcion}</Text>
            </View>
            <View style={styles.montoContainer}>
              <Text style={styles.monto}>S/ {item.monto}</Text>
              <Ionicons name="chevron-forward" size={24} color="#aaa" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Espacio para el ícono flotante */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Ícono grande flotante (como en la imagen) */}
     <View style={styles.floatingIcon}>
 <Image
          source={require("../../../../assets/logo.png")}
          style={{ width: 140, height: 42, resizeMode: "contain" }}
        />
</View>

      {/* Bottom Navigation Bar */}
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    flex: 1,
  },
  fecha: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 6,
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  montoContainer: {
    alignItems: 'flex-end',
  },
  monto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  floatingIcon: {
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    padding: 8,
  },
  navItemActive: {
    padding: 8,
  },
  logo: {
  width: 50,
  height: 50,
  borderRadius: 5,
  padding: 2,
},
});