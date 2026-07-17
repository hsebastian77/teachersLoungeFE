import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { deleteUser } from "./UserManager";
import { useAuth } from "../context/AuthContext";

class DeleteAccountCommand {
  constructor() {}

  async DeleteAccount() {
    try {
      const { user, setUser } = useAuth();

      await deleteUser(user.userUserName);

      await SecureStore.deleteItemAsync("token");

      setUser(null);

      return { ok: true };
    } catch (error) {
      Alert.alert("Couldn't delete account, please try again");
      return { ok: false };
    }
  }
}

export default DeleteAccountCommand;