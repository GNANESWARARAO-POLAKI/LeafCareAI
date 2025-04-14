import React, { useRef, createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, navigate: (path: string) => void) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, navigate: (path: string) => void) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // To handle loading state during auth check
  const authChecked = useRef(false);

  // ✅ Load user from localStorage on app start
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://leafcareai.vercel.app/backend/check_auth/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Send token in headers
          },
        });

        const data = await response.json();
        if (data.isAuthenticated) {
          console.log("User authenticated:", data);
          setUser({
            is_authenticated: true,
            id: data.id,
            email: data.email,
            name: data.username,
            is_verified: data.is_verified,
          });
        } else {
          logout(); // If token is invalid, log out user
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        logout();
      } finally {
        setLoading(false); // Stop loading after auth check
      }
    };

    if (!authChecked.current) {
      fetchUser();
      authChecked.current = true;
    }
  }, []);

  // ✅ Login function
  const login = async (email: string, password: string, navigate: (path: string) => void) => {
    try {
      const response = await fetch("https://leafcareai.vercel.app/backend/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.success === true) {
          localStorage.setItem("accessToken", data.access); // ✅ Store JWT token
          setUser({
            is_authenticated: true,
            id: data.id,
            email: email,
            name: data.username,
            is_verified: data.is_verified,
          });

          if (!data.is_verified) {
           
            // navigate("/verifyotp");
             window.location.href='/verifyotp'; 
             toast.success("Login successful, please verify OTP.");
          } else {
            toast.success("Login Successful");
            navigate("/");
          }
        } else {
          toast.info(data.error);
        }
      } else {
        console.error("Login error:", data.message);
        toast.error(data.message); // Show error message
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong!"); // Show error message
    }
  };

  // ✅ Register function
  const register = async (name: string, email: string, password: string, navigate: (path: string) => void) => {
    try {
      const response = await fetch("https://leafcareai.vercel.app/backend/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Registration Successful");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Register error:", error);
      toast.error("Something went wrong!"); // Show error message
    }
  };

  // ✅ Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken"); // ✅ Remove JWT token
    toast.success("Logout successful");
    window.location.href='/';
  };

  if (loading) {
  return (
      <div className="loading-container">
                  <ClipLoader size={50} color={"--navbar-bg"} loading={loading} />
                </div>
        ); // Show a loading spinner or message while checking auth
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);