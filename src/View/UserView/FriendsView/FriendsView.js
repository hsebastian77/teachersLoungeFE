import React, { useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import App_StyleSheet from "../../../Styles/App_StyleSheet.js";
import SafeArea from "../../SafeArea";
import { getFriendsList } from "../../../Controller/FriendsManager";

function FriendsView({ navigation }) {
  const { user } = useAuth();
  const [listOfUsers, setListOfUsers] = useState([]);

  const fetchUsers = async () => {
    const array = await getFriendsList(user.userUserName);
    setListOfUsers(array);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [user.userUserName])
  );

  return (
    <SafeArea>
      <FlatList
        style={App_StyleSheet.content}
        ListEmptyComponent={
          <Text style={App_StyleSheet.list_message}>
            {"No friends added yet"}
          </Text>
        }
        data={listOfUsers}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={App_StyleSheet.list_item}
            onPress={() =>
              navigation.navigate("Friend", {
                FriendEmail: item.email,
              })
            }
          >
            <Text>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeArea>
  );
}

export default FriendsView;