import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

import TwoFactorAuthView from "../View/TwoFactorAuthView";
import SignInView from "../View/SignInView";
import RegisterView from "../View/RegisterView";
import PostView from "../View/UserView/HomeView/PostView";
import UserView from "../View/UserView/UserView";
import ForgotPasswordView from "../View/ForgotPasswordView";
import ResetPasswordView from "../View/ResetPasswordView";
import UploadView from "../View/UserView/HomeView/UploadView";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, pendingAuth } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={UserView} />
          <Stack.Screen name="PostView" component={PostView} />
          <Stack.Screen name="Upload" component={UploadView} />
        </>
      ) : pendingAuth ? (
        <>
          <Stack.Screen
            name="TwoFactorAuth"
            component={TwoFactorAuthView}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="SignIn" component={SignInView} />
          <Stack.Screen name="Register" component={RegisterView} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordView} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordView} />
        </>
      )}
    </Stack.Navigator>
  );
}