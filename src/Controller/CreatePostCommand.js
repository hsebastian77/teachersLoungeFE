import { apiUrl, createPostRoute } from "@env";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

// Creates a new post and adds to the database
async function CreatePost({ navigation }, title, content, file, user) {
  if (content != "") {
    let postUrl = apiUrl + createPostRoute;
    console.log(postUrl)
    const attachment = file || {};
    const reqOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await SecureStore.getItemAsync("token")),
      },
      body: JSON.stringify({
        title: title,
        content: content,
        fileUrl: attachment.url || null,
        email: user.userUserName,
        fileType: attachment.type || null,
        fileDisplayName: attachment.name || null,
      }),
    };

    const response = await fetch(postUrl, reqOptions);
    const data = await response.json();
    if (!response.ok) {
      Alert.alert("Error", "Unable to create post");
    } else {
      user.createPost(content, attachment.url || null);
      Alert.alert("Success", "Post created");
      navigation.navigate("Home");
    }
  }
}

export default CreatePost;
