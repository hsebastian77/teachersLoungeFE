import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FriendsView from "./FriendsView";
import FriendView from "./FriendView";
import SearchUserView from "./SearchUserView";

import App_StyleSheet from "../../../Styles/App_StyleSheet";

const Stack = createNativeStackNavigator();

const searchIcon = require("../../../../assets/search.png");

// Reusable header button
const SearchButton = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate("Search")}
    style={App_StyleSheet.header_button}
  >
    <Image source={searchIcon} style={App_StyleSheet.header_icon} />
  </TouchableOpacity>
);

function FriendsNavigator({ navigation }) {
  const defaultOptions = {
    headerTitleAlign: "left",
    headerStyle: {
      backgroundColor: "#6382E8",
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      fontSize: 32,
      fontWeight: "bold",
    },
    headerTintColor: "#ffffff",
    headerLeftContainerStyle: { paddingLeft: 10 },
  };

  return (
    <Stack.Navigator screenOptions={defaultOptions}>
      <Stack.Screen
        name="Friends"
        component={FriendsView}
        options={{
          headerBackTitleVisible: false,
          headerLeft: () => null,
          headerRight: () => <SearchButton navigation={navigation} />,
        }}
      />

      <Stack.Screen
        name="Friend"
        component={FriendView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Search"
        component={SearchUserView}
        options={{ headerBackTitleVisible: false }}
      />
    </Stack.Navigator>
  );
}

export default FriendsNavigator;