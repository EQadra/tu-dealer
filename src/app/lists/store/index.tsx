import React from "react";
import { FlatList } from "react-native";
import ExploreScreen from "../../components/ExploreScreen";
import LatestAssociations from "../../components/LatestAssociations";
import LatestDoctors from "../../components/LatestDoctor";
import LatestLawyer from "../../components/LatestLawyer";
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
      component: <LatestNews  />,
    },
  ];

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => item.component}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default StoreListScreen;