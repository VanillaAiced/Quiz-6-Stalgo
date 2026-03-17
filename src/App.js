import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";
import BookingScreen from "./screens/BookingScreen";
import ApplySeller from "./screens/ApplySeller";
import AdminDashboard from "./screens/AdminDashboard";
import PayPalTransactions from "./screens/PayPalTransactions";
import SellerDashboard from "./screens/SellerDashboard";
import UserProfile from "./screens/UserProfile";
import SubscriptionScreen from "./screens/SubscriptionScreen";
import SubscriptionList from "./screens/SubscriptionList";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="App">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/details/:id" element={<DetailScreen />} />
            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute requiredRole="user">
                  <BookingScreen />
                </ProtectedRoute>
              }
            />
            <Route path="/apply-seller" element={<ApplySeller />} />
            <Route
              path="/seller-dashboard"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute requiredRole="user">
                  <SubscriptionScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paypal-transactions"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PayPalTransactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-list"
              element={
                <ProtectedRoute requiredRole="admin">
                  <SubscriptionList />
                </ProtectedRoute>
              }
            />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
        <ChatBot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
