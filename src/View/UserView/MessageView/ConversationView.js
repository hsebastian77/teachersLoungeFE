import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { SafeAreaView } from "react-native-safe-area-context";
import App_StyleSheet from "../../../Styles/App_StyleSheet";
import TextBox from "./TextBox";
import MessageBox from "./MessageBox";
import {
  getConversationDetails,
  getMessages
} from "../../../Controller/DirectMessagesManager";
import { useAuth } from "../../../context/AuthContext";

function ConversationView({ navigation }) {
  const route = useRoute();
  const { user } = useAuth();

  const { conversationId, username, title } = route.params;

  const [messages, setMessages] = useState([]);
  const [convoTitle, setConvoTitle] = useState(username);

  const height = useHeaderHeight();
  const settingIcon = require("../../../../assets/settings.png");

  const loadData = async () => {
    try {
      const data = await getMessages(conversationId);
      const convoData = await getConversationDetails(conversationId);

      setMessages(data.reverse());
      setConvoTitle(convoData.title);
    } catch (error) {
      console.log("Conversation load error:", error);
    }
  };

  // focus effect: only data
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [conversationId])
  );

  // header: reacts to state
  useEffect(() => {
    navigation.setOptions({
      title: convoTitle,
      headerRight: () => (
        <TouchableOpacity
          style={App_StyleSheet.header_button}
          onPress={() =>
            navigation.navigate("Conversation Info", {
              conversationId,
              currentUser: user.userUserName,
              username,
              title,
            })
          }
        >
          <Image
            source={settingIcon}
            style={App_StyleSheet.header_icon}
          />
        </TouchableOpacity>
      ),
    });
  }, [convoTitle]);

  // Called after sending a message
  const handleMessageSent = async () => {
    await loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={height}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <MessageBox
                sender={item.sender}
                senderId={item.senderId}
                message={item.content}
              />
            )}
            inverted
            keyExtractor={(item) => item.id.toString()}
          />
        </View>

        <View style={styles.textBoxWrapper}>
          <TextBox
            conversationId={conversationId}
            onMessageSent={handleMessageSent}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  flex: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  textBoxWrapper: {
    padding: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
    marginTop: 10
  },
});

export default ConversationView;