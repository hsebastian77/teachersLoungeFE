import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { deleteComment } from "../../../Controller/PostManager";

function CommentView({ comment, onDeleted }) {
  const { user } = useAuth();

  const normalizeValue = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  const isAdmin = normalizeValue(user?.userRole) === "admin";
  const commentOwner = normalizeValue(comment?.userName);

  const userIdentifiers = [
    normalizeValue(user?.userUserName),
    normalizeValue(user?.username),
  ].filter(Boolean);

  const isOwner = commentOwner
    ? userIdentifiers.includes(commentOwner)
    : false;

  const canDelete =
    Boolean(user) &&
    Boolean(comment?.id) &&
    (isAdmin || isOwner);

  const handleDeleteComment = async () => {
    if (!canDelete) return;

    try {
      const wasDeleted = await deleteComment(comment.id);

      if (wasDeleted && typeof onDeleted === "function") {
        onDeleted(comment.id);
      }
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  return (
    <View style={styles.comment}>
      <View style={styles.text}>
        <Text style={styles.content}>{comment.content}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerSection}>
          <Text>{comment.likes ? comment.likes : 0} {"likes"}</Text>
        </View>

        {canDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteComment}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.commentUserName}>
          {comment.userName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comment: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 15,
  },
  text: {
    padding: 20,
  },
  content: {
    color: "black",
    fontSize: 15,
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
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },
  deleteButtonText: {
    color: "#B3261E",
    fontWeight: "600",
    fontSize: 12,
  },
  commentUserName: {
    marginLeft: "auto",
    fontWeight: "bold",
    marginHorizontal: 5,
  },
});

export default CommentView;