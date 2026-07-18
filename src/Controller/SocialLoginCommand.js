import { apiUrl } from '@env';
import * as SecureStore from 'expo-secure-store';
import User from '../Model/User';

// Extract full session token
const getFullAuthToken = (data) => {
  if (typeof data?.token === 'string' && data.token) return data.token;
  if (typeof data?.accessToken === 'string' && data.accessToken) return data.accessToken;
  return null;
};

// Extract MFA/pre-auth token
const getMfaToken = (data) => {
  if (typeof data?.mfaToken === 'string' && data.mfaToken) return data.mfaToken;
  if (typeof data?.preAuthToken === 'string' && data.preAuthToken) return data.preAuthToken;
  if (typeof data?.challengeToken === 'string' && data.challengeToken) return data.challengeToken;
  return null;
};

const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

// Shared processor for all social logins
const processSocialLogin = async (data) => {
  try {
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

    if (user.userRole !== "Approved" && user.userRole !== "Admin") {
      return {
        ok: false,
        message: "Your account is still awaiting approval",
      };
    }

    const email = data.user.Email || "";
    const fullToken = getFullAuthToken(data);
    const mfaToken = getMfaToken(data);

    const backendRequiresMfa =
      data?.status === "MFA_REQUIRED" ||
      data?.requiresMFA === true ||
      data?.mfaRequired === true ||
      data?.requires2FA === true;

    const requires2FA =
      typeof data.requires2FA === "boolean"
        ? data.requires2FA
        : backendRequiresMfa;

    // If 2FA required, return temp token only
    if (requires2FA) {
      return {
        ok: true,
        requires2FA: true,
        email,
        tempToken: mfaToken || fullToken,
      };
    }

    // Normal login, persist token
    if (fullToken) {
      await SecureStore.setItemAsync("token", fullToken);
      await SecureStore.setItemAsync("username", email);

      return {
        ok: true,
        user,
        requires2FA: false,
      };
    }

    return {
      ok: false,
      message: "Login succeeded but no token was provided",
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

    const data = await safeParseJson(response);

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Failed to login with Google' };
    }

    return await processSocialLogin(data);

  } catch (error) {
    console.error("Google login error:", error);
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

    const data = await safeParseJson(response);

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
        email: credential.email || undefined,
        firstName: credential.fullName?.givenName,
        lastName: credential.fullName?.familyName,
        providerId: credential.user,
        identityToken: credential.identityToken,
      }),
    });

    const data = await safeParseJson(response);

    if (response.status !== 200) {
      return { ok: false, message: data.message || 'Failed to login with Apple' };
    }

    return await processSocialLogin(data);

  } catch (error) {
    return { ok: false, message: 'Failed to login with Apple' };
  }
};