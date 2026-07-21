import User from "../Model/User";
import * as SecureStore from "expo-secure-store";
import { apiUrl, loginRoute } from "@env";

const getFullAuthToken = (data) => {
  if (typeof data?.token === "string" && data.token) return data.token;
  if (typeof data?.accessToken === "string" && data.accessToken) return data.accessToken;
  return null;
};

const getMfaToken = (data) => {
  if (typeof data?.mfaToken === "string" && data.mfaToken) return data.mfaToken;
  if (typeof data?.preAuthToken === "string" && data.preAuthToken) return data.preAuthToken;
  if (typeof data?.challengeToken === "string" && data.challengeToken) return data.challengeToken;
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

// Logs user into the app based on their email and password
async function login(email, password) {
  if (!email || !password) {
    return { ok: false, message: "Email and password must not be blank" };
  }

  const urlLogin = apiUrl + loginRoute;

  const reqOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Send all formats for backend compatibility
    body: JSON.stringify({
      identifier: email,
      username: email,
      email: email,
      password: password,
    }),
  };

  try {
    console.log("LOGIN URL:", urlLogin);
    const response = await fetch(urlLogin, reqOptions);
    console.log("RESPONSE STATUS:", response.status);
    const data = await safeParseJson(response);
    console.log("RESPONSE DATA:", data);

    if (response.status !== 200) {
      return { ok: false, message: data.message || "Unable to sign in" };
    }

    if (!data.user) {
      return { ok: false, message: data.message || "Unable to sign in" };
    }

    // Build user
    const schoolInfo = data.user.SchoolName || data.user.SchoolID || "";

    const user = new User(
      data.user.Email,
      data.user.FirstName,
      data.user.LastName,
      schoolInfo,
      data.user.Role,
      data.user.ProfilePicLink,
      data.user.Username
    );

    // Role check
    if (user.userRole !== "Approved" && user.userRole !== "Admin") {
      return {
        ok: false,
        message: "Your account is still awaiting approval",
      };
    }

    const fullToken = getFullAuthToken(data);
    const mfaToken = getMfaToken(data);

    await SecureStore.setItemAsync("userEmail", String(user.userUserName || data.user.Email || ""));

    const emailVerified =
      data?.emailVerified ??
      data?.isEmailVerified ??
      data?.user?.emailVerified ??
      data?.user?.isEmailVerified ??
      data?.user?.EmailVerified;

    const requires2FA =
      emailVerified === false ||
      data?.requiresEmailVerification === true ||
      data?.requiresVerification === true ||
      data?.status === "MFA_REQUIRED" ||
      data?.requiresMFA === true ||
      data?.mfaRequired === true ||
      (typeof data.requires2FA === "boolean" ? data.requires2FA : false);

    if (requires2FA) {
      if (mfaToken) {
        await SecureStore.setItemAsync("token", mfaToken);
      } else if (fullToken) {
        await SecureStore.setItemAsync("token", fullToken);
      } else {
        return {
          ok: false,
          message: "MFA required but no token provided",
        };
      }

      return {
        ok: true,
        requires2FA: true,
        user,
        email: user.userEmail,
        tempToken: mfaToken || fullToken,
      };
    }

    if (!fullToken) {
      return {
        ok: false,
        message: "Login succeeded but no token provided",
      };
    }

    await SecureStore.setItemAsync("token", fullToken);

    return {
      ok: true,
      user,
      requires2FA: false,
      email: user.userEmail,
      token: fullToken,
    };

  } catch (error) {
    return {
      ok: false,
      message:
        "Unable to connect to server. Please check your internet connection.",
    };
  }
}

export { login };