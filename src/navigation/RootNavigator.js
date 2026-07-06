import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import SignInView from "../View/SignInView";
import RegisterView from "../View/RegisterView";
import PostView from "../View/UserView/HomeView/PostView";
import UserView from "../View/UserView/UserView";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={UserView} />
          <Stack.Screen name="PostView" component={PostView} />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInView} />
          <Stack.Screen name="Register" component={RegisterView} />
        </>
      )}
    </Stack.Navigator>
  );
}