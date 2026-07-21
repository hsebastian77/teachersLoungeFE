import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { TouchableOpacity, FlatList, View, Text, TextInput, Button, Alert } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import SafeArea from "../../SafeArea";
import UserListing from "../FriendsView/userListing";
import App_StyleSheet from "../../../Styles/App_StyleSheet";
import { getFriendsList } from "../../../Controller/FriendsManager";
import { createConversation } from "../../../Controller/DirectMessagesManager";

function CreateNewChatView({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [listOfUsers, setListOfUsers] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [title, setTitle] = useState("Default Conversation");

  useEffect(() => {
    const fetchUsers = async () => {
      if (isFocused) {
        const array = await getFriendsList(user.userUserName);
        setListOfUsers(array);
      }
    };
    fetchUsers();
  }, [isFocused]);

  const toggleFriendSelection = (email) => {
    if (selectedFriends.includes(email)) {
      setSelectedFriends(prev => prev.filter(friend => friend !== email));
    } else {
      setSelectedFriends(prev => [...prev, email]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert("Error", "You need to select at least one friend.");
      return;
    }

    const members = [user.userUserName, ...selectedFriends];
    const created = await createConversation(members, title || null);

    if (created) {
      Alert.alert("Success", "Conversation created successfully.");
      navigation.goBack();
    } else {
      Alert.alert("Error", "Conversation already exists or failed to create.");
    }
  };

  return listOfUsers.length > 0 ? (
    <SafeArea>
      <TextInput
        style={{ backgroundColor: "#e7ecfe", borderWidth: 1, padding: 10, margin: 10 }}
        placeholder="Enter a Title (optional)"
        value={title}
        onChangeText={setTitle}
      />

      <FlatList
        data={listOfUsers}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleFriendSelection(item.email)}>
            <UserListing
              user={item}
              selected={selectedFriends.includes(item.email)}
            />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.email}
      />

      <TouchableOpacity
        style={[App_StyleSheet.createConvo_button, App_StyleSheet.invert]}
        onPress={handleCreateConversation}
      >
        <Text style={App_StyleSheet.createConvo_button_text}>{"Create Conversation"}</Text>
      </TouchableOpacity>

    </SafeArea >
  ) : (
    <View style={App_StyleSheet.listings}>
      <SafeArea>
        <Text style={App_StyleSheet.moderation_view}>
          You need to have at least 1 friend in order to create a chat.
        </Text>
      </SafeArea>
    </View>
  );
}

export default CreateNewChatView;
