import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";

import SafeArea from "../../SafeArea";
import ChangeInfoCommand from "../../../Controller/ChangeInfoCommand";

function EditView({ route, navigation }) {
  const { mode, User } = route.params;

  const [textContent, setTextContent] = useState("");

  const changeInfo = new ChangeInfoCommand(User);

  let placeholder = "";
  let buttonLabel = "";

  if (mode === "name") {
    placeholder = User.userName;
    buttonLabel = "Change Name";
  } else if (mode === "username") {
    placeholder = User.username || User.userUserName;
    buttonLabel = "Change Username";
  } else if (mode === "school") {
    placeholder = User.school;
    buttonLabel = "Change School";
  }

  return (
    <SafeArea>
      <TextInput
        placeholder={placeholder}
        value={textContent}
        onChangeText={setTextContent}
      />

      <View style={{ paddingTop: 10, paddingBottom: 10, alignItems: "center" }}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            changeInfo.ChangeInfo(
              { navigation },
              textContent,
              mode
            );
          }}
        >
          <Text style={styles.text}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  userInfoStyle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  editableInfoStyle: {
    fontSize: 15,
    textAlign: "left",
  },
  section: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  buttonStyle: {
    height: 40,
    paddingHorizontal: 30,
    borderWidth: 3,
    borderRadius: 20,
    borderColor: "#fef3d7",
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#411c00",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#ffffff",
    fontSize: 20,
  },
});

export default EditView;