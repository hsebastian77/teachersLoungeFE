import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { likePost } from "../../../Controller/LikePostCommand";
import { unlikePost } from "../../../Controller/UnlikePostCommand";
import { getPostLikes } from "../../../Controller/GetPostLikesCommand";
import { checkLikePost } from "../../../Controller/CheckLikedPostCommand";
import { deletePost } from "../../../Controller/PostManager";
import { getAttachmentName, isImagePostAttachment } from "../../../Utils/AttachmentUtils";

function PostComponentView({ navigation, post, User, onDeleted }) {
  const route = useRoute();
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(Number(post.likes));
  const [imageFailed, setImageFailed] = useState(false);

  let likeImg = require("../../../../assets/like.png");
  let likeFilledImg = require("../../../../assets/like_filled.png");
  let commentImg = require("../../../../assets/comment.png");


  const formatPostTime = (createdAt) => {
    if (!createdAt) {
      return "";
    }

    const timestamp =
      typeof createdAt === "string" && !createdAt.endsWith("Z")
        ? createdAt + "Z"
        : createdAt;

    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  };

  const attachmentName = getAttachmentName(post);
  const shouldRenderImage = isImagePostAttachment(post) && !imageFailed;

  const openAttachment = (event) => {
    event?.stopPropagation?.();
    if (post.fileUrl) Linking.openURL(post.fileUrl);
  };

  useEffect(() => {
    if (post?.id && User?.userUserName) {
      async function fetchLikeData() {
        try {
          const liked = await checkLikePost(post, User.userUserName);
          setIsLiked(liked);
        } catch (error) {
          console.error("Error fetching like data:", error);
        }
      }
      fetchLikeData();
    }
  }, [post, User]);

  // Add focus effect to update likes when returning from PostView
  useFocusEffect(
    useCallback(() => {
      // Check if we have an updated post from the post view
      if (route.params?.updatedPost && route.params.updatedPost.id === post.id) {
        setLikes(Number(route.params.updatedPost.likes));
        post.likes = Number(route.params.updatedPost.likes);
        // Clear the param to avoid repeat updates
        navigation.setParams({ updatedPost: undefined });
      }
    }, [route.params?.updatedPost])
  );

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        const unlikeSuccess = await unlikePost(post, User.userUserName);
        if (unlikeSuccess) {
          setIsLiked(false);
          setLikes((prevLikes) => prevLikes - 1);
          post.likes = Math.max(0, post.likes - 1);
        }
      } else {
        const likeSuccess = await likePost(post, User.userUserName);
        if (likeSuccess) {
          setIsLiked(true);
          setLikes((prevLikes) => prevLikes + 1);
          post.likes += 1;
        }
      }
    } catch (error) {
      console.error("Error handling like/unlike:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const normalizeValue = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  const isAdmin = normalizeValue(User?.userRole) === "admin";
  const postOwner = normalizeValue(post?.user);
  const userIdentifiers = [
    normalizeValue(User?.userUserName),
    normalizeValue(User?.username),
  ].filter(Boolean);
  const isOwner = postOwner ? userIdentifiers.includes(postOwner) : false;

  const canDelete = Boolean(User) && (isAdmin || isOwner);

  const handleDeletePost = () => {
    if (!canDelete) return;

    deletePost(post.id).then((wasDeleted) => {
      if (wasDeleted && typeof onDeleted === "function") {
        onDeleted(post.id);
      }
    });
  };


  return (
    <TouchableOpacity
      style={styles.post}
      onPress={() => {
        navigation.navigate("View Post", {
          post,
          User
        });
      }}
    >
      <View style={styles.postBody}>
        <View style={styles.text}>
          <Text style={styles.title}>{post.title || "no title"}</Text>
          {post.createdAt && (
            <Text style={styles.timestamp}>{formatPostTime(post.createdAt)}</Text>
          )}
          {canDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.content}>{post.postContent}</Text>
        </View>

        {post.fileUrl ? (
          <TouchableOpacity style={styles.attachmentContainer} onPress={openAttachment}>
            {shouldRenderImage ? (
              <Image
                style={styles.postImage}
                source={{ uri: post.fileUrl }}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View style={styles.filePreview}>
                <Text style={styles.fileLabel}>FILE</Text>
                <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="tail">
                  {attachmentName}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerSection}>
          <TouchableOpacity onPress={handleLikeToggle}>
            { }
            <Image style={styles.icon} source={isLiked ? likeFilledImg : likeImg} />
          </TouchableOpacity>
          <Text>{likes}</Text>
        </View>

        <View style={styles.footerSection}>
          <Image style={styles.icon} source={commentImg} />
          <Text>{post.commentsCount}</Text>
        </View>

        <Text style={styles.communityName}>{route.params?.Community ? post.user : (post.communityName || post.user)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  post: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },
  text: {
    flex: 1,
    padding: 20,
    paddingRight: 10,
  },
  postBody: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachmentContainer: {
    width: 100,
    minHeight: 96,
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timestamp: {
    color: "#666666",
    fontSize: 12,
    marginBottom: 10,
  },
  deleteButton: {
    alignSelf: "flex-start",
    backgroundColor: "#C86262",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  content: {
    color: "black",
    fontSize: 15,
  },
  postImage: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
  },
  filePreview: {
    width: 92,
    minHeight: 72,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  fileLabel: {
    color: "#6382E8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 5,
  },
  fileName: {
    width: "100%",
    color: "#333333",
    fontSize: 12,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 9,
    backgroundColor: "#E7ECFE",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  footerSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  icon: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  communityName: {
    marginLeft: "auto",
    fontWeight: "bold",
    marginHorizontal: 5,
  },
});

export default PostComponentView;
