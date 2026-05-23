import React from "react";

import {
  FlatList,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";

import ExploreScreen from "../../components/ExploreScreen";
import LatestLawyer from "../../components/LatestLawyer";
import LatestNews from "../../components/LatestNews";

import { useDarkMode } from "../../../context/app/DarkModeContext";

const LawyerListScreen = () => {

  const { darkMode } =
    useDarkMode();

  const backgroundColor =
    darkMode
      ? "#020617"
      : "#ffffff";

  const sections = [
    {
      id: "lawyers",
      component:
        <LatestLawyer />,
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
          backgroundColor,
        },
      ]}
    >

      {/* STATUS BAR */}

      <StatusBar
        barStyle={
          darkMode
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          backgroundColor
        }
      />

      <FlatList
        data={sections}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (

          <View
            style={{
              backgroundColor,
            }}
          >
            {item.component}
          </View>

        )}
        showsVerticalScrollIndicator={
          false
        }
        style={{
          backgroundColor,
        }}
        contentContainerStyle={{
          paddingBottom: 40,
          backgroundColor,
        }}
      />

    </View>

  );

};

export default LawyerListScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

});