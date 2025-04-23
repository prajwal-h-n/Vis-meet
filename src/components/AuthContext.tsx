import { createContext, useContext, useState, useEffect } from "react";
import ServerStatusAlert from "./ServerStatusAlert";

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
  isServerAvailable: boolean;
  serverError: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use relative URL to work with our server-side proxy
const API_URL = "/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // Check server availability
    checkServerAvailability();
    
    // Check if token exists in localStorage
    const token = localStorage.getItem("auth-token");
    
    if (token) {
      // Verify token and get user data
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Check if the server is available
  const checkServerAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404) {
        setIsServerAvailable(false);
        setServerError("Backend server is not available. Authentication features will not work.");
      } else {
        setIsServerAvailable(true);
        setServerError(null);
      }
    } catch (error) {
      console.error("Server availability check failed:", error);
      setIsServerAvailable(false);
      setServerError("Could not connect to the backend server.");
    }
  };

  // Fetch user data with token
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        method: 'GET',
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
    
    // Check server availability before attempting login
    if (!isServerAvailable) {
      setIsLoading(false);
      throw new Error("Backend server is not available. Please try again later.");
    }
    
    try {
      console.log("Attempting login with:", { email });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log("Login response status:", response.status);
      
      const responseData = await response.json();
      console.log("Login response data:", responseData);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials');
        } else if (response.status === 404) {
          setIsServerAvailable(false);
          throw new Error('Login endpoint not found. Backend server may be unavailable.');
        } else if (responseData && responseData.message) {
          throw new Error(responseData.message);
        } else {
          throw new Error(`Login failed - server returned ${response.status}`);
        }
      }
      
      // If response was OK but doesn't have expected data structure
      if (!responseData || !responseData.token) {
        console.error("Invalid response format:", responseData);
        throw new Error('Invalid server response format');
      }
      
      console.log("Login successful, received data:", { userId: responseData.user?.id });
      
      // Save token to localStorage
      localStorage.setItem("auth-token", responseData.token);
      
      // Set user state
      setUser(responseData.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Check server availability before attempting signup
    if (!isServerAvailable) {
      setIsLoading(false);
      throw new Error("Backend server is not available. Please try again later.");
    }
    
    try {
      console.log("Attempting signup with:", { name, email });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      console.log("Signup response status:", response.status);
      
      const responseData = await response.json();
      console.log("Signup response data:", responseData);
      
      if (!response.ok) {
        if (response.status === 404) {
          setIsServerAvailable(false);
          throw new Error('Registration endpoint not found. Backend server may be unavailable.');
        } else if (responseData && responseData.message) {
          throw new Error(responseData.message);
        } else {
          throw new Error(`Signup failed - server returned ${response.status}`);
        }
      }
      
      // If response was OK but doesn't have expected data structure
      if (!responseData || !responseData.token) {
        console.error("Invalid response format:", responseData);
        throw new Error('Invalid server response format');
      }
      
      console.log("Signup successful, received data:", { userId: responseData.user?.id });
      
      // Save token to localStorage
      localStorage.setItem("auth-token", responseData.token);
      
      // Set user state
      setUser(responseData.user);
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
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isLoading,
      isServerAvailable,
      serverError
    }}>
      {!isServerAvailable && <ServerStatusAlert />}
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

