import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { TextInput } from "react-native-paper";
// import LogInCommand from "../Controller/LogInCommand";
import { register } from "../Controller/RegisterCommand";
import App_StyleSheet from "../Styles/App_StyleSheet";

const PASSWORD_GUIDANCE = "Password must be 8+ characters and include a capital letter, a number, and a symbol.";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

function RegisterView({ navigation, route }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  return (
    <View style={App_StyleSheet.register_signIn_background}>
      <View style={App_StyleSheet.block}>
        <TextInput
          style={App_StyleSheet.textBlock}
          placeholder="First Name"
          underlineColor={"transparent"}
          selectionColor={"black"}
          activeUnderlineColor={"transparent"}
          onChangeText={(value) => setFirstName(value)}
        />

        <TextInput
          style={App_StyleSheet.textBlock}
          placeholder="Last Name"
          underlineColor={"transparent"}
          selectionColor={"black"}
          activeUnderlineColor={"transparent"}
          onChangeText={(value) => setLastName(value)}
        />

        <TextInput
          style={App_StyleSheet.textBlock}
          placeholder="Username"
          underlineColor={"transparent"}
          selectionColor={"black"}
          activeUnderlineColor={"transparent"}
          onChangeText={(value) => setUsername(value)}
        />

        <TextInput
          style={App_StyleSheet.textBlock}
          placeholder="Email"
          underlineColor={"transparent"}
          selectionColor={"black"}
          activeUnderlineColor={"transparent"}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={(value) => setEmail(value)}
        />

        <TextInput
          secureTextEntry={true}
          style={App_StyleSheet.textBlock}
          underlineColor={"transparent"}
          selectionColor={"black"}
          activeUnderlineColor={"transparent"}
          placeholder="Password"
          onChangeText={(value) => setPassword(value)}
        />

        <Text style={App_StyleSheet.fieldHelperText}>{PASSWORD_GUIDANCE}</Text>

        {registerError ? <Text style={App_StyleSheet.authErrorText}>{registerError}</Text> : null}

        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={async () => {
            setRegisterLoading(true);
            setRegisterError("");
            const result = await register(
              { navigation },
              firstName,
              lastName,
              username,
              email,
              password
            );
            if (!result?.ok) {
              setRegisterError(result?.message || "Unable to register.");
            }
            setRegisterLoading(false);
          }}
          disabled={registerLoading}
        >
          <Text style={App_StyleSheet.text}>{registerLoading ? "Creating Account..." : "Confirm"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={App_StyleSheet.default_button}
          onPress={() => navigation.navigate("Login")}
          disabled={registerLoading}
        >
          <Text style={App_StyleSheet.text}>{"Back"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default RegisterView;
