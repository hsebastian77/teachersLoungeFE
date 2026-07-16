import React, { useState, useEffect } from "react";
import { FlatList, TextInput, Text, View, TouchableOpacity } from "react-native";
import SafeArea from "../../SafeArea";

import { searchUser } from "../../../Controller/SearchUserCommand";
import { useRoute } from "@react-navigation/native";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function SearchUserView({ navigation }) {
  const route = useRoute();
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [listOfUsers, setListOfUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Type at least 2 characters to search.");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    const normalizedCurrentUser = route.params?.User?.userUserName?.trim().toLowerCase();

    if (debouncedValue.length < 2) {
      setListOfUsers([]);
      setIsSearching(false);
      setStatusMessage(debouncedValue.length === 0 ? "Type at least 2 characters to search." : "Keep typing to search usernames.");
      return;
    }

    const controller = new AbortController();

    const fetchUsers = async () => {
      setIsSearching(true);
      setStatusMessage("");

      try {
        const result = await searchUser(debouncedValue, { signal: controller.signal });
        if (result.aborted) {
          return;
        }

        if (!result.ok) {
          setListOfUsers([]);
          setStatusMessage(
            result.rateLimited
              ? "Pause typing for a moment and try again."
              : result.message || "Unable to search for users."
          );
          return;
        }

        const filteredUsers = result.users.filter(
          (user) => {
            const normalizedEmail = user.email?.trim().toLowerCase();
            const normalizedUsername = user.username?.trim().toLowerCase();
            const currentUsername = route.params?.User?.username?.trim().toLowerCase();

            if (normalizedEmail === normalizedCurrentUser) {
              return false;
            }

            if (currentUsername && normalizedUsername === currentUsername) {
              return false;
            }

            return true;
          }
        );

        setListOfUsers(filteredUsers);
        setStatusMessage(filteredUsers.length === 0 ? "No users found." : "");
      } catch (error) {
        setListOfUsers([]);
        setStatusMessage("Unable to search for users.");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, [debouncedValue, route.params?.User?.userUserName]);

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        <TextInput
          placeholder="Search by username"
          onChangeText={setInputValue}
          value={inputValue}
          style={App_StyleSheet.search}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={App_StyleSheet.list_message}>
          {isSearching ? "Searching..." : statusMessage}
        </Text>
        <FlatList
          data={listOfUsers}
          keyExtractor={(item) => item.email}
          style={App_StyleSheet.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={App_StyleSheet.list_item}
              onPress={() => {
                if (navigation) {
                  navigation.navigate("Friend", {
                    FriendEmail: item.email,
                  });
                }
              }}
            >
              <Text>
                {item.username || `${item.firstName || ""} ${item.lastName || ""}`.trim() || "User"}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeArea>
  );
}

export default SearchUserView;