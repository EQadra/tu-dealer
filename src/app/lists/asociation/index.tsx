import React from "react";

import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";

import ExploreScreen from "../../components/ExploreScreen";
import LatestAssociations from "../../components/LatestAssociations";
import LatestNews from "../../components/LatestNews";

import { useDarkMode } from "../../../context/app/DarkModeContext";

const AssociationListScreen = () => {

  const { darkMode } =
    useDarkMode();

  const sections = [
    {
      id: "associations",
      component:
        <LatestAssociations />,
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

    <View
      style={[
        styles.container,
        {
          backgroundColor:
            darkMode
              ? "#020617"
              : "#ffffff",
        },
      ]}
    >

      <FlatList
        data={sections}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (

          <View
            style={{
              backgroundColor:
                darkMode
                  ? "#020617"
                  : "#ffffff",
            }}
          >
            {item.component}
          </View>

        )}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingBottom: 40,

          backgroundColor:
            darkMode
              ? "#020617"
              : "#ffffff",
        }}
      />

    </View>

  );

};

export default AssociationListScreen;

const styles = StyleSheet.create({

  container: {
    width: "100%",
  },

});