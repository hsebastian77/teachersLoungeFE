import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Image,
} from "react-native";
import SafeArea from "../../SafeArea";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

const healthImg = require("../../../../assets/mentalhealth.jpg");
const eduImg = require("../../../../assets/edu.jpg");
const profImg = require("../../../../assets/prof.jpg");
const logo = require("../../../../assets/Logo_rev.jpg");

function ResourcesView({ navigation }) {
  const ERView = "Educational Resources";
  const TLView = "Teachers' Lounge";

  return (
    <SafeArea>
      <View style={App_StyleSheet.resource_backGround}>
        
        <Image style={styles.resourceImage} source={healthImg} />

        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() =>
            Linking.openURL(
              "https://www.mentalhealthfirstaid.org/mental-health-resources/"
            )
          }
        >
          <Text style={App_StyleSheet.resource_cardTitle}>
            {"Mental Health Resources"}
          </Text>
        </TouchableOpacity>

        <Image style={styles.resourceImage} source={eduImg} />

        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() => navigation.navigate(ERView)}
        >
          <Text style={App_StyleSheet.resource_cardTitle}>
            {"Educational Resources"}
          </Text>
        </TouchableOpacity>

        <Image style={styles.resourceImage} source={profImg} />

        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() =>
            Linking.openURL("https://www.teachingchannel.com/")
          }
        >
          <Text style={App_StyleSheet.resource_cardTitle}>
            {"Professional Resources"}
          </Text>
        </TouchableOpacity>

        <Image style={styles.resourceImage} source={logo} />

        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() => navigation.navigate(TLView)}
        >
          <Text style={App_StyleSheet.resource_cardTitle}>
            {"About Teachers' Lounge"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  resourceImage: {
    alignSelf: "center",
    width: 70,
    height: 70,
    marginVertical: 10,
  },
});

export default ResourcesView;