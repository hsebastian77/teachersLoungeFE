import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ResourcesView from "./ResourcesView";
import EducationalResourcesView from "./EducationalResourcesView";
import ERPreKAndElementaryView from "./ERPreKAndElementaryView";
import ERMiddleAndHighSchoolView from "./ERMiddleAndHighSchoolView";
import ERAdultLearningAndHigherView from "./ERAdultLearningAndHigherView";
import TeachersLoungeView from "./TeachersLoungeView";

const Stack = createNativeStackNavigator();

function ResourcesNavigator() {
const defaultOptions = {
    headerStyle: {
      backgroundColor: "#411c00",
    },
    headerTintColor: "#fff3d7",
    headerTitleStyle: {
      fontWeight: "bold",
    },
    headerBackTitleVisible: false,
  };

  return (
    <Stack.Navigator screenOptions={defaultOptions}>
      <Stack.Screen
        name="Resources"
        component={ResourcesView}
        options={{
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="Educational Resources"
        component={EducationalResourcesView}
      />

      <Stack.Screen
        name="Pre-K And Elementary"
        component={ERPreKAndElementaryView}
      />

      <Stack.Screen
        name="Middle And High School"
        component={ERMiddleAndHighSchoolView}
      />

      <Stack.Screen
        name="Adult Learning And Higher Education"
        component={ERAdultLearningAndHigherView}
      />

      <Stack.Screen
        name="Teachers' Lounge"
        component={TeachersLoungeView}
      />
    </Stack.Navigator>
  );
}

export default ResourcesNavigator;