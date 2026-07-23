import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking
} from "react-native";
import { getCommentsByPostId, addComment } from "../../../Controller/PostManager";
import CommentView from "./CommentView";
import SafeArea from "../../SafeArea";
import { likePost } from "../../../Controller/LikePostCommand";
import { unlikePost } from "../../../Controller/UnlikePostCommand";
import { checkLikePost } from "../../../Controller/CheckLikedPostCommand";
import { getPostLikes } from "../../../Controller/GetPostLikesCommand";
import { deletePost } from "../../../Controller/PostManager";
import { useFocusEffect } from '@react-navigation/native';
import { getAttachmentName, isImagePostAttachment } from "../../../Utils/AttachmentUtils";

function PostView({ route, navigation }) {
  const [post, setPost] = useState(route.params?.post);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(Number(post.likes));
  const [isLiked, setIsLiked] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  let likeImg = require("../../../../assets/like.png");
  let likeFilledImg = require("../../../../assets/like_filled.png");
  let commentImg = require("../../../../assets/comment.png");

  const formatPostTime = (createdAt) => {
    if (!createdAt) {
      return "";
   }

    const date = new Date(createdAt);

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

  useEffect(() => {
    if (post?.id) {
      getCommentsByPostId(post.id, route.params.User.userUserName).then((commentsData) => setComments(commentsData));

      async function fetchLikeData() {
        try {
          const liked = await checkLikePost(post, route.params.User.userUserName);
          setIsLiked(liked);
        } catch (error) {
          console.error("Error fetching like data:", error);
        }
      }
      fetchLikeData();
    }
  }, []);

  const handleLikeToggle = async () => {
    try {
      let updatedLikes = Number(likes);

      if (isLiked) {
        const unlikeSuccess = await unlikePost(post, route.params.User.userUserName);
        if (unlikeSuccess) {
          setIsLiked(false);
          updatedLikes -= 1;
        }
      } else {
        const likeSuccess = await likePost(post, route.params.User.userUserName);
        if (likeSuccess) {
          setIsLiked(true);
          updatedLikes += 1;
        }
      }

      setLikes(updatedLikes);
      setPost((prevPost) => ({ ...prevPost, likes: updatedLikes }));

      if (navigation.canGoBack()) {
        navigation.setParams({
          updatedPost: { ...post, likes: updatedLikes }
        });
      }

    } catch (error) {
      console.error("Error handling like/unlike:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };


  const handleAddComment = async () => {
    if (newComment.trim()) {
      await addComment(newComment, route.params.User.userUserName, null, post.id);
      setNewComment("");
      getCommentsByPostId(post.id, route.params.User.userUserName).then((commentsData) => setComments(commentsData));
    }
  };

  const handleDeletePost = async () => {
    try {
      const wasDeleted = await deletePost(post.id, post.fileUrl);
      if (wasDeleted) {
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const normalizeValue = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  const isAdmin = normalizeValue(route.params.User?.userRole) === "admin";
  const postOwner = normalizeValue(post?.user);
  const userIdentifiers = [
    normalizeValue(route.params.User?.userUserName),
    normalizeValue(route.params.User?.username),
  ].filter(Boolean);
  const isOwner = postOwner ? userIdentifiers.includes(postOwner) : false;

  const canDelete = Boolean(route.params.User) && (isAdmin || isOwner);

  return (
    <SafeArea>
      <ScrollView style={styles.container}>
      {canDelete && (
  <TouchableOpacity onPress={handleDeletePost} style={styles.deletePostButton}>
    <Text style={styles.deletePostButtonText}>{"Delete Post"}</Text>
  </TouchableOpacity>
)}

        <View style={styles.post}>
          <View style={styles.text}>
            <Text style={styles.title}>{post.title || "no title"}</Text>
            {post.createdAt && (
              <Text style={styles.timestamp}>{formatPostTime(post.createdAt)}</Text>
              )}
            <Text style={styles.content}>{post.postContent}</Text>
            {shouldRenderImage ? (
              <TouchableOpacity onPress={() => Linking.openURL(post.fileUrl)}>
                <Image
                  style={styles.postImage}
                  source={{ uri: post.fileUrl }}
                  resizeMode="contain"
                  onError={() => setImageFailed(true)}
                />
              </TouchableOpacity>
            ) : post.fileUrl ? (
              <Text style={styles.linkText} onPress={() => Linking.openURL(post.fileUrl)}>
                {`Open attachment: ${attachmentName}`}
              </Text>
            ) : null}
          </View>
          <View style={styles.footer}>
            <View style={styles.footerSection}>
              <TouchableOpacity onPress={handleLikeToggle}>
                <Image style={styles.icon} source={isLiked ? likeFilledImg : likeImg} />
              </TouchableOpacity>
              <Text>{likes}</Text>
            </View>

            <View style={styles.footerSection}>
              <Image style={styles.icon} source={commentImg} />
              <Text>{comments.length}</Text>
            </View>

            <Text style={styles.communityName}>{post.user}</Text>
          </View>
        </View>
        <View style={styles.newComment}>
          <TextInput
            style={styles.newCommentText}
            placeholder="Add a new comment..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <Button title="+" onPress={handleAddComment} />
        </View>
        <View>
          {comments.length > 0 ? (
            comments.map((comment, index) => {
              console.log('Comment rendering:', comment.id || `fallback-${index}`);
              return (
                <CommentView 
                  key={comment.id ? `comment-${comment.id}` : `comment-index-${index}`} 
                  comment={comment}
                  User={route.params.User}
                  onDeleted={(deletedCommentId) =>
                    setComments((prevComments) =>
                      prevComments.filter((c) => c.id !== deletedCommentId)
                    )
                  }
                />
              );
            })
          ) : (
            <Text>No comments yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeArea>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  post: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },
  text: {
    padding: 20,
  },
  title: {
    color: "black",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timestamp: {
    color: "#666666",
    fontSize: 14,
    marginBottom: 10,
  },
  content: {
    color: "black",
    fontSize: 18,
  },
  postImage: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    marginTop: 12,
  },
  linkText: {
    color: "blue",
    fontSize: 15,
    marginTop: 10,
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
  newComment: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 40,
    width: "90%",
    alignSelf: "center",
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  newCommentText: {
    marginLeft: 15,
  },
  deletePostButton: {
    backgroundColor: "#C86262",
    width: "90%",
    alignSelf: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  deletePostButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  }
});

export default PostView;
