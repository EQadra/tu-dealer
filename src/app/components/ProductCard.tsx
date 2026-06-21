// components/ProductCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDarkMode } from "../../context/app/DarkModeContext";

interface ProductCardProps {
  product: any;
  onPress?: (product: any) => void;
  onWhatsApp?: (product: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
  showFavoriteButton?: boolean;
}

const ProductCard = ({ 
  product, 
  onPress, 
  onWhatsApp,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false
}: ProductCardProps) => {
  const { darkMode } = useDarkMode();

  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    green: "#00B272",
    red: "#EF4444",
    shadow: darkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)",
  };

  const stock = product.stock ?? 0;
  const hasImage = product.image || product.image_url;

  // Renderizar el contenido del producto con View + map
  const renderProductContent = () => {
    return (
      <View style={styles.contentContainer}>
        {/* Imagen */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: hasImage }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.green + "20" }]}>
              <Ionicons name="image-outline" size={30} color={colors.green} />
            </View>
          )}
          
          {/* Badge de stock */}
          <View
            style={[
              styles.stockBadge,
              { backgroundColor: stock > 0 ? colors.green : colors.red },
            ]}
          >
            <Text style={styles.stockBadgeText}>
              {stock > 0 ? `Stock: ${stock}` : "Agotado"}
            </Text>
          </View>

          {/* Botón de favoritos */}
          {showFavoriteButton && onToggleFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => onToggleFavorite(product.id)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? colors.red : "#fff"}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Información del producto */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {product.name || "Producto"}
          </Text>
          
          <Text style={[styles.price, { color: colors.green }]}>
            ${product.price?.toLocaleString() || "N/A"}
          </Text>
          
          <View style={styles.footer}>
            <Text style={[styles.shop, { color: colors.secondaryText }]} numberOfLines={1}>
              {product.shop?.name || product.association?.name || product.doctor?.first_name || "Tienda"}
            </Text>
            
            {onWhatsApp && product.shop?.phone && (
              <TouchableOpacity
                style={styles.whatsappIcon}
                onPress={() => onWhatsApp(product)}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }
      ]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.8}
    >
      {renderProductContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 4,
    marginVertical: 6,
    width: "48%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  stockBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 6,
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    minHeight: 36,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shop: {
    fontSize: 11,
    flex: 1,
  },
  whatsappIcon: {
    padding: 4,
  },
});

export default ProductCard;