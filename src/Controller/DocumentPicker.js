
import * as ImagePicker from 'expo-image-picker';
import { File as ExpoFile } from 'expo-file-system';
import File from "../Model/File.js";
import * as SecureStore from 'expo-secure-store';
import { Alert } from "react-native";
import { apiUrl, fileUploadRoute } from "@env";

class UploadError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

const readUploadError = async (response) => {
  const responseText = await response.text();
  if (!responseText) return `Upload failed (status ${response.status})`;

  try {
    const body = JSON.parse(responseText);
    return body.message || body.error || `Upload failed (status ${response.status})`;
  } catch {
    return responseText;
  }
};

const showUploadError = async (error, attachmentKind) => {
  console.error(`${attachmentKind} selection/upload failed:`, error);

  if (error?.status === 401) {
    await SecureStore.deleteItemAsync("token");
    Alert.alert(
      "Session expired",
      "Your login has expired. Please sign in again before uploading an attachment."
    );
    return;
  }

  if (error?.status === 413) {
    Alert.alert("File too large", "Attachments must be smaller than 50 MB.");
    return;
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message || "")) {
    Alert.alert(
      "Cannot reach the server",
      `Make sure the backend is running and this device can access ${apiUrl}.`
    );
    return;
  }

  Alert.alert(
    "Upload failed",
    error?.message || `Unable to upload the selected ${attachmentKind.toLowerCase()}.`
  );
};

const uploadAsset = async ({ uri, mimeType, name, nativeFile }, isProfilePic = false) => {
  const uploadData = new FormData();
  // Expo SDK 57's fetch implementation no longer accepts React Native's
  // legacy `{ uri, type, name }` FormData part. ExpoFile implements Blob and
  // exposes bytes(), which is the supported native multipart representation.
  const multipartFile = nativeFile || new ExpoFile(uri);
  uploadData.append("file", multipartFile);
  uploadData.append("isProfilePic", isProfilePic ? "true" : "false");

  if (isProfilePic) {
    const username = await SecureStore.getItemAsync("username");
    if (username) uploadData.append("email", username);
  }

  const response = await fetch(apiUrl + fileUploadRoute, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + await SecureStore.getItemAsync("token"),
    },
    body: uploadData,
  });

  if (!response.ok) {
    throw new UploadError(await readUploadError(response), response.status);
  }

  const result = await response.json();
  const publicUrl = result.url ||
    `https://${result.bucket}.s3.us-east-2.amazonaws.com/${result.file}`;

  return new File(publicUrl, name, mimeType);
};

// Allows users to select a document then upload it to S3.

async function selectDoc() {
  try {
    const result = await ExpoFile.pickFileAsync({
      mimeTypes: "*/*",
      multipleFiles: false,
    });

    if (result.canceled || !result.result) {
      return new File("", "", "");
    }

    const selectedFile = result.result;
    return await uploadAsset({
      uri: selectedFile.uri,
      mimeType: selectedFile.type || "application/octet-stream",
      name: selectedFile.name || `attachment-${Date.now()}`,
      nativeFile: selectedFile,
    });
  } catch (error) {
    await showUploadError(error, "File");
    return new File("", "", "");
  }
}

async function selectPic(isProfilePic) {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo permission required",
        "Please allow photo-library access to upload an image."
      );
      return new File("", "", "");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: Boolean(isProfilePic),
      ...(isProfilePic ? { aspect: [4, 3] } : {}),
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return new File("", "", "");
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType || "image/jpeg";
    const extension = mimeType.split("/")[1] || "jpg";
    const name = asset.fileName || `image-${Date.now()}.${extension}`;

    return await uploadAsset({ uri: asset.uri, mimeType, name }, isProfilePic);
  } catch (error) {
    await showUploadError(error, "Image");
    return new File("", "", "");
  }
}

export { selectDoc, selectPic };
