import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeNavigator from "./HomeView/HomeNavigator";
import MessagesNavigator from "./MessageView/MessagesNavigator";
import ProfileNavigator from "./ProfileView/ProfileNavigator";
import FriendsNavigator from "./FriendsView/FriendsNavigator";
import PrivateSpacesNavigator from "./PrivateSpacesView/PrivateSpacesNavigator";

const Tab = createBottomTabNavigator();

export default function UserView() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor: "#6382E8",
        tabBarInactiveBackgroundColor: "#6382E8",
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#FFFFFF",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Friends"
        component={FriendsNavigator}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="magnifying-glass" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Spaces"
        component={PrivateSpacesNavigator}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="lock" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="message" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}