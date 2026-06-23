import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import LatestNews from "../../components/LatestNews";
import LatestShops from "../../components/LatestShops";
import ProductList from "../../components/ProductList";

const StoreListScreen = () => {

  const sections = [   
    {
      id: "shops",
      component: <LatestShops />,
    },
    {
      id: "explore",
      component: <ProductList />,
    },
    {
      id: "latestNews",
      component: <LatestNews />,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {sections.map((item) => (
        <View key={item.id}>
          {item.component}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
});

export default StoreListScreen;