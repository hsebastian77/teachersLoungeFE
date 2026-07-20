import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import PostComponentView from "./PostComponentView";
import SafeArea from "../../SafeArea";
import { getApprovedPosts } from "../../../Controller/PostManager.js";
import App_StyleSheet from "../../../Styles/App_StyleSheet";
import { Ionicons } from '@expo/vector-icons';

function PostListingsView() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);

  const loadPosts = async () => {
    if (!user?.userUserName) return;

    try {
      const data = await getApprovedPosts(user.userUserName);

      const sortedPosts = data.sort((a, b) => b.id - a.id);
      setPosts(sortedPosts);
    } catch (err) {
      console.error("Error loading posts:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [user?.userUserName])
  );

  return (
    <SafeArea>
      <View style={styles.container}>
        <View style={App_StyleSheet.content}>
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}

            renderItem={({ item }) => (
              <PostComponentView
                post={item}
                onDeleted={(deletedId) => {
                  setPosts((prev) =>
                    prev.filter((p) => p.id !== deletedId)
                  );
                }}
              />
            )}

            ListEmptyComponent={
              <Text style={App_StyleSheet.list_message}>
                No posts yet!
              </Text>
            }

            ListFooterComponent={
              posts.length > 0 && (
                <Text style={App_StyleSheet.list_message}>
                  You've viewed all posts!
                </Text>
              )
            }

            initialNumToRender={20}
            maxToRenderPerBatch={20}
          />
        </View>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("Create Post")}
        >
          <Ionicons name="create" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#6382E8",
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});

export default PostListingsView;