import React from "react";
import { Text, View } from "react-native";
import SafeArea from "../../SafeArea";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function TeachersLoungeView() {
  const TLView = "Teachers' Lounge";

  const descriptionText = "The Teachers' Lounge app is a social media platform designed specifically for teachers. Built using modern technologies like React Native, Node.js, Express.js, and hosted on Amazon RDS, it offers a suite of interactive features across various views such as Sign-in, Home, Profile, Messages, Friends, and Resources. Teachers can engage with educational communities, create and moderate posts, message peers, and access a wealth of educational resources. The MVC architecture ensures a clean separation of concerns, promoting maintainability and scalability. With its focus on education, the app provides a dedicated space for teachers to connect, share, and learn from each other, fostering professional growth and collaboration.";

  return (
    <SafeArea>
      <View style={App_StyleSheet.resource_backGround}>
        <Text style={App_StyleSheet.resource_cardTitle}>{TLView}</Text>
        <Text style={App_StyleSheet.resource_cardText}>
          {descriptionText}
        </Text>
      </View>
    </SafeArea>
  );
}

export default TeachersLoungeView;