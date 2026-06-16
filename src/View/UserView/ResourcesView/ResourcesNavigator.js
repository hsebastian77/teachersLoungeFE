import React from "react";
import { useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ResourcesView from "./ResourcesView";
import EducationalResourcesView from "./EducationalResourcesView";
import ERPreKAndElementaryView from "./ERPreKAndElementaryView";
import ERMiddleAndHighSchoolView from "./ERMiddleAndHighSchoolView";
import ERAdultLearningAndHigherView from "./ERAdultLearningAndHigherView";
import TeachersLoungeView from "./TeachersLoungeView";

const Stack = createNativeStackNavigator();

function ResourcesNavigator() {
  const route = useRoute();

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
        initialParams={route?.params}
        options={{
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="Educational Resources"
        component={EducationalResourcesView}
        initialParams={route?.params}
      />

      <Stack.Screen
        name="Pre-K And Elementary"
        component={ERPreKAndElementaryView}
        initialParams={route?.params}
      />

      <Stack.Screen
        name="Middle And High School"
        component={ERMiddleAndHighSchoolView}
        initialParams={route?.params}
      />

      <Stack.Screen
        name="Adult Learning And Higher Education"
        component={ERAdultLearningAndHigherView}
        initialParams={route?.params}
      />

      <Stack.Screen
        name="Teachers' Lounge"
        component={TeachersLoungeView}
        initialParams={route?.params}
      />
    </Stack.Navigator>
  );
}

export default ResourcesNavigator;