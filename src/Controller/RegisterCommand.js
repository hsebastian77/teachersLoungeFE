import User from "../Model/User";
import { Alert } from "react-native";
import { apiUrl, registerRoute, PASSWORD_ENCRYPTER } from "@env";

async function register(fName, lName, username, email, password) {
  if (fName && lName && username && email && password) {
    let urlRegister = apiUrl + registerRoute;

    try {
      const response = await fetch(urlRegister, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fName,
          lastName: lName,
          username,
          email,
          password,
          role: "Approved"
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        return { ok: false, message: data.message || "Failed to register" };
      }

      return { ok: true, message: "Account Created!" };

    } catch (error) {
      return {
        ok: false,
        message: "Unable to connect to server.",
      };
    }
  }

  return { ok: false, message: "Fields cannot be blank" };
}

export { register };