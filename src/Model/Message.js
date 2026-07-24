import React from "react";

class Message {
  constructor(messageId, conversationId, content, sender, time, senderUsername = "") {
    this.messageId = messageId;
    this.conversationId = conversationId;
    this.sender = sender;
    this.content = content;
    this.time = time;
    this.senderUsername = senderUsername;
  }
}

export default Message;
