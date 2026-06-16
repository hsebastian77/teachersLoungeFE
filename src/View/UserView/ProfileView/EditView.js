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
    placeholder = User.userUserName;
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
              { navigation, mode, User },
              textContent
            );
          }}
        >
          <Text style={styles.text}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

export default EditView;