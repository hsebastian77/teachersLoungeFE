import React from "react";

class Comment {
  constructor(id, userName, image, commentContent, nickName) {
    //test user, connect with database later
    this.id = id;
    this.userName = userName;
    this.image = image;
    this.content = commentContent;
    this.nickName = nickName;
  }
}

export default Comment;
