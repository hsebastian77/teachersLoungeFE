import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app load
  useEffect(() => {
    const loadSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const email = await SecureStore.getItemAsync("username");

        if (token && email) {
          // Optional: fetch user profile from backend here
          setUser({ email });
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Login owns persistence
  const login = async (userData, token = null) => {
    setUser(userData);
    setPendingAuth(null);

    if (token) {
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("username", userData.email);
    }
  };

  // Logout cleanup
  const logout = async () => {
    setUser(null);
    setPendingAuth(null);

    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("username");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        pendingAuth,
        setPendingAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}