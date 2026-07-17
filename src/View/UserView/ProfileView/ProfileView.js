import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import SafeArea from "../../SafeArea";
import PostComponentView from "../HomeView/PostComponentView";
import { getApprovedPostsByUser } from "../../../Controller/PostManager";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function ProfileView({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  const imageSource = user?.image
    ? { uri: user.image }
    : require('../../../../assets/default-profile.png');

  let kebabIcon = require("../../../../assets/settings.png");

  // Fetch posts on screen focus
  const loadPosts = async () => {
    if (!user?.userUserName) return;

    const data = await getApprovedPostsByUser(user.userUserName);
    const sortedPosts = data.sort((a, b) => b.id - a.id);
    setPosts(sortedPosts);
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [user?.userUserName])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={App_StyleSheet.header_button}
          onPress={() => navigation.navigate("Settings")}
        >
          <Image source={kebabIcon} style={App_StyleSheet.header_icon} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        <View style={styles.profileSection}>
          <Avatar.Image source={imageSource} size={90} />
          <Text style={styles.username}>{user?.userUserName}</Text>
        </View>

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
          extraData={posts}
          renderItem={({ item }) => (
            <PostComponentView post={item} />
          )}
          keyExtractor={(item) => item.id.toString()}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
        />
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "90%",
    alignSelf: "center",
    marginLeft: 10
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "white",
    flex: 1,
  },
});

export default ProfileView;