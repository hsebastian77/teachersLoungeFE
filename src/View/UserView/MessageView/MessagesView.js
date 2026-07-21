import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import SafeArea from "../../SafeArea";
import App_StyleSheet from "../../../Styles/App_StyleSheet";
import { getUserConversations } from "../../../Controller/DirectMessagesManager";
import { useAuth } from "../../../context/AuthContext";

function MessagesView({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  const loadConversations = React.useCallback(async () => {
    try {
      const data = await getUserConversations(user.userUserName);
      setConversations(data);
    } catch (error) {
      console.log("Error loading conversations:", error);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        {conversations && (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Conversation", {
                    conversationId: item.id,
                    username: item.title,
                  })
                }
              >
                <View style={App_StyleSheet.list_item}>
                  <Text>{item.title}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeArea>
  );
}

export default MessagesView;