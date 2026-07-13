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
import ForgotPasswordView from "./ForgotPasswordView";
import ResetPasswordView from "./ResetPasswordView";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ["tlapp://", "teacherslounge://"],
  config: {
    screens: {
      ResetPassword: "reset-password",
    },
  },
};

function AuthNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={SignInView} />
        <Stack.Screen name="User" component={UserView} />
        <Stack.Screen name="Register" component={RegisterView} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordView} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordView} />
        <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthView} />
        <Stack.Screen name="LogOut" component={LogOutView} />
        <Stack.Screen name="Upload" component={UploadView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AuthNavigator;