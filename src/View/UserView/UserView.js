import React from "react";
import { useRoute } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeNavigator from "./HomeView/HomeNavigator.js";
import MessagesNavigator from "./MessageView/MessagesNavigator.js";
import ProfileNavigator from "./ProfileView/ProfileNavigator.js";
import FriendsNavigator from "./FriendsView/FriendsNavigator.js";
import PrivateSpacesNavigator from "./PrivateSpacesView/PrivateSpacesNavigator.js";

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const route = useRoute();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: "#6382E8" },
        headerTintColor: "#6382E8",
        tabBarActiveBackgroundColor: "#6382E8",
        tabBarInactiveBackgroundColor: "#6382E8",
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#FFFFFF",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        initialParams={route?.params}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Friends"
        component={FriendsNavigator}
        initialParams={route?.params}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="magnifying-glass" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Spaces"
        component={PrivateSpacesNavigator}
        initialParams={route?.params}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="lock" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        initialParams={route?.params}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="message" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        initialParams={route?.params}
        options={{
          tabBarIcon: ({ size, color }) => (
            <Entypo name="user" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

export default function UserView() {
  return <TabNavigator />;
}