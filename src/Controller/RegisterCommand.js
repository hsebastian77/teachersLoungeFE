
import User from "../Model/User";
import { Alert } from "react-native";
import { apiUrl, registerRoute, PASSWORD_ENCRYPTER } from "@env";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  upper: /[A-Z]/,
  number: /[0-9]/,
  symbol: /[^A-Za-z0-9]/,
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


//Called from the RegisterView, creates a new user
async function register({ navigation }, fName, lName, username, email, password){
  if ((fName != "") && (lName != "") && (username != "") && (email != "") && (password != "")) {
    if (!EMAIL_REGEX.test(email)) {
      return { ok: false, message: "Please enter a valid email address." };
    }

    if (
      password.length < PASSWORD_REQUIREMENTS.minLength ||
      !PASSWORD_REQUIREMENTS.upper.test(password) ||
      !PASSWORD_REQUIREMENTS.number.test(password) ||
      !PASSWORD_REQUIREMENTS.symbol.test(password)
    ) {
      return {
        ok: false,
        message: "Password must be at least 8 characters and include a capital letter, a number, and a symbol.",
      };
    }

    let urlRegister = apiUrl + registerRoute;
    const reqOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ firstName: fName, lastName: lName, username: username, email: email, password: password })
    };
    try {
      const response = await fetch(urlRegister, reqOptions);
      const data = await safeParseJson(response);
      if (response.status != 200) {
        return { ok: false, message: data.message || "Failed to register" };
      } else {
        navigation.navigate("TwoFactorAuth", {
          email,
          fromRegistration: true,
          registrationData: {
            email,
            username,
            firstName: fName,
            lastName: lName,
          },
        });
        return { ok: true, message: "Account Created!" };
      }
    } catch (error) {
      return {
        ok: false,
        message: `Unable to connect to server at ${apiUrl}. Please check your internet connection and backend server.`,
      };
    }
  } else {
    return { ok: false, message: "Fields cannot be blank" };
  }
}

export { register };