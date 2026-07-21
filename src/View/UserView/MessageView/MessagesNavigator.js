import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ConversationView from "./ConversationView";
import CreateNewChatView from "./CreateNewChatView";
import MessagesView from "./MessagesView";
import ConversationInfoView from "./ConversationInfoView";

import App_StyleSheet from "../../../Styles/App_StyleSheet";

const Stack = createNativeStackNavigator();

const newChatIcon = require("../../../../assets/newMessage.png");

export default function MessagesNavigator() {
  const defaultOptions = {
    headerTitleAlign: "left",
    headerStyle: {
      backgroundColor: "#6382E8",
      shadowOpacity: 0,
      borderBottomWidth: 0,
    },
    headerTitleStyle: {
      fontSize: 32,
      fontWeight: "bold",
    },
    headerTintColor: "#ffffff",
    headerLeftContainerStyle: { paddingLeft: 10 },
  };

  return (
    <Stack.Navigator screenOptions={defaultOptions}>
      <Stack.Screen
        name="Messages"
        component={MessagesView}
        options={({ navigation }) => ({
          headerLeft: () => null,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("New Chat")}
              style={App_StyleSheet.header_button}
            >
              <Image
                source={newChatIcon}
                style={App_StyleSheet.header_icon}
              />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="Conversation"
        component={ConversationView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="New Chat"
        component={CreateNewChatView}
        options={{ headerBackTitleVisible: false }}
      />

      <Stack.Screen
        name="Conversation Info"
        component={ConversationInfoView}
        options={{ headerBackTitleVisible: false }}
      />
    </Stack.Navigator>
  );
}