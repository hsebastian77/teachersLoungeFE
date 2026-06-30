
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
      body: JSON.stringify({ firstName: fName, lastName: lName, username: username, email: email, password: password, role: "Approved" })
    };
    try {
      const response = await fetch(urlRegister, reqOptions);
      const data = await response.json();
      if (response.status != 200) {
        return { ok: false, message: data.message || "Failed to register" };
      } else {
        let user = new User(email, fName, lName);
        navigation.navigate("Login");
        return { ok: true, message: "Account Created!" };
      }
    } catch (error) {
      return {
        ok: false,
        message: "Unable to connect to server. Please check your internet connection.",
      };
    }
  } else {
    return { ok: false, message: "Fields cannot be blank" };
  }
}

export { register };