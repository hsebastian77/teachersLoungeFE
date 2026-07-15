
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import File from "../Model/File.js";
import * as SecureStore from 'expo-secure-store';
import { Alert } from "react-native";
import { apiUrl, fileUploadRoute } from "@env";

//Allows users to select a document then upload to s3 

async function selectDoc() {
  const urlUpload = apiUrl + fileUploadRoute;

  try {
    // Expo's document picker can select both images and regular files.
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return new File("", "", "");
    }

    const asset = result.assets[0];
    let uploadData = new FormData();
    uploadData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || "application/octet-stream",
      name: asset.name || `attachment-${Date.now()}`,
    });

    const responseOfFileUpload = await fetch(urlUpload, {
      method: 'POST',
      headers: {
        'Authorization': "Bearer " + await SecureStore.getItemAsync("token")
      },
      body: uploadData,
    });

    if (!responseOfFileUpload.ok) {
      Alert.alert('Upload failed', 'Unable to upload the selected attachment.');
      return new File("", "", "");
    }

    const responseUpload = await responseOfFileUpload.json();
    const publicFileUrl = responseUpload.url ||
      `https://${responseUpload.bucket}.s3.us-east-2.amazonaws.com/${responseUpload.file}`;

    return new File(
      publicFileUrl,
      asset.name || responseUpload.file,
      asset.mimeType || "application/octet-stream"
    );
  } catch (error) {
    console.error("Attachment selection/upload failed:", error);
    Alert.alert('Upload failed', 'Unable to upload the selected attachment.');
    return new File("", "", "");
  }
}

async function selectPic(isProfilePic) {
  const urlUpload = apiUrl + fileUploadRoute;

  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Photo permission required',
        'Please allow access to your photo library to upload an image.'
      );
      return new File("", "", "");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
    const originalName = asset.fileName || `image-${Date.now()}.${extension}`;
    const uploadData = new FormData();

    uploadData.append('file', {
      uri: asset.uri,
      type: mimeType,
      name: originalName,
    });

    uploadData.append('isProfilePic', isProfilePic ? 'true' : 'false');
    if (isProfilePic) {
      const username = await SecureStore.getItemAsync("username");
      if (username) uploadData.append('email', username);
    }

    const responseOfFileUpload = await fetch(urlUpload, {
      method: 'POST',
      headers: {
        'Authorization': "Bearer " + await SecureStore.getItemAsync("token")
      },
      body: uploadData,
    });

    if (!responseOfFileUpload.ok) {
      Alert.alert('Upload failed', 'Unable to upload the selected image.');
      return new File("", "", "");
    }

    const responseUpload = await responseOfFileUpload.json();
    const publicFileUrl = responseUpload.url ||
      `https://${responseUpload.bucket}.s3.us-east-2.amazonaws.com/${responseUpload.file}`;

    return new File(publicFileUrl, originalName, mimeType);
  } catch (error) {
    console.error("Image selection/upload failed:", error);
    Alert.alert('Upload failed', 'Unable to upload the selected image.');
    return new File("", "", "");
  }
}

export { selectDoc, selectPic };
