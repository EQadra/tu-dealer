import React from "react";

import {
  FlatList,
  View,
  StyleSheet,
  StatusBar,
} from "react-native";

import ExploreScreen from "../../components/ExploreScreen";
import LatestDoctors from "../../components/LatestDoctor";
import LatestNews from "../../components/LatestNews";

import { useDarkMode } from "../../../context/app/DarkModeContext";

const DoctorListScreen = () => {

  const { darkMode } =
    useDarkMode();

  const backgroundColor =
    darkMode
      ? "#020617"
      : "#ffffff";

  const sections = [
    {
      id: "doctors",
      component:
        <LatestDoctors />,
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
          paddingTop: 0,
          paddingBottom: 40,
          backgroundColor,
        }}
      />

    </View>

  );

};

export default DoctorListScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

});