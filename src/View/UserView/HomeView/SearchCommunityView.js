import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  FlatList
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { TextInput } from "react-native-paper";
import { useAuth } from "../../../context/AuthContext";
import SafeArea from "../../SafeArea.js";
import {
  getAllCommunities,
  getUserCommunities
} from "../../../Controller/CommunitiesManager.js";
import App_StyleSheet from "../../../Styles/App_StyleSheet.js";
import Community from "../../../Model/Community.js";

function SearchCommunityView({ navigation }) {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);

  // Load data on screen focus
  const loadData = async () => {
    if (!user?.userUserName) return;

    const [allCommunities, userComms] = await Promise.all([
      getAllCommunities(),
      getUserCommunities(user.userUserName),
    ]);

    const formattedAll = allCommunities.map((c) => ({
      key: c.id,
      value: c.name,
    }));

    const formattedUser = userComms.map((c) => ({
      key: c.id,
      value: c.name,
    }));

    setCommunities(formattedAll);
    setFilteredCommunities(formattedAll);
    setUserCommunities(formattedUser);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user?.userUserName])
  );

  // Filter logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCommunities(communities);
    } else {
      setFilteredCommunities(
        communities.filter((c) =>
          c.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, communities]);

  return (
    <SafeArea>
      <View style={App_StyleSheet.content}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for communities..."
          style={App_StyleSheet.search}
        />

        <FlatList
          data={filteredCommunities}
          keyExtractor={(item) => item.key.toString()}
          style={App_StyleSheet.list}
          ListEmptyComponent={
            <Text style={App_StyleSheet.text}>
              No communities found
            </Text>
          }
          renderItem={({ item }) => {
            const isMember = userCommunities.some(
              (c) => c.key === item.key
            );

            return (
              <TouchableOpacity
                style={App_StyleSheet.list_item}
                onPress={() =>
                  navigation.navigate("Community", {
                    Community: new Community(item.key, item.value),
                    isMember: isMember,
                  })
                }
              >
                <Text>{item.value}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeArea>
  );
}

export default SearchCommunityView;