import { Alert } from "react-native";
import User from "../Model/User";
import * as SecureStore from 'expo-secure-store';
import { apiUrl, loginRoute } from "@env";

//Logs user into the app based on their email and password
async function login({ navigation }, email, password) {
  if (email != "" && password != "") {
    //URL for server
    let urlLogin = apiUrl + loginRoute;
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

      if (response.status != 200) {
        return { ok: false, message: data.message || "Unable to sign in" };
      } else { // Successful login
        if (data.user != null) {
          // 兼容新旧版本：优先使用SchoolName，如果不存在则使用SchoolID，都没有则使用空字符串
          const schoolInfo = data.user.SchoolName || data.user.SchoolID || "";
          
          let user = new User(
            data.user.Email,
            data.user.FirstName,
            data.user.LastName,
            schoolInfo,
            data.user.Role,
            data.user.ProfilePicLink,
            data.user.Username
          );

          try {
            // Store token in secure store
            await SecureStore.setItemAsync("token", data.token);

            // Store username in secure store
            await SecureStore.setItemAsync("username", email);

            if (user.userRole == "Approved" || user.userRole == "Admin") {
              // Check if this is the admin account which should bypass 2FA
              if (email.toLowerCase() === "admin@admin.com") {
                // Admin account bypasses 2FA and goes directly to main app
                navigation.navigate("User", { User: user });
              } else {
                // 2FA is mandatory for all other users
              navigation.navigate("TwoFactorAuth", { User: user, email: email });
              }
              return { ok: true };
            } else {
              //Only approved users can login
              return { ok: false, message: "Your account is still awaiting approval" };
            }
          } catch (error) {
            return { ok: false, message: "Unable to complete sign in. Please try again." };
          }

        } else {
          return { ok: false, message: data.message || "Unable to sign in" };
        }
      }
    } catch (error) {
      return {
        ok: false,
        message: "Unable to connect to server. Please check your internet connection.",
      };
    }
  } else {
    return { ok: false, message: "Email and password must not be blank" };
  }
}

export { login };
