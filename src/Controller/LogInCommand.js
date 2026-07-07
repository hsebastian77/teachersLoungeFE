import { Alert } from "react-native";
import User from "../Model/User";
import * as SecureStore from 'expo-secure-store';
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
  } catch (error) {
    return { message: text };
  }
};

//Logs user into the app based on their email and password
async function login({ navigation }, identifier, password) {
  if (identifier != "" && password != "") {

    //URL for server
    let urlLogin = apiUrl + loginRoute;
    const reqOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Send both keys for backend compatibility (some versions expect username, others email).
      body: JSON.stringify({
        identifier,
        username: identifier,
        email: identifier,
        password: password,
      }),
    };
    
    try {
      const response = await fetch(urlLogin, reqOptions);
      const data = await safeParseJson(response);

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
            const fullToken = getFullAuthToken(data);
            const mfaToken = getMfaToken(data);

            // Store username in secure store
            await SecureStore.setItemAsync("username", data.user.Email || identifier);

            if (user.userRole == "Approved" || user.userRole == "Admin") {
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
                (typeof data.requires2FA === "boolean" ? data.requires2FA : true);

              if (requires2FA) {
                if (mfaToken) {
                  await SecureStore.setItemAsync("token", mfaToken);
                  navigation.navigate("TwoFactorAuth", { User: user, email: data.user.Email || identifier });
                } else if (fullToken) {
                  // Backward compatibility with older backend behavior.
                  await SecureStore.setItemAsync("token", fullToken);
                  navigation.navigate("TwoFactorAuth", { User: user, email: data.user.Email || identifier });
                } else {
                  return { ok: false, message: "MFA is required but no challenge token was provided by the server." };
                }
              } else {
                if (!fullToken) {
                  return { ok: false, message: "Login succeeded but no session token was provided by the server." };
                }
                await SecureStore.setItemAsync("token", fullToken);
                navigation.navigate("User", { User: user });
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
        message: `Unable to connect to server at ${apiUrl}. Please check your internet connection and backend server.`,
      };
    }
  } else {
    return { ok: false, message: "Email/username and password must not be blank" };
  }
}

export { login };
