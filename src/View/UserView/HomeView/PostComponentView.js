import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { likePost } from "../../../Controller/LikePostCommand";
import { unlikePost } from "../../../Controller/UnlikePostCommand";
import { getPostLikes } from "../../../Controller/GetPostLikesCommand";
import { checkLikePost } from "../../../Controller/CheckLikedPostCommand";

function PostComponentView({ post }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Number(post.likes));

  let likeImg = require("../../../../assets/like.png");
  let likeFilledImg = require("../../../../assets/like_filled.png");
  let commentImg = require("../../../../assets/comment.png");

  // Initialize like state properly
  useEffect(() => {
    const init = async () => {
      if (!user?.userUserName) return;

      try {
        const liked = await checkLikePost(post, user.userUserName);
        setIsLiked(liked);

        const totalLikes = await getPostLikes(post);
        setLikes(Number(totalLikes));
      } catch (error) {
        console.error("Error initializing likes:", error);
      }
    };

    init();
  }, []);

  // Update likes when coming back from PostView
  useFocusEffect(
    useCallback(() => {
      if (route.params?.updatedPost && route.params.updatedPost.id === post.id) {
        setLikes(Number(route.params.updatedPost.likes));

        navigation.setParams({ updatedPost: undefined });
      }
    }, [route.params?.updatedPost])
  );

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        const unlikeSuccess = await unlikePost(post, user.userUserName);
        if (unlikeSuccess) {
          setIsLiked(false);
          setLikes((prevLikes) => prevLikes - 1);
        }
      } else {
        const likeSuccess = await likePost(post, user.userUserName);
        if (likeSuccess) {
          setIsLiked(true);
          setLikes((prevLikes) => prevLikes + 1);
        }
      }
    } catch (error) {
      console.error("Error handling like/unlike:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const communityName = post.communityName || post.user;

  return (
    <TouchableOpacity
      style={styles.post}
      onPress={() => {
        navigation.navigate("View Post", {
          post,
        });
      }}
    >
      <View style={styles.text}>
        <Text style={styles.title}>{post.title || "no title"}</Text>
        <Text style={styles.content}>{post.postContent}</Text>

        {post.fileUrl && (
          <Text
            style={styles.linkText}
            onPress={() => Linking.openURL(post.fileUrl)}
          >
            {"Open Image File"}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerSection}>
          <TouchableOpacity onPress={handleLikeToggle}>
            <Image
              style={styles.icon}
              source={isLiked ? likeFilledImg : likeImg}
            />
          </TouchableOpacity>
          <Text>{likes}</Text>
        </View>

        <View style={styles.footerSection}>
          <Image style={styles.icon} source={commentImg} />
          <Text>{post.commentsCount}</Text>
        </View>

        <Text style={styles.communityName}>{communityName}</Text>
      </View>
    </TouchableOpacity>
  );
}