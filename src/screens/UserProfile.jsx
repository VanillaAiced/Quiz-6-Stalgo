import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  const [userOrders, setUserOrders] = useState([]);

  // Load user's orders from localStorage
  useEffect(() => {
    if (user?.email) {
      loadUserOrders();
    }
  }, [user?.email]);

  const loadUserOrders = () => {
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const userBookings = allBookings.filter(
      (booking) => booking.customerEmail === user?.email
    );
    setUserOrders(userBookings);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const joinDate = new Date(user?.joinDate || Date.now()).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="user-profile">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">{userInitials}</div>
            <div className="profile-info">
              <h1>{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-role">
                Role:{" "}
                <span className={`role-badge role-${user?.role}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </p>
            </div>
          </div>

          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <p className="stat-label">Member Since</p>
              <p className="stat-value">{joinDate}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <p className="stat-value">{userOrders.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Total Spent</p>
              <p className="stat-value">
                $
                {userOrders
                  .reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="user-details-section">
          <h2>Profile Information</h2>
          <div className="details-grid">
            <div className="detail-field">
              <label>Full Name</label>
              <p>{user?.name}</p>
            </div>

            <div className="detail-field">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>

            <div className="detail-field">
              <label>Account Type</label>
              <p>
                {user?.role === "seller"
                  ? "Service Provider"
                  : user?.role === "admin"
                  ? "Administrator"
                  : "Regular User"}
              </p>
            </div>

            <div className="detail-field">
              <label>Member ID</label>
              <p>{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="orders-section">
          <h2>Your Bookings</h2>

          {userOrders.length === 0 ? (
            <div className="no-orders">
              <p>No bookings yet. Start by exploring our services!</p>
              <button
                className="btn-browse-services"
                onClick={() => navigate("/")}
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Booking Date</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order) => (
                    <tr key={order.id} className={`row-${order.status}`}>
                      <td className="service-name">
                        {order.paypalOrderDescription || order.serviceName}
                      </td>
                      <td className="booking-date">
                        {new Date(order.bookingDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="location">{order.location}</td>
                      <td className="price">${parseFloat(order.amount).toFixed(2)}</td>
                      <td>
                        <span
                          className={`status-badge status-${order.status || "pending"}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="detail-link">
                        <button className="btn-view-detail">View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="info-cards">
          <div className="info-card">
            <h3>Need Help?</h3>
            <p>Our support team is here to assist you 24/7.</p>
            <button className="btn-support">Contact Support</button>
          </div>

          <div className="info-card">
            <h3>Upgrade Your Experience</h3>
            <p>Subscribe to unlock premium features and priority support.</p>
            <button
              className="btn-subscribe"
              onClick={() => navigate("/subscriptions")}
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
