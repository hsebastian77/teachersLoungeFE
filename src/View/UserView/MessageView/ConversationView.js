import React, { useEffect, useState } from "react";
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
import { getConversationDetails, getMessages } from "../../../Controller/DirectMessagesManager";

function ConversationView({ navigation }) {
  const route = useRoute();
  const conversationId = route.params.conversationId;
  const [messages, setMessages] = useState([]);
  const [convoTitle, setConvoTitle] = useState(route.params.username);
  let settingIcon = require("../../../../assets/settings.png");

  const height = useHeaderHeight();

  useEffect(() => {
    navigation.setOptions({
      title: convoTitle, // Dynamic title from convoTitle state
      headerRight: () => (
        <TouchableOpacity
          style={App_StyleSheet.header_button}
          onPress={() =>
            navigation.navigate("Conversation Info", {
              conversationId: route.params.conversationId,
              currentUser: route.params.User.userUserName,
              username: route.params.username,
              title: route.params.title,
            })
          }
        >
          <Image source={settingIcon} style={App_StyleSheet.header_icon} />
        </TouchableOpacity>
      ),
    });
  }, [convoTitle, navigation, route.params]);

  const loadData = React.useCallback(async () => {
    try {
      const data = await getMessages(conversationId);
      const convoData = await getConversationDetails(conversationId);
      setMessages([...data].reverse());
      setConvoTitle(convoData.title);
    } catch (error) {
      console.log(error);
    }
  }, [conversationId]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    // Dynamically set the title when the convoTitle changes
    navigation.setOptions({
      title: convoTitle,
    });
  }, [convoTitle, navigation]);

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
                navigation={navigation}
                senderUsername={item.senderUsername}
                message={item.content}
                incoming={
                  route.params.User.userUserName !== item.sender
                }
              />
            )}
            inverted
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
        <View style={styles.textBoxWrapper}>
          <TextBox navigation={navigation} details={route.params} />
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
