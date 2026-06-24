import { createContext, useContext, useState,useEffect } from "react";
import { getCurrentUser } from "../api/authApi";

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
        try {
            const result = await getCurrentUser();
            setUser(result.data);
        } catch (error) {
            logout();
        } finally {
            setLoading(false);
        }
    }
  useEffect(() => {
      if (token) {
          loadUser();
      } else {
          setLoading(false);
      }
  }, [token]);




  function login(token, user) {
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };