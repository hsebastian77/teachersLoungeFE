import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation, useRoute } from "@react-navigation/native";

import PostListingsView from "./PostListingsView";
import ProfileView from "../ProfileView/ProfileView";
import CommunitiesView from "./CommunitiesView";
import CommunityView from "./CommunityView";
import CreateCommunityView from "./CreateCommunityView";
import SearchCommunityView from "./SearchCommunityView";
import CreatePostView from "./CreatePostView";
import PostView from "./PostView";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

const Stack = createNativeStackNavigator();

const communitiesIcon = require("../../../../assets/communities.png");
const searchIcon = require("../../../../assets/search.png");

function HomeNavigator({ route }) {
  const navigation = useNavigation();
  const params = route?.params;

  return (
    <Stack.Navigator
      screenOptions={{
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
      }}
    >
      <Stack.Screen
        name="Teacher's Lounge"
        component={PostListingsView}
        initialParams={params}
        options={{
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Communities")}
              style={App_StyleSheet.header_button}
            >
              <Image source={communitiesIcon} style={App_StyleSheet.header_icon} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen name="Profile" component={ProfileView} />
      <Stack.Screen name="Communities" component={CommunitiesView} />
      <Stack.Screen name="Community" component={CommunityView} />
      <Stack.Screen name="Create Community" component={CreateCommunityView} />
      <Stack.Screen name="Find Communities" component={SearchCommunityView} />
      <Stack.Screen name="Create Post" component={CreatePostView} />
      <Stack.Screen name="View Post" component={PostView} />
    </Stack.Navigator>
  );
}

export default HomeNavigator;