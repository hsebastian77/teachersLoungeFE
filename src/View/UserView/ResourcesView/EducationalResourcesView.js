import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import SafeArea from "../../SafeArea";
import App_StyleSheet from "../../../Styles/App_StyleSheet";

function EducationalResourcesView({ navigation }) {
  const ERView1 = "Pre-K And Elementary";
  const ERView2 = "Middle And High School";
  const ERView3 = "Adult Learning And Higher Education";

  return (
    <SafeArea>
      <View style={App_StyleSheet.resource_backGround}>
        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() => navigation.navigate(ERView1)}
        >
          <Text style={App_StyleSheet.resource_cardTitle}>{ERView1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() => navigation.navigate(ERView2)}
        >
          <Text style={App_StyleSheet.resource_cardTitle}>{ERView2}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={App_StyleSheet.resource_button}
          onPress={() => navigation.navigate(ERView3)}
        >
          <Text style={App_StyleSheet.resource_cardTitle}>{ERView3}</Text>
        </TouchableOpacity>
      </View>
    </SafeArea>
  );
}

export default EducationalResourcesView;