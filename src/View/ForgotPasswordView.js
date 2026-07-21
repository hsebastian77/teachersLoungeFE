import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { TextInput } from "react-native-paper";
import App_StyleSheet from "../Styles/App_StyleSheet";
import { requestPasswordReset } from "../Controller/PasswordResetCommand";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

function ForgotPasswordView() {
  const { setPendingAuth } = useAuth();
  const { navigate } = useNavigation();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequestReset = async () => {
    setIsSubmitting(true);
    setStatusMessage("");
    setErrorMessage("");

    const result = await requestPasswordReset(email);

    if (result.ok) {
      setStatusMessage(result.message);
      setPendingAuth({ email });
    } else {
      setErrorMessage(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <View style={App_StyleSheet.register_signIn_background}>
      <View style={styles.screenContent}>
        <KeyboardAvoidingView
          style={styles.keyboardWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={60}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we will send a 6-digit reset code.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              underlineColor={"transparent"}
              selectionColor={"black"}
              activeUnderlineColor={"transparent"}
              multiline={false}
              returnKeyType="done"
              onChangeText={(value) => setEmail(value)}
              value={email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            {statusMessage ? (
              <Text style={styles.successText}>{statusMessage}</Text>
            ) : null}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRequestReset}
              disabled={isSubmitting}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigate("ResetPassword")}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>I Have a Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigate("Login")}
              disabled={isSubmitting}
            >
              <Text style={styles.linkButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  keyboardWrapper: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#D7E2FF",
    shadowColor: "#2D4B96",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#233B76",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#5A6A8D",
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    height: 44,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6382E8",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  successText: {
    color: "#1D6F42",
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 6,
  },
  errorText: {
    color: "#B3261E",
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 6,
  },
  primaryButton: {
    width: "100%",
    minHeight: 46,
    borderRadius: 26,
    marginTop: 10,
    backgroundColor: "#6382E8",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    minHeight: 44,
    borderRadius: 24,
    marginTop: 10,
    backgroundColor: "#E7ECFE",
    borderWidth: 1,
    borderColor: "#C2D0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#233B76",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  linkButtonText: {
    color: "#4264CF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ForgotPasswordView;
