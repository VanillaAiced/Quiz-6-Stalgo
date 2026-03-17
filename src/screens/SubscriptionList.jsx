import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SubscriptionList.css";

function SubscriptionList() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    } else if (user?.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const [subscriptions, setSubscriptions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Load subscriptions from localStorage
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = () => {
    const subs = JSON.parse(localStorage.getItem("subscriptions")) || [];
    setSubscriptions(subs);
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filterStatus === "all") return true;
    return sub.status === filterStatus;
  });

  // Sort subscriptions
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(b.subscriptionDate) - new Date(a.subscriptionDate)
        );
      case "name":
        return a.userName.localeCompare(b.userName);
      case "plan":
        return a.planName.localeCompare(b.planName);
      case "price":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    revenue:
      subscriptions
        .filter((s) => s.status === "active")
        .reduce((sum, s) => sum + s.price, 0) * 30, // Monthly recurring
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="subscription-list">
      <div className="subscription-list-container">
        {/* Header */}
        <div className="subscription-list-header">
          <div>
            <h1>Subscription Management</h1>
            <p className="subtitle">View and manage all user subscriptions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <p className="stat-label">Total Subscribers</p>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">✓</div>
            <div className="stat-content">
              <p className="stat-label">Active Subscriptions</p>
              <p className="stat-value">{stats.active}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">×</div>
            <div className="stat-content">
              <p className="stat-label">Cancelled</p>
              <p className="stat-value">{stats.cancelled}</p>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Monthly Revenue (Active)</p>
              <p className="stat-value">${stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="filter-group">
            <label>Status Filter:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>

          <div className="sort-group">
            <label>Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date">Subscription Date (Newest)</option>
              <option value="name">User Name (A-Z)</option>
              <option value="plan">Plan Type (A-Z)</option>
              <option value="price">Price (Highest)</option>
            </select>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="subscriptions-section">
          {sortedSubscriptions.length === 0 ? (
            <div className="no-subscriptions">
              <p>No subscriptions found for the selected filter.</p>
            </div>
          ) : (
            <div className="subscriptions-table-wrapper">
              <table className="subscriptions-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Price/Month</th>
                    <th>Subscription Date</th>
                    <th>Renewal Date</th>
                    <th>Status</th>
                    <th>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubscriptions.map((sub) => {
                    const renewalDate = new Date(sub.renewalDate);
                    const today = new Date();
                    const daysLeft = Math.ceil(
                      (renewalDate - today) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr
                        key={sub.id}
                        className={`row-${sub.status} ${
                          daysLeft <= 7 && daysLeft > 0 ? "expiring-soon" : ""
                        }`}
                      >
                        <td className="user-name">
                          <strong>{sub.userName}</strong>
                        </td>
                        <td className="user-email">{sub.userEmail}</td>
                        <td className="plan-name">{sub.planName}</td>
                        <td className="price">${sub.price.toFixed(2)}</td>
                        <td className="subscription-date">
                          {new Date(sub.subscriptionDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="renewal-date">
                          {new Date(sub.renewalDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${sub.status}`}
                          >
                            {sub.status === "active" ? "Active" : "Cancelled"}
                          </span>
                        </td>
                        <td className={`days-left ${daysLeft <= 7 ? "warn" : ""}`}>
                          {sub.status === "active"
                            ? daysLeft > 0
                              ? `${daysLeft} days`
                              : "Expired"
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Plan Breakdown */}
        <div className="plan-breakdown">
          <h2>Subscription Breakdown by Plan</h2>
          <div className="breakdown-cards">
            {["Starter", "Professional", "Enterprise"].map((planName) => {
              const planSubs = subscriptions.filter(
                (s) => s.planName === planName && s.status === "active"
              );
              const planRevenue = planSubs.reduce((sum, s) => sum + s.price, 0) * 30;

              return (
                <div key={planName} className="breakdown-card">
                  <h3>{planName}</h3>
                  <p className="breakdown-subscribers">
                    <span className="label">Subscribers:</span>
                    <span className="value">{planSubs.length}</span>
                  </p>
                  <p className="breakdown-revenue">
                    <span className="label">Monthly Revenue:</span>
                    <span className="value">${planRevenue.toFixed(2)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionList;
