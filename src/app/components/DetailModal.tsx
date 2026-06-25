// components/DetailModal.tsx - VERSIÓN CORREGIDA (SIN TRANSPARENCIAS)
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { extractData } from "../../config/detailConfig";

interface DetailModalProps {
  visible: boolean;
  item: any;
  onClose: () => void;
  colors: {
    background: string;
    card: string;
    text: string;
    secondaryText: string;
    primary: string;
    border: string;
    shadow?: string;
  };
  showViews?: boolean;
  views?: number;
  lastViewed?: string;
}

// 🔥 MAPA DE COLORES POR TIPO
const typeColors: Record<string, { bg: string; text: string; light: string }> = {
  'App\\Models\\Product': { bg: '#22C55E', text: '#FFFFFF', light: '#DCFCE7' },
  'App\\Models\\News': { bg: '#3B82F6', text: '#FFFFFF', light: '#DBEAFE' },
  'App\\Models\\Post': { bg: '#F59E0B', text: '#FFFFFF', light: '#FEF3C7' },
  'App\\Models\\Doctor': { bg: '#8B5CF6', text: '#FFFFFF', light: '#EDE9FE' },
  'App\\Models\\Lawyer': { bg: '#EC4899', text: '#FFFFFF', light: '#FCE7F3' },
  'App\\Models\\Shop': { bg: '#F472B6', text: '#FFFFFF', light: '#FCE7F3' },
  'App\\Models\\Association': { bg: '#F59E0B', text: '#FFFFFF', light: '#FEF3C7' },
};

const DetailModal = ({
  visible,
  item,
  onClose,
  colors,
  showViews = false,
  views = 0,
  lastViewed = "",
}: DetailModalProps) => {
  if (!item) return null;

  const data = extractData(item);
  
  if (!data) {
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainerError, { backgroundColor: colors.background || '#1a1a1a' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border || '#333' }]}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text || 'white' }]}>Error</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.text || 'white'} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: colors.text || 'white', padding: 20, textAlign: 'center' }}>
              No se pudieron cargar los datos
            </Text>
            <TouchableOpacity style={[styles.modalActionButton, { backgroundColor: colors.primary || '#00B272' }]} onPress={onClose}>
              <Text style={styles.modalActionText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const { title, description, imageUrl, mainField, extraFields, icon, label, color, createdAt } = data;
  const typeColor = typeColors[data.type] || { bg: '#6B7280', text: '#FFFFFF', light: '#F3F4F6' };

  // 🔥 Fondo del modal (completamente opaco)
  const modalBgColor = colors.background || '#1a1a1a';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer, 
          { 
            backgroundColor: modalBgColor, // ✅ Fondo completamente opaco
            shadowColor: colors.shadow || '#000',
          }
        ]}>
          
          {/* HEADER */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border || '#333' }]}>
            <View style={styles.modalHeaderLeft}>
              <View style={[styles.modalTypeBadge, { backgroundColor: typeColor.bg }]}>
                <Text style={styles.modalTypeText}>{icon} {label}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={28} color={colors.text || 'white'} />
            </TouchableOpacity>
          </View>

          {/* CONTENIDO */}
          <View style={styles.modalBodyContainer}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Fecha y vistas */}
              <View style={styles.modalMetaContainer}>
                {createdAt && (
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.secondaryText || '#aaa'} />
                    <Text style={[styles.modalMetaText, { color: colors.secondaryText || '#aaa' }]}>
                      {new Date(createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                )}
                {showViews && (
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="eye-outline" size={14} color={colors.secondaryText || '#aaa'} />
                    <Text style={[styles.modalMetaText, { color: colors.secondaryText || '#aaa' }]}>
                      {views} vistas
                    </Text>
                  </View>
                )}
                {lastViewed && showViews && (
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.secondaryText || '#aaa'} />
                    <Text style={[styles.modalMetaText, { color: colors.secondaryText || '#aaa' }]}>
                      {lastViewed.split(',')[0]}
                    </Text>
                  </View>
                )}
              </View>

              {/* IMAGEN */}
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                  onError={() => {}}
                />
              ) : (
                <View style={[styles.modalImage, styles.modalImagePlaceholder, { backgroundColor: colors.border || '#333' }]}>
                  <Ionicons name="image-outline" size={50} color={colors.secondaryText || '#666'} />
                  <Text style={[styles.modalImagePlaceholderText, { color: colors.secondaryText || '#666' }]}>
                    Sin imagen
                  </Text>
                </View>
              )}

              {/* TÍTULO */}
              <Text style={[styles.modalTitle, { color: colors.text || 'white' }]}>{title}</Text>

              {/* DESCRIPCIÓN */}
              {description && (
                <View style={[styles.modalDescriptionCard, { backgroundColor: colors.card || 'transparent' }]}>
                  <Text style={[styles.modalDescription, { color: colors.secondaryText || '#aaa' }]}>
                    {description}
                  </Text>
                </View>
              )}

              {/* CAMPO PRINCIPAL */}
              {mainField && (
                <View style={[styles.modalMainField, { backgroundColor: typeColor.light + '30' }]}>
                  <Text style={[styles.modalMainFieldLabel, { color: colors.secondaryText || '#aaa' }]}>
                    {mainField.label}
                  </Text>
                  <Text style={[styles.modalMainFieldValue, { color: typeColor.bg }]}>
                    {mainField.value}
                  </Text>
                </View>
              )}

              {/* INFORMACIÓN ADICIONAL */}
              {extraFields.length > 0 && (
                <View style={styles.modalExtraContainer}>
                  <View style={styles.modalExtraHeader}>
                    <Ionicons name="list-outline" size={18} color={colors.secondaryText || '#aaa'} />
                    <Text style={[styles.modalExtraTitle, { color: colors.secondaryText || '#aaa' }]}>
                      Información adicional
                    </Text>
                  </View>
                  
                  {extraFields.map((field, index) => (
                    <View key={index} style={[
                      styles.modalExtraRow, 
                      { borderBottomColor: colors.border || '#333' },
                      index === extraFields.length - 1 && styles.modalExtraRowLast
                    ]}>
                      <Text style={[styles.modalExtraLabel, { color: colors.secondaryText || '#aaa' }]}>
                        {field.label}
                      </Text>
                      <Text style={[styles.modalExtraValue, { color: colors.text || 'white' }]}>
                        {String(field.value)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Espacio extra al final */}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>

          {/* BOTÓN CERRAR */}
          <TouchableOpacity
            style={[styles.modalActionButton, { backgroundColor: colors.primary || '#00B272' }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.modalActionText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
   // ✅ OVERLAY - Fondo oscuro que cubre toda la pantalla
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // ✅ CONTAINER PRINCIPAL - Más grande y sin bordes feos
  modalContainer: {
    width: '100%',
    height: '70%',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContainerError: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 28,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTypeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalTypeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBodyContainer: {
    flex: 1,
    minHeight: 150,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  modalMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: '#333',
  },
  modalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#555',
  },
  modalImagePlaceholderText: {
    fontSize: 13,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalDescriptionCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  modalMainField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  modalMainFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalMainFieldValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalExtraContainer: {
    marginTop: 4,
  },
  modalExtraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modalExtraTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalExtraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  modalExtraRowLast: {
    borderBottomWidth: 0,
  },
  modalExtraLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  modalExtraValue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  modalActionButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DetailModal;