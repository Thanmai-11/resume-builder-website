import { createContext, useContext, useState, useCallback } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem("rb_username"));

  const login = useCallback(async (user, pass) => {
    const { token } = await api.login(user, pass);
    localStorage.setItem("rb_token", token);
    localStorage.setItem("rb_username", user);
    setUsername(user);
  }, []);

  const register = useCallback(async (user, email, pass) => {
    const { token } = await api.register(user, email, pass);
    localStorage.setItem("rb_token", token);
    localStorage.setItem("rb_username", user);
    setUsername(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rb_token");
    localStorage.removeItem("rb_username");
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ username, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
