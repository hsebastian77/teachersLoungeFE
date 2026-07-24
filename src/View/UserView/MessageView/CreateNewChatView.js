import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import SafeArea from "../../SafeArea";
import { getFriendsList } from "../../../Controller/FriendsManager";
import { searchUser } from "../../../Controller/SearchUserCommand";
import { createConversation } from "../../../Controller/DirectMessagesManager";

function CreateNewChatView({ navigation }) {
  const route = useRoute();
  const currentUser = route.params?.User;
  const currentUserEmail = currentUser?.userUserName?.trim() || "";

  const [friends, setFriends] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [title, setTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFriends = async () => {
      if (!currentUserEmail) {
        setLoadError("Your account information is missing. Please sign in again.");
        setIsLoadingFriends(false);
        return;
      }

      setIsLoadingFriends(true);
      setLoadError("");
      try {
        const data = await getFriendsList(currentUserEmail);
        if (active) setFriends(Array.isArray(data) ? data : []);
      } catch (error) {
        if (active) {
          setFriends([]);
          setLoadError("Unable to load friends. You can still search for a user below.");
        }
      } finally {
        if (active) setIsLoadingFriends(false);
      }
    };

    loadFriends();
    return () => {
      active = false;
    };
  }, [currentUserEmail]);

  useEffect(() => {
    const normalizedSearch = searchText.trim();
    if (normalizedSearch.length < 2) {
      setSearchResults([]);
      setSearchMessage("");
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchMessage("");

      const result = await searchUser(normalizedSearch, {
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (!result.ok) {
        setSearchResults([]);
        setSearchMessage(result.message || "Unable to search for users.");
        setIsSearching(false);
        return;
      }

      const normalizedCurrentUser = currentUserEmail.toLowerCase();
      const users = result.users.filter(
        (user) => user.email?.trim().toLowerCase() !== normalizedCurrentUser
      );
      setSearchResults(users);
      setSearchMessage(users.length === 0 ? "No matching users found." : "");
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchText, currentUserEmail]);

  const isSearchMode = searchText.trim().length >= 2;
  const displayedUsers = useMemo(
    () => (isSearchMode ? searchResults : friends),
    [friends, isSearchMode, searchResults]
  );

  const toggleRecipient = (email) => {
    setSelectedRecipients((current) =>
      current.includes(email)
        ? current.filter((recipient) => recipient !== email)
        : [...current, email]
    );
  };

  const handleCreateConversation = async () => {
    if (!currentUserEmail) {
      Alert.alert("Error", "Your account information is missing. Please sign in again.");
      return;
    }
    if (selectedRecipients.length === 0) {
      Alert.alert("Select a recipient", "Choose at least one person for this conversation.");
      return;
    }

    setIsCreating(true);
    try {
      const created = await createConversation(
        [currentUserEmail, ...selectedRecipients],
        title.trim() || null
      );

      if (created) {
        Alert.alert("Success", "Conversation created successfully.");
        navigation.goBack();
      } else {
        Alert.alert("Error", "This conversation already exists or could not be created.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const emptyMessage = isSearchMode
    ? searchMessage
    : loadError || "No friends yet. Search by username or email to start a conversation.";

  return (
    <SafeArea>
      <View style={styles.container}>
        <Text style={styles.label}>Conversation title (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a conversation title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Choose recipients</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by username or email"
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.helperText}>
          {isSearchMode ? "Search results" : "Friends"}
          {selectedRecipients.length > 0
            ? ` · ${selectedRecipients.length} selected`
            : ""}
        </Text>

        {isLoadingFriends && !isSearchMode ? (
          <ActivityIndicator style={styles.loader} color="#FFFFFF" size="large" />
        ) : isSearching ? (
          <ActivityIndicator style={styles.loader} color="#FFFFFF" size="large" />
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={
              displayedUsers.length === 0 ? styles.emptyList : styles.listContent
            }
            data={displayedUsers}
            keyExtractor={(item) => item.email}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.emptyText}>{emptyMessage}</Text>}
            renderItem={({ item }) => {
              const selected = selectedRecipients.includes(item.email);
              const displayName =
                item.username ||
                `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
                "User";

              return (
                <TouchableOpacity
                  style={[styles.userRow, selected && styles.userRowSelected]}
                  onPress={() => toggleRecipient(item.email)}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{displayName}</Text>
                  </View>
                  <Text style={styles.selectionMark}>{selected ? "✓" : ""}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            (selectedRecipients.length === 0 || isCreating) &&
              styles.createButtonDisabled,
          ]}
          onPress={handleCreateConversation}
          disabled={selectedRecipients.length === 0 || isCreating}
        >
          <Text style={styles.createButtonText}>
            {isCreating ? "Creating..." : "Create Conversation"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    color: "#111111",
    fontSize: 16,
  },
  helperText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 14,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loader: {
    flex: 1,
  },
  emptyText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  userRow: {
    minHeight: 64,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  userRowSelected: {
    backgroundColor: "#DCE5FF",
    borderColor: "#233F9A",
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
  },
  selectionMark: {
    color: "#233F9A",
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 10,
  },
  createButton: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "#233F9A",
    fontSize: 17,
    fontWeight: "700",
  },
});

export default CreateNewChatView;
