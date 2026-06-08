import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { TextInput } from "react-native-paper";
import SafeArea from "../../SafeArea";
import ProfileNavigator from "./ProfileNavigator";
import ChangeInfoCommand from "../../../Controller/ChangeInfoCommand";

function EditView({ navigation }) {
  const route = useRoute();
  const [textContent, setTextContent] = useState("");

  const a = new ChangeInfoCommand(route.params.User);

  let b = "";
  if (ProfileNavigator.lastClick === "Edit Name") {
    b = route.params.User.userName;
  } else if (ProfileNavigator.lastClick === "Edit Username") {
    b = route.params.User.userUserName;
  } else if (ProfileNavigator.lastClick === "Edit School") {
    b = route.params.User.school;
  }

  return (
    <SafeArea>
      <TextInput
        placeholder={b}
        value={textContent}
        onChangeText={setTextContent}
      />

      <View
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            a.ChangeInfo({ navigation }, textContent);
          }}
        >
          <Text style={styles.text}>
            Change {ProfileNavigator.lastClick.substring(5)}
          </Text>
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