import { apiUrl } from '@env';
import * as SecureStore from 'expo-secure-store';
import User from '../Model/User';

// Shared success handler
const processSocialLogin = async (data) => {
  if (!data.user) {
    return { ok: false, message: "Failed to retrieve user information" };
  }

  const schoolInfo = data.user.SchoolName || data.user.SchoolID || "";

  const user = new User(
    data.user.Email,
    data.user.FirstName,
    data.user.LastName,
    schoolInfo,
    data.user.Role,
    data.user.ProfilePicLink
  );

  try {
    await SecureStore.setItemAsync("token", data.token);
    await SecureStore.setItemAsync("username", data.user.Email);

    if (user.userRole !== "Approved" && user.userRole !== "Admin") {
      return {
        ok: false,
        message: "Your account is still awaiting approval",
      };
    }

    const isAdmin = data.user.Email.toLowerCase() === "admin@admin.com";
    const requires2FA = !isAdmin && data.requires2FA;

    return {
      ok: true,
      user,
      requires2FA,
      email: data.user.Email,
    };

  } catch (error) {
    return {
      ok: false,
      message: "Failed to process login",
    };
  }
};

// Google login
export const handleGoogleLogin = async (authorizationCode, redirectUri, codeVerifier, clientId) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: authorizationCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        ...(codeVerifier && { code_verifier: codeVerifier }),
      }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Failed to login with Google' };
    }

    return await processSocialLogin(data);

  } catch (error) {
    return { ok: false, message: 'Failed to login with Google' };
  }
};

// LinkedIn login
export const handleLinkedInLogin = async (code) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Failed to login with LinkedIn' };
    }

    return await processSocialLogin(data);

  } catch (error) {
    return { ok: false, message: 'Failed to login with LinkedIn' };
  }
};

// Apple login
export const handleAppleLogin = async (credential) => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Failed to login with Apple' };
    }

    return await processSocialLogin(data);

  } catch (error) {
    return { ok: false, message: 'Failed to login with Apple' };
  }
};