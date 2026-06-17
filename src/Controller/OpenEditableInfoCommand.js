import React from "react";
import ProfileNavigator from "../View/UserView/ProfileView/ProfileNavigator";

class OpenEditableInfoCommand {
  user;
  constructor(user) {
    this.user = user;
  }

  OpenEditableInfo({ navigation }, mode) {
  navigation.navigate("Edit Field", {
    mode: mode,
    User: this.user
  });
}
}

export default OpenEditableInfoCommand;
