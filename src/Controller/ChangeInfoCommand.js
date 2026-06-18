import React from "react";
import { useRoute } from "@react-navigation/native";
import { apiUrl } from "@env";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

class ChangeInfoCommand {
  user;
  constructor(user) {
    this.user = user;
  }

  async ChangeInfo({ navigation }, textContent, mode) {
    if (!textContent || textContent.trim() === "") {
      Alert.alert("Error", "Field cannot be empty");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("token");
      let updateData = {
        email: this.user.userUserName
      };

      // Determine what field to update based on the last clicked item
    if (mode === "name") {
        // Split the name into first and last name
        const nameParts = textContent.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        updateData.firstname = firstName;
        updateData.lastname = lastName;
        
        // Update local user object
      this.user.changeUserName(textContent);
    } else if (mode === "username") {
      updateData.username = textContent.trim();

      // Update local user object
      this.user.username = textContent.trim();
    } else if (mode === "school") {
        updateData.schoolName = textContent.trim();
        
        // Update local user object
      this.user.school = textContent;
    }

      // Make API call to update user info
      const response = await fetch(`${apiUrl}/updateUserInfo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Information updated successfully");
        
        // If email was changed, update the stored token with new email
        if (mode === "username") {
          await SecureStore.setItemAsync("username", textContent.trim());
        }
        
        navigation.reset({
          index: 1,
          routes: [
            { name: "Profile" },
            { name: "Edit Profile" }
          ]
        });
      } else {
        Alert.alert("Error", result.message || "Failed to update information");
        console.error("Update failed:", result);
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  }
}

export default ChangeInfoCommand;
