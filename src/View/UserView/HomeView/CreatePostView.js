import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
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
import File from "../../../Model/File.js";

const EMPTY_FILE = new File("", "", "");

const isValidHttpUrl = (value) => {
  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const inferAttachmentType = (value) => {
  if (/\.(png|jpe?g|gif|webp|bmp|heic|heif|avif)(\?.*)?$/i.test(value)) {
    return "image";
  }

  return "link";
};

const inferAttachmentName = (value, explicitName) => {
  if (explicitName.trim()) {
    return explicitName.trim();
  }

  try {
    const parsedUrl = new URL(value);
    const pathName = parsedUrl.pathname.split("/").filter(Boolean).pop();
    return pathName || parsedUrl.hostname;
  } catch (error) {
    return value;
  }
};

function CreatePostView({ navigation }) {
  const route = useRoute();
  const isFocused = useIsFocused();
  const User = route.params?.User;
  const [file, setFile] = useState(EMPTY_FILE);
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [communities, setCommunities] = useState([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [selectedCommunityName, setSelectedCommunityName] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);

  const handleAttachmentUpload = async (picker, type) => {
    if (uploadingType || isSubmitting) return;

    setUploadingType(type);
    setSubmitError("");
    try {
      const selectedFile = await picker();
      if (selectedFile?.url) {
        setFile(selectedFile);
        // A newly uploaded attachment should take precedence over an old URL.
        setAttachmentUrl("");
        setAttachmentName("");
      }
    } finally {
      setUploadingType(null);
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
      setFile(EMPTY_FILE);
      setPostContent("");
      setPostTitle("");
      setAttachmentUrl("");
      setAttachmentName("");
      setSelectedCommunityId(null);
      setSelectedCommunityName("");
      setSubmitError("");
    }
  }, [isFocused]);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const buildAttachment = () => {
    const trimmedAttachmentUrl = attachmentUrl.trim();
    if (!trimmedAttachmentUrl) {
      return file;
    }

    return new File(
      trimmedAttachmentUrl,
      inferAttachmentName(trimmedAttachmentUrl, attachmentName),
      inferAttachmentType(trimmedAttachmentUrl)
    );
  };

  const handleSubmit = async () => {
    if (!User) {
      setSubmitError("User information is missing.");
      return;
    }

    if (!postContent.trim()) {
      setSubmitError("Post content cannot be blank.");
      return;
    }

    const trimmedAttachmentUrl = attachmentUrl.trim();
    if (trimmedAttachmentUrl && !isValidHttpUrl(trimmedAttachmentUrl)) {
      setSubmitError("Attachment URL must start with http:// or https://.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const attachment = buildAttachment();

    try {
      const created = selectedCommunityId && selectedCommunityId !== "None"
        ? await createCommunityPost(
          postTitle,
          postContent.trim(),
          attachment,
          User,
          selectedCommunityId
        )
        : await CreatePost(postTitle, postContent.trim(), attachment, User);

      if (created) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Teacher's Lounge", params: { User } }],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeArea>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Post</Text>
          <Text style={styles.subtitle}>Share text, links, files, or images in one place.</Text>

          <Text style={styles.label}>Post Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Write a title for your post..."
            onChangeText={(value) => setPostTitle(value)}
            value={postTitle}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            multiline={false}
          />

          <Text style={styles.label}>Post Content</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your post..."
            onChangeText={(value) => setPostContent(value)}
            value={postContent}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            multiline
          />

          <Text style={styles.sectionTitle}>Optional Attachment</Text>

          <Text style={styles.label}>Image or file URL</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://example.com/image.png"
            onChangeText={setAttachmentUrl}
            value={attachmentUrl}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            multiline={false}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Attachment display name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Lecture notes or image title"
            onChangeText={setAttachmentName}
            value={attachmentName}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            multiline={false}
          />

          <View style={styles.attachmentActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleAttachmentUpload(selectDoc, "file")}
              disabled={Boolean(uploadingType) || isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>
                {uploadingType === "file" ? "Uploading..." : "Upload File"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleAttachmentUpload(() => selectPic(false), "image")}
              disabled={Boolean(uploadingType) || isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>
                {uploadingType === "image" ? "Uploading..." : "Upload Image"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.attachmentStatusText}>
            {attachmentUrl.trim()
              ? `Using URL: ${attachmentUrl.trim()}`
              : file.url
                ? `Uploaded: ${file.name || file.url}`
                : "No attachment selected"}
          </Text>

          <Text style={styles.sectionTitle}>Community (Optional)</Text>
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

          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={isSubmitting || Boolean(uploadingType)}
            >
              <Text style={styles.primaryButtonText}>{isSubmitting ? "Submitting..." : "Post"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerContent: {
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  card: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE6FF",
    shadowColor: "#24488F",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#243B77",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#5A6A8D",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#243B77",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#324C8D",
    marginBottom: 6,
  },
  selectBox: {
    minHeight: 46,
    marginBottom: 14,
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C7D6FF",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#C7D6FF",
    marginBottom: 12,
    minHeight: 46,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: "#C7D6FF",
    marginBottom: 12,
    minHeight: 110,
  },
  attachmentActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  secondaryButton: {
    width: "48%",
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFD0FF",
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: "#31539F",
    fontSize: 14,
    fontWeight: "600",
  },
  attachmentStatusText: {
    color: "#5D6B8C",
    fontSize: 13,
    marginBottom: 12,
  },
  errorText: {
    color: "#B3261E",
    fontSize: 13,
    marginBottom: 12,
  },
  buttonsContainer: {
    marginTop: 8,
    alignItems: "center",
    width: "100%",
  },
  primaryButton: {
    width: "100%",
    minHeight: 46,
    borderRadius: 24,
    backgroundColor: "#6382E8",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CreatePostView;
