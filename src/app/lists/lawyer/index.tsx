import React from "react";

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import LatestLawyer from "../../components/LatestLawyer";
import LatestNews from "../../components/LatestNews";
import ProductList from "../../components/ProductList";

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
      component: <ProductList />,
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

      {/* CONTENIDO - View + map en lugar de FlatList */}
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {
            backgroundColor,
          },
        ]}
      >
        {sections.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor,
            }}
          >
            {item.component}
          </View>
        ))}
      </ScrollView>

    </View>

  );

};

export default LawyerListScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 40,
  },

});