import { React, useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, Animated, Image, KeyboardAvoidingView, Platform, Linking, Alert, Modal } from "react-native";
import { TextInput } from "react-native-paper";
//import LogInCommand from "../Controller/LogInCommand";
import { login } from "../Controller/LogInCommand";
import App_StyleSheet from "../Styles/App_StyleSheet";
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { handleGoogleLogin, handleLinkedInLogin, handleAppleLogin } from '../Controller/SocialLoginCommand';
import { WebView } from 'react-native-webview';

WebBrowser.maybeCompleteAuthSession();

let logo = require("../../assets/logo.png");

// Google OAuth configuration - Platform-specific Client IDs
const GOOGLE_ANDROID_CLIENT_ID = '503056180344-vfqo4hkmm4qoe1e2a5b3t4itpqs8sbcf.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '503056180344-b2mc69o5h958afpkoclbjl6pk3lcc6dl.apps.googleusercontent.com';

// Use platform-specific URL schemes for Google OAuth
const getGoogleRedirectUri = () => {
  if (Platform.OS === 'ios') {
    return 'com.googleusercontent.apps.503056180344-b2mc69o5h958afpkoclbjl6pk3lcc6dl://';
  } else {
    return 'com.googleusercontent.apps.503056180344-vfqo4hkmm4qoe1e2a5b3t4itpqs8sbcf://';
  }
};

const GOOGLE_REDIRECT_URI = getGoogleRedirectUri();

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = '77bw10d90022pu';
const LINKEDIN_REDIRECT_URI = 'https://omegaeducationaltechsolutions.com/linkedin-redirect';

function SignInView({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  // State for LinkedIn WebView modal
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [linkedInAuthUrl, setLinkedInAuthUrl] = useState('');

  // Google Auth Request
  const [googleRequest, googleResponse, googlePromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.OS === 'android' ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_IOS_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: GOOGLE_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      additionalParameters: {
        prompt: 'select_account',
      },
    },
    { 
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  // LinkedIn Auth Request - Updated for OpenID Connect
  const [linkedInRequest, linkedInResponse, linkedInPromptAsync] = AuthSession.useAuthRequest(
    {
      clientId: LINKEDIN_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'], // Updated to include 'openid' for OpenID Connect
      redirectUri: LINKEDIN_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: false,
      additionalParameters: {
        response_type: 'code',
        state: Math.random().toString(36).substring(7), 
      },
    },
    { authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization' }
  );

  // Handle Google auth response
  useEffect(() => {
    const processGoogleResponse = async () => {
      if (!googleResponse) {
        return;
      }

      if (googleResponse?.type === 'success') {
        setAuthLoading(true);
        setAuthError("");
      const { code } = googleResponse.params;

      // Get the code verifier for PKCE if available
      const codeVerifier = googleRequest?.codeVerifier;

      const clientId = Platform.OS === 'android' ? GOOGLE_ANDROID_CLIENT_ID : GOOGLE_IOS_CLIENT_ID;
        const success = await handleGoogleLogin(navigation, code, GOOGLE_REDIRECT_URI, codeVerifier, clientId);
        if (!success) {
          setAuthError("Google sign in failed. Please try again.");
        }
        setAuthLoading(false);
      } else if (googleResponse?.type === 'error') {
        setAuthLoading(false);
        setAuthError("Google sign in failed. Please try again.");
      } else if (googleResponse?.type === 'cancel') {
        setAuthLoading(false);
      }
    };

    processGoogleResponse();
  }, [googleResponse]);

  // Handle LinkedIn login using custom WebView modal
  const handleLinkedInWebViewAuth = async () => {
    try {
      setAuthLoading(true);
      setAuthError("");
      
      // Generate state parameter for security
      const state = Math.random().toString(36).substring(7);
      
      // Build LinkedIn authorization URL with OpenID Connect scope
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&scope=openid%20profile%20email&state=${state}`;
      
      // Set the auth URL and show the modal
      setLinkedInAuthUrl(authUrl);
      setShowLinkedInModal(true);
      
    } catch (error) {
      setAuthLoading(false);
      setAuthError('LinkedIn login failed. Please try again.');
      Alert.alert('LinkedIn Login Error', `Error: ${error.message}`);
    }
  };

  // Handle WebView navigation state changes
  const handleWebViewNavigationStateChange = (navState) => {
    // Check if the URL contains our redirect URI
    if (navState.url && navState.url.includes('omegaeducationaltechsolutions.com/linkedin-redirect')) {
      try {
        // Parse the URL to extract authorization code
        const url = new URL(navState.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        // Close the modal first
        setShowLinkedInModal(false);
        
        if (error) {
          setAuthLoading(false);
          setAuthError('LinkedIn login failed. Please try again.');
          Alert.alert('LinkedIn Login Error', `Authorization failed: ${error}`);
          return;
        }
        
        if (!code) {
          setAuthLoading(false);
          setAuthError('LinkedIn login failed. Please try again.');
          Alert.alert('LinkedIn Login Error', 'No authorization code received');
          return;
        }

        // Send code to backend for processing
        handleLinkedInLogin(navigation, code).finally(() => setAuthLoading(false));
        
      } catch (error) {
        setAuthLoading(false);
        setAuthError('LinkedIn login failed. Please try again.');
        Alert.alert('LinkedIn Login Error', 'Failed to process authorization response');
      }
    }
  };

  // Handle WebView load error
  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setAuthLoading(false);
    setAuthError('LinkedIn login failed. Please try again.');
    setShowLinkedInModal(false);
    Alert.alert('LinkedIn Login Error', 'Failed to load LinkedIn login page');
  };

  return (
    <View style={App_StyleSheet.register_signIn_background}>
      <View style={App_StyleSheet.block}>
        <Image style={App_StyleSheet.logoStyle} source={logo} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={60}
        >
          <TextInput
            style={App_StyleSheet.textBlock}
            placeholder="Email"
            underlineColor={"transparent"}
            selectionColor={"black"}
            activeUnderlineColor={"transparent"}
            multiline={false}
            returnKeyType="done"
            onChangeText={(value) => setEmail(value)}
            autoCapitalize="none"
          />
          <TextInput
            secureTextEntry={true}
            style={App_StyleSheet.textBlock}
            placeholder="Password"
            underlineColor={"transparent"}
            selectionColor={"black"}
            activeUnderlineColor={"transparent"}
            multiline={false}
            returnKeyType="done"
            onChangeText={(value) => setPassword(value)}
          />
        </KeyboardAvoidingView>

        {authError ? <Text style={App_StyleSheet.authErrorText}>{authError}</Text> : null}
        

        
        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={
            async () => {
              setAuthLoading(true);
              setAuthError("");
              const result = await login({ navigation }, email, password);
              if (!result?.ok) {
                setAuthError(result?.message || "Unable to sign in.");
              }
              setAuthLoading(false);
            }
          }
          disabled={authLoading}
        >
          <Text style={App_StyleSheet.text}>{authLoading ? "Signing In..." : "Sign In"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={() => navigation.navigate("Register")}
          disabled={authLoading}
        >
          <Text style={App_StyleSheet.text}>{"Sign Up"}</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={App_StyleSheet.divider}>
          <View style={App_StyleSheet.dividerLine} />
          <Text style={App_StyleSheet.dividerText}>OR</Text>
          <View style={App_StyleSheet.dividerLine} />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity
          style={[App_StyleSheet.socialLoginButton, { backgroundColor: '#DB4437' }]}
          onPress={() => {
            setAuthLoading(true);
            setAuthError("");
            googlePromptAsync();
          }}
          disabled={!googleRequest || authLoading}
        >
          <FontAwesome name="google" size={20} color="white" />
          <Text style={App_StyleSheet.socialButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[App_StyleSheet.socialLoginButton, { backgroundColor: '#0077B5' }]}
          onPress={handleLinkedInWebViewAuth}
          disabled={authLoading}
        >
          <FontAwesome name="linkedin" size={20} color="white" />
          <Text style={App_StyleSheet.socialButtonText}>Sign in with LinkedIn</Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={20}
            style={App_StyleSheet.appleButton}
            onPress={async () => {
              try {
                setAuthLoading(true);
                setAuthError("");
                const credential = await AppleAuthentication.signInAsync({
                  requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                  ],
                });
                await handleAppleLogin(navigation, credential);
              } catch (e) {
                if (e.code === 'ERR_REQUEST_CANCELED') {
                  // User canceled Apple sign in
                } else {
                  setAuthError('Apple sign in failed. Please try again.');
                }
              } finally {
                setAuthLoading(false);
              }
            }}
          />
        )}
      </View>

      {showLinkedInModal && (
        <Modal
          visible={showLinkedInModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowLinkedInModal(false)}
        >
          <View style={App_StyleSheet.modalBackground}>
            <View style={App_StyleSheet.modalContent}>
              {/* Close button */}
              <TouchableOpacity
                style={App_StyleSheet.modalCloseButton}
                onPress={() => setShowLinkedInModal(false)}
              >
                <Text style={App_StyleSheet.modalCloseText}>×</Text>
              </TouchableOpacity>
              
              {/* WebView for LinkedIn OAuth */}
              <WebView
                source={{ uri: linkedInAuthUrl }}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                onError={handleWebViewError}
                style={{ flex: 1 }}
                startInLoadingState={true}
                scalesPageToFit={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
export default SignInView;
