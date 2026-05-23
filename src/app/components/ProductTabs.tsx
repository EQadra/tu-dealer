import React, { useState } from "react";

import {
  Text,
  View,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
} from "react-native";

type ProductItem = {
  id: string | number;
  image: string;
  name: string;
  description: string;
};

type Props = {
  tabs: string[];
  tabContent: {
    [key: string]: ProductItem[];
  };
};

export default function ProductTabs({
  tabs,
  tabContent,
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState(
    tabs[0]
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab
                ? styles.activeTab
                : styles.inactiveTab,
            ]}
          >
            <Text style={styles.tabText}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {tabContent[activeTab].map((item) => (
          <View
            key={item.id}
            style={styles.card}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />

            <View style={styles.cardContent}>
              <Text style={styles.productName}>
                {item.name}
              </Text>

              <Text
                style={styles.description}
              >
                {item.description}
              </Text>

              <Text style={styles.moreText}>
                ver más ...
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    flexWrap: "wrap",
  },

  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 6,
    marginBottom: 8,
  },

  activeTab: {
    backgroundColor: "#4ade80",
  },

  inactiveTab: {
    backgroundColor: "#dcfce7",
  },

  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#166534",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 3,
  },

  image: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  productName: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "600",
    color: "#14532d",
  },

  description: {
    fontSize: 14,
    color: "#15803d",
  },

  moreText: {
    fontSize: 14,
    color: "#22c55e",
    marginTop: 6,
  },
});