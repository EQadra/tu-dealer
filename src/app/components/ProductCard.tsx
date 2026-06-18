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
}

const ProductCard = ({ product, onPress, onWhatsApp }: ProductCardProps) => {
  const { darkMode } = useDarkMode();

  const colors = {
    card: darkMode ? "#0F172A" : "#ffffff",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
    border: darkMode ? "#1E293B" : "#eeeeee",
    green: "#00B272",
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress?.(product)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: product.image || "https://via.placeholder.com/150" }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        
        <Text style={[styles.price, { color: colors.green }]}>
          ${product.price?.toLocaleString() || "N/A"}
        </Text>
        
        <View style={styles.footer}>
          <Text style={[styles.shop, { color: colors.secondaryText }]} numberOfLines={1}>
            {product.shop?.name || "Tienda"}
          </Text>
          
          {onWhatsApp && (
            <TouchableOpacity
              style={styles.whatsappIcon}
              onPress={() => onWhatsApp(product)}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#e0e0e0",
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