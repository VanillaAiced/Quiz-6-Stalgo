import { createContext, useState, useContext, useEffect } from "react";

// User roles: "user" | "seller" | "admin"

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sellerApplications, setSellerApplications] = useState([]);

  // Load user and seller applications from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error parsing user data:", err);
        localStorage.removeItem("user");
      }
    }

    const storedApps = localStorage.getItem("sellerApplications");
    if (storedApps) {
      try {
        setSellerApplications(JSON.parse(storedApps));
      } catch (err) {
        localStorage.removeItem("sellerApplications");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Registration always creates a "user" role account
  const signup = (userData) => {
    const newUser = { ...userData, role: "user" };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  // Submit a seller application (status: "pending")
  const applyForSeller = (applicationData) => {
    const storedApps = localStorage.getItem("sellerApplications");
    const existing = storedApps ? JSON.parse(storedApps) : [];
    const newApplication = {
      ...applicationData,
      applicantEmail: user.email,
      applicantName: `${user.first_name} ${user.last_name}`,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    const updated = [...existing.filter((a) => a.applicantEmail !== user.email), newApplication];
    setSellerApplications(updated);
    localStorage.setItem("sellerApplications", JSON.stringify(updated));
  };

  // Get the current user's seller application (if any)
  const getMySellerApplication = () => {
    if (!user) return null;
    return sellerApplications.find((a) => a.applicantEmail === user.email) || null;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, signup, logout, applyForSeller, getMySellerApplication, sellerApplications }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
