
import User from "../Model/User";
import { Alert } from "react-native";
import { apiUrl, registerRoute, PASSWORD_ENCRYPTER } from "@env";


//Called from the RegisterView, creates a new user
async function register({ navigation }, fName, lName, username, email, password){
  if ((fName != "") && (lName != "") && (username != "") && (email != "") && (password != "")) {
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