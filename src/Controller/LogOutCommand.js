import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

class LogOutCommand {
  constructor() {}

  async LogOut() {
    try {
      // Remove token from Secure Store
      await SecureStore.deleteItemAsync("token");

      // Return success so the View/AuthContext can react
      return { ok: true };
    } catch (error) {
      Alert.alert("Couldn't logout, please try again");
      return { ok: false };
    }
  }
}

export default LogOutCommand;