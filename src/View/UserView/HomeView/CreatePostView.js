import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { useRoute, useIsFocused } from "@react-navigation/native";
import { TextInput } from "react-native-paper";
import SafeArea from "../../SafeArea.js";
import CreatePost from "../../../Controller/CreatePostCommand.js";
import { createCommunityPost } from "../../../Controller/CommunitiesManager.js";
import { selectDoc, selectPic } from "../../../Controller/DocumentPicker.js";
import App_StyleSheet from "../../../Styles/App_StyleSheet.js";
import { getUserCommunities } from "../../../Controller/CommunitiesManager.js";

function CreatePostView({ navigation }) {
  const route = useRoute();
  const isFocused = useIsFocused();
  const User = route.params?.User;
  const [file, setFile] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [communities, setCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [selectedCommunityName, setSelectedCommunityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);

  const handleAttachmentSelection = async (picker, type) => {
    if (isUploading || isSubmitting) return;

    setIsUploading(true);
    setUploadingType(type);
    try {
      const selectedFile = await picker();
      if (selectedFile?.url) {
        setFile(selectedFile);
      }
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  const returnToPostList = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Teacher's Lounge",
          params: { User },
        },
      ],
    });
  };

  const handleSubmit = async () => {
    if (!User || isSubmitting || isUploading) {
      if (!User) {
        console.log("CreatePostView: User is missing");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const created = selectedCommunityId && selectedCommunityId !== "None"
        ? await createCommunityPost(
            postTitle,
            postContent,
            file,
            User,
            selectedCommunityId
          )
        : await CreatePost(postTitle, postContent, file, User);

      if (created) {
        returnToPostList();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchCommunities() {
    const data = await getUserCommunities(route.params?.User?.userUserName);
    const formattedCommunities = data.map((c) => ({
      key: c.id,
      value: c.name,
    }));
    setCommunities(formattedCommunities);
  }

  useEffect(() => {
    if (isFocused) {
      setFile("");
      setPostContent("");
      setPostTitle("");
      setSelectedCommunityId(null);
      setSelectedCommunityName("");
    }
  }, [isFocused]);

  useEffect(() => {
    fetchCommunities();
  }, []);

  return (
    <SafeArea>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Post Title:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Write a title for your post..."
            onChangeText={(value) => setPostTitle(value)}
            value={postTitle}
            underlineColor="#808080"
            activeUnderlineColor="#808080"
            multiline={false}
          />

          <Text style={styles.label}>Post Content:</Text>
          <TextInput
            style={[styles.textInput]}
            placeholder="Write a post..."
            onChangeText={(value) => setPostContent(value)}
            value={postContent}
            underlineColor="#808080"
            activeUnderlineColor="#808080"
            multiline
          />
          <Text style={styles.label}>Select a community (optional):</Text>
          <SelectList
            setSelected={(value) => {
              if (value === null || value === "None") {
                setSelectedCommunityId(null);
                setSelectedCommunityName("");
              } else {
                const selected = communities.find((c) => c.key === value);
                setSelectedCommunityId(value);
                setSelectedCommunityName(selected ? selected.value : "");
              }
            }}
            data={[
              { key: "None", value: "None" },
              ...communities,
            ]}
            placeholder="Select a community"
            defaultOption={
              selectedCommunityId
                ? { key: selectedCommunityId, value: selectedCommunityName }
                : { key: "None", value: "None" }
            }
            boxStyles={styles.selectBox}
          />

          <View style={styles.attachmentButtons}>
            <TouchableOpacity
              style={[styles.smallButton, styles.attachmentButton]}
              onPress={() => handleAttachmentSelection(selectDoc, "file")}
              disabled={isUploading || isSubmitting}
            >
              <Text style={styles.smallButtonText}>
                {uploadingType === "file" ? "Uploading..." : "Upload File"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallButton, styles.attachmentButton]}
              onPress={() => handleAttachmentSelection(() => selectPic(false), "image")}
              disabled={isUploading || isSubmitting}
            >
              <Text style={styles.smallButtonText}>
                {uploadingType === "image" ? "Uploading..." : "Upload Image"}
              </Text>
            </TouchableOpacity>
          </View>

          {file.url ? (
            <Text style={styles.selectedFileName} numberOfLines={1} ellipsizeMode="tail">
              {file.name}
            </Text>
          ) : null}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={App_StyleSheet.medium_button}
              onPress={handleSubmit}
              disabled={isSubmitting || isUploading}
            >
              <Text style={App_StyleSheet.text}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    height: "90%",
    maxWidth: 600,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
    marginLeft: 10,
  },
  selectBox: {
    height: 50,
    marginBottom: 20,
    width: "100%",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    padding: 5,
    borderRadius: 5,
    width: "100%",
    borderWidth: 1,
    borderColor: "#808080",
    marginBottom: 20,
  },
  smallButton: {
    backgroundColor: "#E7ECFE",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentButtons: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  attachmentButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  smallButtonText: {
    color: "#4A90E2",
    fontSize: 14,
  },
  selectedFileName: {
    color: "#555555",
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
});

export default CreatePostView;
