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

export default function ProfileNavigator() {
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
        options={{ headerLeft: () => null }}
      />

      <Stack.Screen
        name="Edit Profile"
        component={EditProfileView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Edit"
        component={EditView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="User Moderation"
        component={UserModeratorView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Post Moderation"
        component={PostModeratorView}
        options={{ headerBackTitleVisible: false }}
      />
    </Stack.Navigator>
  );
}