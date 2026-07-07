import { apiUrl } from '@env';
import * as SecureStore from 'expo-secure-store';
import User from '../Model/User';
import { Alert } from 'react-native';

const getFullAuthToken = (data) => {
  if (typeof data?.token === 'string' && data.token) return data.token;
  if (typeof data?.accessToken === 'string' && data.accessToken) return data.accessToken;
  return null;
};

const getMfaToken = (data) => {
  if (typeof data?.mfaToken === 'string' && data.mfaToken) return data.mfaToken;
  if (typeof data?.preAuthToken === 'string' && data.preAuthToken) return data.preAuthToken;
  if (typeof data?.challengeToken === 'string' && data.challengeToken) return data.challengeToken;
  return null;
};

// Handles Google login authentication
export const handleGoogleLogin = async (navigation, authorizationCode, redirectUri, codeVerifier, clientId) => {
  try {
    const requestUrl = `${apiUrl}/api/auth/google`;
    
    // Prepare request body
    const requestBody = { 
      code: authorizationCode,
      redirect_uri: redirectUri,
      client_id: clientId
    };
    
    // Add code_verifier if available (for PKCE)
    if (codeVerifier) {
      requestBody.code_verifier = codeVerifier;
    }
    
    // Send the authorization code and redirect URI to the backend for processing
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const rawResponse = await response.text();
    let data = {};
    try {
      data = rawResponse ? JSON.parse(rawResponse) : {};
    } catch (parseError) {
      data = { message: rawResponse || 'Invalid server response' };
    }

    if (response.status === 200) {
      await handleSocialLoginSuccess(navigation, data);
      return { ok: true };
    } else {
      const message = data.message || 'Failed to login with Google';
      Alert.alert('Login Error', message);
      return { ok: false, message };
    }
  } catch (error) {
    const message = 'Failed to login with Google: ' + error.message;
    Alert.alert('Error', message);
    return { ok: false, message };
  }
};

// Handles LinkedIn login authentication
export const handleLinkedInLogin = async (navigation, code) => {
  try {
    // Exchange the authorization code for an access token with your backend
    const response = await fetch(`${apiUrl}/api/auth/linkedin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (response.status === 200) {
      await handleSocialLoginSuccess(navigation, data);
      return true;
    } else {
      Alert.alert('Login Error', data.message || 'Failed to login with LinkedIn');
      return false;
    }
  } catch (error) {
    console.error('LinkedIn login error:', error);
    Alert.alert('Error', 'Failed to login with LinkedIn');
    return false;
  }
};

// Handles Apple login authentication
export const handleAppleLogin = async (navigation, credential) => {
  try {
    // Call your backend API to authenticate with Apple credentials
    const response = await fetch(`${apiUrl}/api/auth/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'apple',
        email: credential.email,
        firstName: credential.fullName?.givenName,
        lastName: credential.fullName?.familyName,
        providerId: credential.user,
        identityToken: credential.identityToken,
      }),
    });

    const data = await response.json();
    if (response.status === 200) {
      await handleSocialLoginSuccess(navigation, data);
      return true;
    } else {
      Alert.alert('Login Error', data.message || 'Failed to login with Apple');
      return false;
    }
  } catch (error) {
    console.error('Apple login error:', error);
    Alert.alert('Error', 'Failed to login with Apple');
    return false;
  }
};

// Process successful social login
const handleSocialLoginSuccess = async (navigation, data) => {
  if (data.user != null) {
    // 兼容新旧版本：优先使用SchoolName，如果不存在则使用SchoolID，都没有则使用空字符串
    const schoolInfo = data.user.SchoolName || data.user.SchoolID || "";
    
    let user = new User(
      data.user.Email,
      data.user.FirstName,
      data.user.LastName,
      schoolInfo,
      data.user.Role,
      data.user.ProfilePicLink
    );

    try {
      const email = data.user.Email || "";
      const fullToken = getFullAuthToken(data);
      const mfaToken = getMfaToken(data);

      await SecureStore.setItemAsync("username", String(email));

      if (user.userRole == "Approved" || user.userRole == "Admin") {
        const backendRequiresMfa =
          data?.status === "MFA_REQUIRED" ||
          data?.requiresMFA === true ||
          data?.mfaRequired === true ||
          data?.requires2FA === true;

        const requires2FA = typeof data.requires2FA === 'boolean'
          ? data.requires2FA
          : backendRequiresMfa;

        if (requires2FA) {
          // For MFA flow store only the short-lived pre-auth token when present.
          if (mfaToken) {
            await SecureStore.setItemAsync("token", mfaToken);
            navigation.navigate("TwoFactorAuth", { User: user, email });
          } else if (fullToken) {
            // Backward compatibility with older backend behavior.
            await SecureStore.setItemAsync("token", fullToken);
            navigation.navigate("TwoFactorAuth", { User: user, email });
          } else {
            Alert.alert("Login Error", "MFA is required but no challenge token was provided by the server.");
          }
        } else {
          if (fullToken) {
            await SecureStore.setItemAsync("token", fullToken);
            navigation.navigate("User", { User: user });
          } else {
            Alert.alert("Login Error", "Login succeeded but no session token was provided by the server.");
          }
        }
      } else {
        Alert.alert("Account Status", "Your account is still awaiting approval");
      }
    } catch (error) {
      console.error('Social login processing error:', error);
      Alert.alert("Error", "Failed to process login");
    }
  } else {
    Alert.alert("Error", "Failed to retrieve user information");
  }
}; 