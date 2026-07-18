import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Platform } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import App_StyleSheet from "../Styles/App_StyleSheet";

import {
  loginWithGoogle,
  loginWithLinkedIn,
  loginWithApple,
} from "../Controller/SocialLoginCommand";

import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth
const GOOGLE_CLIENT_ID = Platform.select({
  ios: "503056180344-b2mc69o5h958afpkoclbjl6pk3lcc6dl.apps.googleusercontent.com",
  android:
    "503056180344-vfqo4hkmm4qoe1e2a5b3t4itpqs8sbcf.apps.googleusercontent.com",
});

const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "teacherslounge",
});

// LinkedIn OAuth
const LINKEDIN_CLIENT_ID = "YOUR_LINKEDIN_CLIENT_ID";
const LINKEDIN_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "teacherslounge",
});

function SocialLoginView() {
  const { setPendingAuth, login } = useAuth();
  const { navigate } = useNavigation();

  // Google Auth
  const [googleRequest, googleResponse, googlePromptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: GOOGLE_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri: GOOGLE_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Token,
      },
      { authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth" }
    );

  // LinkedIn Auth
  const [linkedInRequest, linkedInResponse, linkedInPromptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: LINKEDIN_CLIENT_ID,
        scopes: ["profile", "email"],
        redirectUri: LINKEDIN_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: false,
      },
      {
        authorizationEndpoint:
          "https://www.linkedin.com/oauth/v2/authorization",
        tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
      }
    );

  // Handle Google response
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { access_token } = googleResponse.params;
      handleGoogleLogin(access_token);
    }
  }, [googleResponse]);

  // Handle LinkedIn response
  useEffect(() => {
    if (linkedInResponse?.type === "success") {
      const { code } = linkedInResponse.params;
      handleLinkedInLogin(code);
    }
  }, [linkedInResponse]);

  // Unified auth handler
  const handleAuthResult = async (result) => {
    if (!result.ok) {
      Alert.alert("Login Error", result.message);
      return;
    }

    if (result.requires2FA) {
      setPendingAuth({
        email: result.email,
        tempToken: result.tempToken,
      });

      navigate("TwoFactorAuth");
      return;
    }

    await login(result.user, result.token);
  };

  // Google
  const handleGoogleLogin = async (accessToken) => {
    try {
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`
      );
      const userData = await userInfoResponse.json();

      const result = await loginWithGoogle({
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        providerId: userData.id,
      });

      handleAuthResult(result);
    } catch (error) {
      Alert.alert("Error", "Failed to login with Google");
    }
  };

  // LinkedIn
  const handleLinkedInLogin = async (code) => {
    try {
      const result = await loginWithLinkedIn(code);
      handleAuthResult(result);
    } catch (error) {
      Alert.alert("Error", "Failed to login with LinkedIn");
    }
  };

  // Apple
  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const result = await loginWithApple(credential);
      handleAuthResult(result);
    } catch (error) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", "Failed to login with Apple");
      }
    }
  };

  return (
    <View style={App_StyleSheet.socialLoginContainer}>
      <Text style={App_StyleSheet.socialLoginText}>Or sign in with</Text>

      <TouchableOpacity
        style={App_StyleSheet.socialLoginButton}
        onPress={() => googlePromptAsync()}
        disabled={!googleRequest}
      >
        <FontAwesome name="google" size={24} color="white" />
        <Text style={App_StyleSheet.socialButtonText}>
          Sign in with Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={App_StyleSheet.socialLoginButton}
        onPress={() => linkedInPromptAsync()}
        disabled={!linkedInRequest}
      >
        <FontAwesome name="linkedin" size={24} color="white" />
        <Text style={App_StyleSheet.socialButtonText}>
          Sign in with LinkedIn
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
          }
          buttonStyle={
            AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={5}
          style={App_StyleSheet.appleButton}
          onPress={handleAppleLogin}
        />
      )}
    </View>
  );
}

export default SocialLoginView;