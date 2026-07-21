import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PrivateSpacesListView from "./PrivateSpacesListView";
import PrivateSpaceView from "./PrivateSpaceView";
import CreatePrivateSpaceView from "./CreatePrivateSpaceView";
import PrivateSpaceMembersView from "./PrivateSpaceMembersView";
import InviteUserView from "./InviteUserView";
import PrivateSpacePostView from "./PrivateSpacePostView";
import CreatePrivateSpacePostView from "./CreatePrivateSpacePostView";

const Stack = createNativeStackNavigator();

function PrivateSpacesNavigator() {
  const defaultOptions = {
    headerStyle: {
      backgroundColor: "#6382E8",
    },
    headerTintColor: "#FFFFFF",
    headerTitleStyle: {
      fontWeight: "bold",
    },
    headerBackTitleVisible: false,
  };

  return (
    <Stack.Navigator
      initialRouteName="PrivateSpacesList"
      screenOptions={defaultOptions}
    >
      <Stack.Screen
        name="PrivateSpacesList"
        component={PrivateSpacesListView}
        options={{
          title: "Private Spaces",
          headerLeft: () => null,
        }}
      />

      <Stack.Screen
        name="PrivateSpace"
        component={PrivateSpaceView}
        options={{ title: "Private Space" }}
      />

      <Stack.Screen
        name="CreatePrivateSpace"
        component={CreatePrivateSpaceView}
        options={{ title: "Create Private Space" }}
      />

      <Stack.Screen
        name="PrivateSpaceMembers"
        component={PrivateSpaceMembersView}
        options={{ title: "Members" }}
      />

      <Stack.Screen
        name="InviteUser"
        component={InviteUserView}
        options={{ title: "Invite Member" }}
      />

      <Stack.Screen
        name="PrivateSpacePost"
        component={PrivateSpacePostView}
        options={{ title: "Post" }}
      />

      <Stack.Screen
        name="CreatePrivateSpacePost"
        component={CreatePrivateSpacePostView}
        options={{ title: "Create Post" }}
      />
    </Stack.Navigator>
  );
}

export default PrivateSpacesNavigator;