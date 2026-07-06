import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Avatar, Title } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import SafeArea from "../../SafeArea";
import ProfileNavigator from "./ProfileNavigator";
import OpenEditableInfoCommand from "../../../Controller/OpenEditableInfoCommand";
import App_StyleSheet from "../../../Styles/App_StyleSheet";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { selectPic } from "../../../Controller/DocumentPicker";

function EditProfileView({ navigation }) {
  const { user, setUser } = useAuth();

  const [image, setImage] = useState(
    user?.image
      ? { uri: user.image }
      : require('../../../../assets/default-profile.png')
  );

  const openEdit = new OpenEditableInfoCommand(user);

  return (
    <SafeArea>
      <View style={[styles.section, { height: 120 }]}>
        <Avatar.Image
          source={image}
          size={90}
          style={[
            App_StyleSheet.profile_avatarImage,
            { overflow: "hidden" } // Ensures the image is clipped properly
          ]}
        />
        <TouchableOpacity
          style={{
            bottom: 20,
            position: "absolute",
          }}
          onPress={async () => { // Why the edit button does nothing
            // Output message to console that the edit profile pic button was clicked
            console.log("Edit Profile Picture button clicked");

            // Open the photos app picker
            let file = await selectPic(true);

            // Update the image state
            if (file.url) {
              const newImage = file.url;
              setImage({ uri: newImage });
              setUser(prev => ({
                ...prev,
                image: newImage
              }));
            }

            // Output the file
            console.log("EditProfileView - file name is: " + file.name);
          }}
        >
          <Text>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.userInfoStyle}>{"\tName"}</Text>
        </View>
        <View
          style={{
            flex: 1.6,
            justifyContent: "center",
            height: 50,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              openEdit.OpenEditableInfo({
                navigation,
                mode: "name",
              });
            }}
          >
            <Text style={styles.editableInfoStyle}>
              {user.userName}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.userInfoStyle}>{"\tUsername"}</Text>
        </View>
        <View
          style={{
            flex: 1.6,
            justifyContent: "center",
            height: 50,
          }}
        >
          <TouchableOpacity
           onPress={() => {
              openEdit.OpenEditableInfo({
                navigation,
                mode: "username",
              });
            }}
          >
            <Text style={styles.editableInfoStyle}>
              {user.username || user.userUserName}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <View
          style={{
            flex: 1.6,
            justifyContent: "center",
            height: 50,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              openEdit.OpenEditableInfo({
                navigation,
                mode: "school",
              });
            }}
          >
          </TouchableOpacity>
        </View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  userInfoStyle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fef3d7"
  },
  editableInfoStyle: {
    fontSize: 15,
    textAlign: "left",
  },
  section: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});

export default EditProfileView;
