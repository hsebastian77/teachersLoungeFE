import React, { useState, useContext } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { sendMessage } from "../../../Controller/DirectMessagesManager";
import { useAuth } from "../../../context/AuthContext";

function TextBox({ navigation, details }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessageHandler = async () => {
    if (message.trim().length === 0 || sending) return;

    try {
      setSending(true);

      const result = await sendMessage(
        details.conversationId,
        message.trim(),
        user.userUserName
      );

      if (result) {
        setMessage(""); // clear only after success

        if (details?.onMessageSent) {
          details.onMessageSent();
        }
      }
    } catch (error) {
      console.log("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        mode="outlined"
        outlineColor="#ddd"
        activeOutlineColor="#007aff"
        placeholder="Type a message..."
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity
        style={styles.sendButton}
        onPress={sendMessageHandler}
        disabled={sending}
      >
        <Text style={styles.sendText}>
          {sending ? "..." : "Send"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  sendButton: {
    backgroundColor: "#6382E8",
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  sendText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default TextBox;