// components/ProductList.tsx - Versión con View + map (sin ScrollView)
import React from "react";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useProducts } from "../../context/ProductContext";
import { useDarkMode } from "../../context/app/DarkModeContext";
import ProductCard from "./ProductCard";

interface ProductListProps {
  limit?: number;
}

const ProductList = ({ limit = 4 }: ProductListProps) => {
  const { darkMode } = useDarkMode();
  const { products, loading } = useProducts();

  const colors = {
    background: darkMode ? "#020617" : "#f5f5f5",
    text: darkMode ? "#F8FAFC" : "#222222",
    secondaryText: darkMode ? "#94A3B8" : "#555555",
  };

  // Función para renderizar productos en grid de 2 columnas usando solo View + map
  const renderProductsGrid = () => {
    const displayProducts = products.slice(0, limit);
    const rows = [];
    const itemsPerRow = 2;

    for (let i = 0; i < displayProducts.length; i += itemsPerRow) {
      const rowItems = displayProducts.slice(i, i + itemsPerRow);
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              onPress={(product) => {
                console.log("Producto seleccionado:", product.name);
              }}
              onWhatsApp={(product) => {
                console.log("WhatsApp para:", product.name);
              }}
              showFavoriteButton={true}
              isFavorite={false}
              onToggleFavorite={(productId) => {
                console.log("Toggle favorito:", productId);
              }}
            />
          ))}
          {rowItems.length === 1 && <View style={styles.emptyCard} />}
        </View>
      );
    }
    return rows;
  };

  // Estado de carga
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  // Renderizado principal - solo View + map, sin ScrollView
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          🛍️ Productos
        </Text>
      </View>
      
      {/* Contenido - usando View + map */}
      <View style={styles.listContent}>
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No hay productos disponibles
            </Text>
          </View>
        ) : (
          renderProductsGrid()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  emptyCard: {
    width: "48%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
});

export default ProductList;