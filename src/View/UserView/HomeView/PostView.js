import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
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
import {
  getCommentsByPostId,
  addComment,
  deletePost
} from "../../../Controller/PostManager";
import CommentView from "./CommentView";
import SafeArea from "../../SafeArea";
import { likePost } from "../../../Controller/LikePostCommand";
import { unlikePost } from "../../../Controller/UnlikePostCommand";
import { checkLikePost } from "../../../Controller/CheckLikedPostCommand";

function PostView({ route, navigation }) {
  const { user } = useAuth();

  const [post, setPost] = useState(route.params?.post);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(Number(post?.likes || 0));
  const [isLiked, setIsLiked] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!user || !post) return null;

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

  useEffect(() => {
    if (post?.id && user?.userUserName) {
      getCommentsByPostId(post.id, user.userUserName).then(setComments);

      checkLikePost(post, user.userUserName)
        .then(setIsLiked)
        .catch((err) => console.error("Like check failed:", err));
    }
  }, [post, user]);

  const handleLikeToggle = async () => {
    try {
      let updatedLikes = Number(likes);

      if (isLiked) {
        const success = await unlikePost(post, user.userUserName);
        if (success) {
          setIsLiked(false);
          updatedLikes--;
        }
      } else {
        const success = await likePost(post, user.userUserName);
        if (success) {
          setIsLiked(true);
          updatedLikes++;
        }
      }

      setLikes(updatedLikes);
      setPost((prev) => ({ ...prev, likes: updatedLikes }));

    } catch (error) {
      console.error("Like toggle error:", error);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(newComment, user.userUserName, null, post.id);
      setNewComment("");

      const updated = await getCommentsByPostId(post.id, user.userUserName);
      setComments(updated);

    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  const handleDeletePost = async () => {
    try {
      const wasDeleted = await deletePost(post.id, post.fileUrl);
      if (wasDeleted) navigation.goBack();
    } catch (error) {
      console.error("Delete post error:", error);
    }
  };

  return (
    <SafeArea>
      <ScrollView style={styles.container}>

        {canDelete && (
          <TouchableOpacity onPress={handleDeletePost} style={styles.deletePostButton}>
            <Text>Delete Post</Text>
          </TouchableOpacity>
        )}

        <View style={styles.post}>
          <View style={styles.text}>
            <Text style={styles.title}>{post.title || "No title"}</Text>

            {post.createdAt && (
              <Text style={styles.timestamp}>
                {formatPostTime(post.createdAt)}
              </Text>
            )}

            <Text style={styles.content}>{post.postContent}</Text>

            {shouldTryImageRender(post.fileUrl) && !imageFailed && (
              <Image
                style={styles.postImage}
                source={{ uri: post.fileUrl }}
                onError={() => setImageFailed(true)}
              />
            )}

            {post.fileUrl && (!shouldTryImageRender(post.fileUrl) || imageFailed) && (
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
                  source={
                    isLiked
                      ? require("../../../../assets/like_filled.png")
                      : require("../../../../assets/like.png")
                  }
                />
              </TouchableOpacity>
              <Text>{likes}</Text>
            </View>

            <View style={styles.footerSection}>
              <Image
                style={styles.icon}
                source={require("../../../../assets/comment.png")}
              />
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
            comments.map((comment, index) => (
              <CommentView
                key={comment.id || index}
                comment={comment}
                onDeleted={(deletedId) =>
                  setComments((prev) =>
                    prev.filter((c) => c.id !== deletedId)
                  )
                }
              />
            ))
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
    backgroundColor: "#FFFFFF",
    width: "90%",
    alignSelf: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  }
});

export default PostView;
