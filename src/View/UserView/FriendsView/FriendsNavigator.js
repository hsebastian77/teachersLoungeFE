import React, { useState, useEffect } from "react";
import { FlatList, TextInput, Text, View, TouchableOpacity } from "react-native";
import SafeArea from "../../SafeArea";
import { useAuth } from "../../../context/AuthContext";
import { searchUser } from "../../../Controller/SearchUserCommand";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function SearchUserView({ navigation }) {
  const { user } = useAuth();

  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const [listOfUsers, setListOfUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Type at least 2 characters to search.");

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch users when debounced value changes
  useEffect(() => {
    if (debouncedValue.length < 2) {
      setListOfUsers([]);
      setIsSearching(false);
      setStatusMessage(
        debouncedValue.length === 0
          ? "Type at least 2 characters to search."
          : "Keep typing to search usernames."
      );
      return;
    }

    const controller = new AbortController();

    const fetchUsers = async () => {
      setIsSearching(true);
      setStatusMessage("");

      try {
        const result = await searchUser(debouncedValue, {
          signal: controller.signal,
        });

        if (result.aborted) return;

        if (!result.ok) {
          setListOfUsers([]);
          setStatusMessage(
            result.rateLimited
              ? "Pause typing for a moment and try again."
              : result.message || "Unable to search for users."
          );
          return;
        }

        // Filter out current user using AuthContext
        const filteredUsers = result.users.filter((u) => {
          const normalizedEmail = u.email?.trim().toLowerCase();
          const currentEmail = user?.userUserName?.trim().toLowerCase();

          return normalizedEmail !== currentEmail;
        });

        setListOfUsers(filteredUsers);
        setStatusMessage(filteredUsers.length === 0 ? "No users found." : "");
      } catch (error) {
        if (!controller.signal.aborted) {
          setListOfUsers([]);
          setStatusMessage("Unable to search for users.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    fetchUsers();

    return () => controller.abort();
  }, [debouncedValue, user?.userUserName]);

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
              onPress={() =>
                navigation.navigate("Friend", {
                  FriendEmail: item.email,
                })
              }
            >
              <Text>
                {item.username ||
                  `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
                  item.email}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeArea>
  );
}

export default SearchUserView;