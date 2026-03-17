import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";
import BookingScreen from "./screens/BookingScreen";
import ApplySeller from "./screens/ApplySeller";
import AdminDashboard from "./screens/AdminDashboard";
import PayPalTransactions from "./screens/PayPalTransactions";
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
            <Route path="/booking/:id" element={<BookingScreen />} />
            <Route path="/apply-seller" element={<ApplySeller />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/paypal-transactions" element={<PayPalTransactions />} />
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
