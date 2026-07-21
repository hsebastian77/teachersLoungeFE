import React, { useState, useCallback } from "react";
import { Text, FlatList, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import SafeArea from "../../SafeArea";
import App_StyleSheet from "../../../Styles/App_StyleSheet";
import { getUserCommunities } from "../../../Controller/CommunitiesManager.js";
import Community from "../../../Model/Community.js";

function CommunitiesView({ navigation }) {
  const { user } = useAuth();

  const [communities, setCommunities] = useState([]);

  const loadCommunities = async () => {
    if (!user?.userUserName) return;

    const data = await getUserCommunities(user.userUserName);

    setCommunities(
      data.map((c) => ({
        key: c.id,
        value: c.name,
      }))
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadCommunities();
    }, [user?.userUserName])
  );

  return (
    <SafeArea>
      <FlatList
        style={App_StyleSheet.content}
        ListEmptyComponent={
          <Text style={App_StyleSheet.list_message}>
            No communities joined
          </Text>
        }
        data={communities}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={App_StyleSheet.list_item}
            onPress={() =>
              navigation.navigate("Community", {
                Community: new Community(item.key, item.value),
                isMember: true,
              })
            }
          >
            <Text>{item.value}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeArea>
  );
}

export default CommunitiesView;