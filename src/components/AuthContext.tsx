
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

// For demo purposes, we'll simulate authentication with localStorage
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("zoom-lite-user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    setIsLoading(true);
    
    // For demo, check if user exists in localStorage
    const usersData = localStorage.getItem("zoom-lite-users");
    const users = usersData ? JSON.parse(usersData) : [];
    
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }
    
    // Don't store password in the session
    const { password: _, ...userWithoutPassword } = foundUser;
    
    // Store user in localStorage
    localStorage.setItem("zoom-lite-user", JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
    setIsLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Get existing users or initialize empty array
    const usersData = localStorage.getItem("zoom-lite-users");
    const users = usersData ? JSON.parse(usersData) : [];
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      setIsLoading(false);
      throw new Error("User with this email already exists");
    }
    
    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, this would be hashed
    };
    
    // Add to users list
    users.push(newUser);
    localStorage.setItem("zoom-lite-users", JSON.stringify(users));
    
    // Log user in automatically after signup
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem("zoom-lite-user", JSON.stringify(userWithoutPassword));
    setUser(userWithoutPassword);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("zoom-lite-user");
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
