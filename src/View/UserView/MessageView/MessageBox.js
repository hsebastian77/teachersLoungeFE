import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../context/AuthContext";

function MessageBox({ message, sender, senderId }) {
  const { user } = useAuth();

  const incoming = senderId !== user?.id;
  const displayName = incoming ? sender : "You";

  return (
    <View
      style={[
        styles.messageRow,
        incoming ? styles.alignStart : styles.alignEnd,
      ]}
    >
      <View
        style={[
          styles.bubble,
          incoming ? styles.incomingBubble : styles.outgoingBubble,
        ]}
      >
        <Text style={styles.sender}>{displayName}</Text>
        <Text
          style={[
            styles.messageText,
            !incoming && styles.outgoingText,
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    marginVertical: 4,
    marginHorizontal: 8,
    maxWidth: "75%",
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  alignEnd: {
    alignSelf: "flex-end",
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  incomingBubble: {
    backgroundColor: "#e7ecfe",
  },
  outgoingBubble: {
    backgroundColor: "#4e8cff",
  },
  sender: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: "#000",
  },
  outgoingText: {
    color: "#fff",
  },
});

export default MessageBox;