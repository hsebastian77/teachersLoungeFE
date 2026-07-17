import User from "../Model/User";
import * as SecureStore from 'expo-secure-store';
import { apiUrl, loginRoute } from "@env";

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
    body: JSON.stringify({ username: email, password: password }),
  };

  try {
    const response = await fetch(urlLogin, reqOptions);
    const data = await response.json();

    if (response.status !== 200) {
      return { ok: false, message: data.message || "Unable to sign in" };
    }

    if (!data.user) {
      return { ok: false, message: data.message || "Unable to sign in" };
    }

    // Handle school info fallback
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

    // Store token + username
    await SecureStore.setItemAsync("token", data.token);
    await SecureStore.setItemAsync("username", email);

    // Only approved users can login
    if (user.userRole !== "Approved" && user.userRole !== "Admin") {
      return {
        ok: false,
        message: "Your account is still awaiting approval",
      };
    }

    // Check if admin bypasses 2FA
    const requires2FA = email.toLowerCase() !== "admin@admin.com";

    return {
      ok: true,
      user,
      requires2FA,
      email,
      token: data.token,
    };

  } catch (error) {
    return {
      ok: false,
      message: "Unable to connect to server. Please check your internet connection.",
    };
  }
}

export { login };