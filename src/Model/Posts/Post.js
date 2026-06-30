import React from "react";
import Comment from "./Comment";

class Post {
  constructor(id, user, title, postContent, likes, comments, fileUrl, communityName, commentsCount, createdAt) {
    this.id = id;
    this.user = user;
    this.title = title;
    this.postContent = postContent;
    this.likes = likes;
    this.comments = comments;
    this.fileUrl = fileUrl;
    this.communityName = communityName;
    this.commentsCount = commentsCount;
    this.createdAt = createdAt;
  }
}

export default Post;