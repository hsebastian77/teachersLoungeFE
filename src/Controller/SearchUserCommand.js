import { apiUrl, searchUserRoute } from "@env";
import Friend from "../Model/Friend";

import * as SecureStore from "expo-secure-store";

const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
};

const searchUser = async (searchQuery, options = {}) => {
  const normalizedQuery = searchQuery.trim();
  if (normalizedQuery.length < 2) {
    return { ok: true, users: [] };
  }

  var users = [];
  let urlUser = `${apiUrl}${searchUserRoute}?searchQuery=${encodeURIComponent(normalizedQuery)}`;
  const reqOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (await SecureStore.getItemAsync("token")),
    },
    signal: options.signal,
  };

  try {
    const response = await fetch(urlUser, reqOptions);
    const results = await safeParseJson(response);

    if (response.status === 429) {
      return {
        ok: false,
        rateLimited: true,
        users: [],
        message: results.message || "Pause typing for a moment and try again.",
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        users: [],
        message: results.message || "Unable to search for users.",
      };
    }

    var data = results.data;
    var count = 0;
    if (data) {
      while (data[count] != undefined) {
        const schoolInfo = data[count].schoolname || data[count].schoolid || data[count].SchoolName || data[count].SchoolID || "";

        users.unshift(
          new Friend(
            data[count].email,
            data[count].firstname,
            data[count].lastname,
            schoolInfo,
            data[count].role,
            data[count].username || data[count].Username || ""
          )
        );
        count += 1;
      }
    }

    return { ok: true, users };
  } catch (error) {
    if (error?.name === "AbortError") {
      return { ok: false, aborted: true, users: [] };
    }

    return {
      ok: false,
      users: [],
      message: "Unable to search for users.",
    };
  }
};

export { searchUser };
