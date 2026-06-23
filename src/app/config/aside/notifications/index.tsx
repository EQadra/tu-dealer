// src/app/config/aside/notifications/index.tsx
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../../../context/NotificationContext';

export default function NotificacionesScreen() {
  const router = useRouter();
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    unreadCount 
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Obtener color según tipo de notificación
  const getCardColor = (type: string) => {
    switch (type) {
      case 'feedback':
        return '#C8FBE3';
      case 'comment':
        return '#D6EAF8';
      case 'post':
        return '#FDEBD0';
      case 'service':
        return '#E8DAEF';
      default:
        return '#F5F5F5';
    }
  };

  // Obtener icono según tipo
  const getIcon = (type: string) => {
    switch (type) {
      case 'feedback':
        return 'star-circle';
      case 'comment':
        return 'comment-text';
      case 'post':
        return 'post';
      case 'service':
        return 'handshake';
      default:
        return 'bell';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getCardColor(item.type) }]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <MaterialCommunityIcons 
            name={getIcon(item.type)} 
            size={20} 
            color="#1C7C54" 
            style={styles.icon}
          />
          <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <Text style={styles.message}>{item.message}</Text>
      
      {!item.read && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>Nuevo</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Verificar si notifications es un array
  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color="#1C7C54"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notificaciones
          {unreadCount > 0 && (
            <Text style={styles.badge}> ({unreadCount})</Text>
          )}
        </Text>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA */}
      {loading && notificationsArray.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1C7C54" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : notificationsArray.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No hay notificaciones</Text>
          <Text style={styles.emptySubText}>
            Cuando alguien te deje una reseña o comentario, aparecerá aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificationsArray}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              colors={['#1C7C54']}
            />
          }
        />
      )}

      {/* FOOTER ICON */}
      {/* <View style={styles.footerIcon}>
        <Image
          source={require("../../../../assets/logo.png")}
          style={{ width: 140, height: 42, resizeMode: "contain" }}
        />
      </View> */}
    </SafeAreaView>
  );
}

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
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  badge: {
    color: '#1C7C54',
    fontSize: 14,
    fontWeight: '700',
  },
  markAllText: {
    color: '#1C7C54',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  unreadText: {
    fontWeight: '700',
    color: '#1C7C54',
  },
  time: {
    fontSize: 11,
    color: '#666',
  },
  message: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginLeft: 28,
  },
  unreadBadge: {
    backgroundColor: '#1C7C54',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginLeft: 28,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});