import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check localStorage first, then sessionStorage
    const storedUser =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    const storedToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData, accessToken, rememberMe = false) => {
    setUser(userData);
    setToken(accessToken);

    if (rememberMe) {
      // Persist after browser restart
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("access_token", accessToken);

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("access_token");
    } else {
      // Clear when browser closes
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("access_token", accessToken);

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("access_token");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};