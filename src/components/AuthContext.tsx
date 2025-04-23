import { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API URL - Using the full backend URL again
const API_URL = "https://vis-meet-backend.onrender.com/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("auth-token");
    
    if (token) {
      // Verify token and get user data
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch user data with token
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-auth-token': token
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If token is invalid, clear localStorage
        localStorage.removeItem("auth-token");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("auth-token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { email });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log("Login response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials');
        }
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        } catch (e) {
          throw new Error('Login failed - server error');
        }
      }
      
      const data = await response.json();
      console.log("Login successful, received data:", { userId: data.user?.id });
      
      // Save token to localStorage
      localStorage.setItem("auth-token", data.token);
      
      // Set user state
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting signup with:", { name, email });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      console.log("Signup response status:", response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Signup failed');
        } catch (e) {
          throw new Error('Signup failed - server error');
        }
      }
      
      const data = await response.json();
      console.log("Signup successful, received data:", { userId: data.user?.id });
      
      // Save token to localStorage
      localStorage.setItem("auth-token", data.token);
      
      // Set user state
      setUser(data.user);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
