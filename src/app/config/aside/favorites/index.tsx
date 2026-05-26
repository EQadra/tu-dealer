import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
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

const FAVORITOS = [
  {
    id: '1',
    title: 'Greenleaf Shop',
    subtitle: 'Lima (5km)',
    description:
      'Tratamientos para dolor crónico y ansiedad. +120 pacientes atendidos',
    image: 'https://picsum.photos/200/200?random=1',
  },
  {
    id: '2',
    title: 'LegalGreen Abogados',
    subtitle: 'Lima (2km)',
    description:
      'Asesoría en licencias de cultivo y defensa legal en procesos vinculados al cannabis',
    image: 'https://picsum.photos/200/200?random=2',
  },
  {
    id: '3',
    title: 'Asociación Raíces Libres',
    subtitle: 'Cusco, Perú',
    description:
      'Organiza talleres presenciales y ofrece apoyo a pacientes con epilepsia',
    image: 'https://picsum.photos/200/200?random=3',
  },
  {
    id: '4',
    title: 'Cápsulas CBD Full Spectrum',
    subtitle: '10% – 30 unidades · Lima (5km)',
    description:
      'Uso nocturno para mejorar el sueño. Disponible para entrega local',
    image: 'https://picsum.photos/200/200?random=4',
  },
];

/* =========================
   COMPONENT
========================= */

export default function FavoritosScreen() {
  const router = useRouter();

  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);

  const openModal = (item) => {
    setSelected(item);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setSelected(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Favoritos</Text>

        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <FlatList
        data={FAVORITOS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* FOOTER LOGO */}
      <View style={styles.floatingIcon}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={{
            width: 140,
            height: 42,
            resizeMode: "contain",
          }}
        />
      </View>

      {/* MODAL */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={closeModal}>
          <View style={styles.modalBox}>
            {selected && (
              <>
                <Image
                  source={{ uri: selected.image }}
                  style={styles.modalImage}
                />

                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalSubtitle}>{selected.subtitle}</Text>
                <Text style={styles.modalDescription}>
                  {selected.description}
                </Text>

                <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                  <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
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
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    alignItems: 'center',
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },

  subtitle: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },

  description: {
    fontSize: 12,
    color: '#444',
    lineHeight: 16,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },

  modalImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111',
  },

  modalSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },

  modalDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },

  closeBtn: {
    backgroundColor: '#1E8E3E',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  closeText: {
    color: '#fff',
    fontWeight: '600',
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
});