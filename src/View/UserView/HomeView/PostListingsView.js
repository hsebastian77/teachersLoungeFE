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
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { likePost } from "../../../Controller/LikePostCommand";
import { unlikePost } from "../../../Controller/UnlikePostCommand";
import { getPostLikes } from "../../../Controller/GetPostLikesCommand";
import { checkLikePost } from "../../../Controller/CheckLikedPostCommand";
import { deletePost } from "../../../Controller/PostManager";

function PostComponentView({ post, onDeleted }) {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Number(post?.likes || 0));
  const [imageFailed, setImageFailed] = useState(false);

  const likeImg = require("../../../../assets/like.png");
  const likeFilledImg = require("../../../../assets/like_filled.png");
  const commentImg = require("../../../../assets/comment.png");

  // HELPERS

  const formatPostTime = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    return date.toLocaleString();
  };

  const isImageAttachment = (value) =>
    typeof value === "string" &&
    /\.(png|jpe?g|gif|webp|bmp|heic|heif|avif)(\?.*)?$/i.test(value);

  const shouldTryImageRender = (value) => {
    if (!value) return false;
    return isImageAttachment(value) || value.includes("s3");
  };

  const normalizeValue = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  // PERMISSIONS 

  const isAdmin = normalizeValue(user?.userRole) === "admin";
  const postOwner = normalizeValue(post?.user);

  const userIdentifiers = [
    normalizeValue(user?.userUserName),
    normalizeValue(user?.username),
  ].filter(Boolean);

  const isOwner = postOwner
    ? userIdentifiers.includes(postOwner)
    : false;

  const canDelete = isAdmin || isOwner;

  // INIT

  useEffect(() => {
    const init = async () => {
      if (!user?.userUserName) return;

      try {
        const liked = await checkLikePost(post.id, user.userUserName);
        setIsLiked(liked);

        const totalLikes = await getPostLikes(post.id);
        setLikes(Number(totalLikes));
      } catch (error) {
        console.error("Error initializing likes:", error);
      }
    };

    init();
  }, [user, post.id]);

  // SYNC FROM POSTVIEW

  useFocusEffect(
    useCallback(() => {
      if (
        route.params?.updatedPost &&
        route.params.updatedPost.id === post.id
      ) {
        setLikes(Number(route.params.updatedPost.likes));

        navigation.setParams({ updatedPost: undefined });
      }
    }, [route.params?.updatedPost])
  );

  // ACTIONS

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        const success = await unlikePost(post.id, user.userUserName);
        if (success) {
          setIsLiked(false);
          setLikes((prev) => prev - 1);
        }
      } else {
        const success = await likePost(post.id, user.userUserName);
        if (success) {
          setIsLiked(true);
          setLikes((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Like toggle error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleDeletePost = async () => {
    if (!canDelete) return;

    try {
      const wasDeleted = await deletePost(post.id, post.fileUrl);

      if (wasDeleted) {
        if (typeof onDeleted === "function") {
          onDeleted(post.id);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const communityName = post.communityName || post.user;

  // UI

  return (
    <TouchableOpacity
      style={styles.post}
      onPress={() => navigation.navigate("PostView", { post })}
    >
      <View style={styles.text}>
        <Text style={styles.title}>{post.title || "No title"}</Text>

        {post.createdAt && (
          <Text style={styles.timestamp}>
            {formatPostTime(post.createdAt)}
          </Text>
        )}

        {canDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.content}>{post.postContent}</Text>

        {shouldTryImageRender(post.fileUrl) && !imageFailed && (
          <Image
            style={styles.postImage}
            source={{ uri: post.fileUrl }}
            onError={() => setImageFailed(true)}
          />
        )}

        {post.fileUrl &&
          (!shouldTryImageRender(post.fileUrl) || imageFailed) && (
            <Text
              style={styles.linkText}
              onPress={() => Linking.openURL(post.fileUrl)}
            >
              Open Attachment
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
          <Text>{post.commentsCount || 0}</Text>
        </View>

        <Text style={styles.communityName}>{communityName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6382E8',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default PostListingsView;