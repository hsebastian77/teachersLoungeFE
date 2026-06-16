import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SignInView from "./SignInView";
import UserView from "./UserView/UserView";
import RegisterView from "./RegisterView";
import LogOutView from "./UserView/LogOutView";
import UploadView from "./UserView/HomeView/UploadView";
import TwoFactorAuthView from "./TwoFactorAuthView";

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={SignInView} />
        <Stack.Screen name="User" component={UserView} />
        <Stack.Screen name="Register" component={RegisterView} />
        <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthView} />
        <Stack.Screen name="LogOut" component={LogOutView} />
        <Stack.Screen name="Upload" component={UploadView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AuthNavigator;