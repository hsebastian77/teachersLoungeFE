import React, { useState, useEffect } from "react";
import { FlatList, TextInput, Text, View, TouchableOpacity } from "react-native";
import SafeArea from "../../SafeArea";
import { useAuth } from "../../../context/AuthContext";
import { searchUser } from "../../../Controller/SearchUserCommand";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function SearchUserView({ navigation }) {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [listOfUsers, setListOfUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const array = await searchUser(searchQuery);

        // remove current user from results
        const filtered = array.filter(
          (u) => u.email !== user?.userUserName
        );

        setListOfUsers(filtered);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, [searchQuery, user?.userUserName]);

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        <TextInput
          placeholder="Search a User"
          onChangeText={setSearchQuery}
          style={App_StyleSheet.search}
        />

        <FlatList
          data={listOfUsers}
          keyExtractor={(item) => item.email}
          style={App_StyleSheet.list}
          ListEmptyComponent={
            <Text style={App_StyleSheet.text}>No users found</Text>
          }
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
      </View>
    </SafeArea>
  );
}

export default SearchUserView;