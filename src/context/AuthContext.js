import { createContext, useState, useContext, useEffect } from "react";

// User roles: "user" | "seller" | "admin"

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sellerApplications, setSellerApplications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

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

    const storedUsers = localStorage.getItem("allUsers");
    if (storedUsers) {
      try {
        setAllUsers(JSON.parse(storedUsers));
      } catch (err) {
        localStorage.removeItem("allUsers");
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
    const newUser = { 
      ...userData, 
      role: "user",
      userId: `user_${Date.now()}`,
      id: `user_${Date.now()}`,
      joinDate: new Date().toISOString(),
    };
    setUser(newUser);
    setIsAuthenticated(true);
    
    // Store in allUsers list
    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    localStorage.setItem("allUsers", JSON.stringify(updated));
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
      userId: user.userId,
      status: "pending",
      submittedAt: new Date().toISOString(),
      merchantId: null,
      declineReason: null,
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

  // Admin: Approve a seller application
  const approveSeller = (applicantEmail, merchantId) => {
    // Update the application
    const updated = sellerApplications.map((app) =>
      app.applicantEmail === applicantEmail
        ? { ...app, status: "approved", merchantId, declineReason: null }
        : app
    );
    setSellerApplications(updated);
    localStorage.setItem("sellerApplications", JSON.stringify(updated));

    // Update the user's role to "seller"
    const updatedUsers = allUsers.map((u) =>
      u.email === applicantEmail ? { ...u, role: "seller", merchantId } : u
    );
    setAllUsers(updatedUsers);
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));

    // If current user was approved, update their session
    if (user?.email === applicantEmail) {
      const updatedUser = { ...user, role: "seller", merchantId };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Admin: Decline a seller application
  const declineSeller = (applicantEmail, declineReason) => {
    const updated = sellerApplications.map((app) =>
      app.applicantEmail === applicantEmail
        ? { ...app, status: "rejected", declineReason, merchantId: null }
        : app
    );
    setSellerApplications(updated);
    localStorage.setItem("sellerApplications", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        applyForSeller,
        getMySellerApplication,
        sellerApplications,
        approveSeller,
        declineSeller,
        allUsers,
      }}
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
