import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileView from "./ProfileView";
import EditProfileView from "./EditProfileView";
import EditView from "./EditView";
import SettingsView from "./SettingsView";

import PostListingsView from "../HomeView/PostListingsView";
import PostModeratorView from "../ProfileView/PostModeratorView";
import UserModeratorView from "../ProfileView/UserModeratorView";

const Stack = createNativeStackNavigator();

function ProfileNavigator({ route }) {
  const params = route?.params;

  return (
    <Stack.Navigator
      screenOptions={{
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
      }}
    >
      <Stack.Screen
        name="Profile"
        component={ProfileView}
        initialParams={params}
        options={{ headerLeft: () => null }}
      />

      <Stack.Screen
        name="Edit Profile"
        component={EditProfileView}
        initialParams={params}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Edit"
        component={EditView}
        initialParams={params}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsView}
        initialParams={params}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Home"
        component={PostListingsView}
        initialParams={params}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="User Moderation"
        component={UserModeratorView}
        initialParams={params}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Post Moderation"
        component={PostModeratorView}
        initialParams={params}
        options={{ headerBackTitleVisible: false }}
      />
    </Stack.Navigator>
  );
}

export default ProfileNavigator;