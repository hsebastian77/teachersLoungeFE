import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";

import OpenEditProfileCommand from "../../../Controller/OpenEditProfileCommand";
import LogOutCommand from "../../../Controller/LogOutCommand";
import DeleteAccountCommand from "../../../Controller/DeleteAccountCommand";

import SafeArea from "../../SafeArea";

function SettingsView() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const editProfileCommand = new OpenEditProfileCommand(user);
  const logOutCommand = new LogOutCommand();
  const deleteAccountCommand = new DeleteAccountCommand();

  return (
    <SafeArea>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => editProfileCommand.OpenEditProfile({ navigation })}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => logOutCommand.LogOut({ navigation })}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            deleteAccountCommand.DeleteAccount({ navigation, user })
          }
        >
          <Text style={styles.buttonTextRed}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    padding: 15,
    marginBottom: 15,
    width: "60%",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#e7ecfe",
  },
  buttonText: {
    fontSize: 18,
  },
  buttonTextRed: {
    fontSize: 18,
    color: "red",
  },
});

export default SettingsView;