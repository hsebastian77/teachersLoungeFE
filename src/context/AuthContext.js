import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingAuth, setPendingAuth] = useState(null);

  const login = (userData) => {
    setUser(userData);
    setPendingAuth(null);
  };

  const logout = () => {
    setUser(null);
    setPendingAuth(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}