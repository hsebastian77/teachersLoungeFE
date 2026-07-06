import React, { useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import SafeArea from "../../SafeArea";
import PostComponentView from "../HomeView/PostComponentView";
import { getApprovedPostsByUser } from "../../../Controller/PostManager";
import {
  getUserInfo,
  checkIfFriended,
  friendUser,
  unfriendUser,
  checkIfMuted,
  muteUser,
  unmuteUser,
  checkIfBlocked,
  blockUser,
  unblockUser,
} from "../../../Controller/FriendsManager";
import App_StyleSheet from "../../../Styles/App_StyleSheet.js";

function FriendView({ navigation }) {
  const { user } = useAuth();
  const route = useRoute();

  const friendEmail = route.params.FriendEmail;

  const [friend, setFriend] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friended, setFriended] = useState(false);
  const [friendee, setFriendee] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const imageSource = friend?.image
    ? { uri: friend.image }
    : require('../../../../assets/default-profile.png');

  // Load everything on focus
  const loadData = async () => {
    if (!user?.userUserName) return;

    const friendData = await getUserInfo(friendEmail);
    setFriend(friendData);

    const postData = await getApprovedPostsByUser(friendEmail);
    setPosts(postData.sort((a, b) => b.id - a.id));

    const [isFriended, isFriendee, isMuted, isBlocked] = await Promise.all([
      checkIfFriended(user.userUserName, friendEmail),
      checkIfFriended(friendEmail, user.userUserName),
      checkIfMuted(user.userUserName, friendEmail),
      checkIfBlocked(user.userUserName, friendEmail),
    ]);

    setFriended(isFriended);
    setFriendee(isFriendee);
    setMuted(isMuted);
    setBlocked(isBlocked);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.userUserName, friendEmail])
  );

  let friendStatus = "";
  if (friended && friendee) friendStatus = "Friend";
  else if (friended) friendStatus = "Pending";
  else friendStatus = "Not Friend";

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        <View style={styles.profileSection}>
          <Avatar.Image source={imageSource} size={90} />
          <Text style={styles.username}>{friendEmail}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (friended) {
                await unfriendUser(user.userUserName, friendEmail);
              } else {
                await friendUser(user.userUserName, friendEmail);
              }
              loadData(); // refresh state
            }}
          >
            <Text style={App_StyleSheet.buttonText}>
              {friended ? "Unfriend User" : "Friend User"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (muted) {
                await unmuteUser(user.userUserName, friendEmail);
              } else {
                await muteUser(user.userUserName, friendEmail);
              }
              loadData();
            }}
          >
            <Text style={App_StyleSheet.buttonText}>
              {muted ? "Unmute User" : "Mute User"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              if (blocked) {
                await unblockUser(user.userUserName, friendEmail);
              } else {
                await blockUser(user.userUserName, friendEmail);
                if (friended) {
                  await unfriendUser(user.userUserName, friendEmail);
                }
              }
              loadData();
            }}
          >
            <Text style={App_StyleSheet.buttonText}>
              {blocked ? "Unblock User" : "Block User"}
            </Text>
          </TouchableOpacity>
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
    marginLeft: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 15,
    color: "white",
    flex: 1,
  },
  infoSection: {
    marginBottom: 15,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",      
    justifyContent: "space-evenly",  
    alignItems: "center",      
    marginBottom: 20,
  },
  button: {
    backgroundColor: "white",
    padding: 10,                
    marginHorizontal: 10,   
    borderRadius: 5,          
  },
  buttonText: {
    color: "black",
    fontWeight: "bold"         
  }
});

export default FriendView;