import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ExploreScreen from "../../components/ExploreScreen";
// import LatestAssociations from "../../components/LatestAssociations";
// import LatestDoctors from "../../components/LatestDoctor";
// import LatestLawyer from "../../components/LatestLawyer";
import LatestNews from "../../components/LatestNews";
import LatestShops from "../../components/LatestShops";

const StoreListScreen = () => {

  const sections = [   
    {
      id: "shops",
      component: <LatestShops />,
    },
    {
      id: "explore",
      component: <ExploreScreen />,
    },
    {
      id: "LatesNews",
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