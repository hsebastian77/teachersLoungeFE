import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import PostComponentView from "./PostComponentView.js";
import {
  getCommunityPosts,
  joinCommunity,
  leaveCommunity,
} from "../../../Controller/CommunitiesManager";
import SafeArea from "../../SafeArea.js";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function CommunityView({ navigation }) {
  const { user } = useAuth();
  const route = useRoute();

  const { Community } = route.params;
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(route.params.isMember);

  // Load posts on focus
  const loadPosts = async () => {
    if (!user?.userUserName) return;

    const data = await getCommunityPosts(
      Community.id,
      user.userUserName
    );

    setPosts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [user?.userUserName, Community.id])
  );

  // Header setup
  useEffect(() => {
    navigation.setOptions({
      title: Community?.name,
      headerRight: () => (
        <TouchableOpacity
          style={App_StyleSheet.header_button}
          onPress={async () => {
            if (!user?.userUserName) return;

            if (isMember) {
              await leaveCommunity(Community.id, user.userUserName);
              setIsMember(false);
            } else {
              await joinCommunity(Community.id, user.userUserName);
              setIsMember(true);
            }

            loadPosts(); // refresh posts if needed
          }}
        >
          <Text style={App_StyleSheet.header_button_text}>
            {isMember ? "Leave" : "Join"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, Community, isMember, user?.userUserName]);

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        <FlatList
          ListEmptyComponent={
            <Text style={App_StyleSheet.list_message}>
              No posts yet!
            </Text>
          }
          ListFooterComponent={
            posts[0] && (
              <Text style={App_StyleSheet.list_message}>
                You've viewed all posts!
              </Text>
            )
          }
          data={posts}
          renderItem={({ item }) => (
            <PostComponentView post={item} />
          )}
        />
      </View>
    </SafeArea>
  );
}

export default CommunityView;