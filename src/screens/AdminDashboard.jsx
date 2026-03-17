import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user, sellerApplications, approveSeller, declineSeller } = useAuth();

  const [activeTab, setActiveTab] = useState("sellers");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [merchantId, setMerchantId] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [merchantError, setMerchantError] = useState("");

  // Redirect non-admins
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="admin-screen">
        <div className="admin-gate">
          <h2 className="admin-gate-title">Access Denied</h2>
          <p className="admin-gate-text">Only admins can access this page.</p>
          <button className="admin-btn admin-btn--primary" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  const pendingApps = sellerApplications.filter((a) => a.status === "pending");
  const approvedApps = sellerApplications.filter((a) => a.status === "approved");
  const rejectedApps = sellerApplications.filter((a) => a.status === "rejected");

  // Open approve modal
  const handleOpenApprove = (app) => {
    setSelectedApp(app);
    setMerchantId("");
    setMerchantError("");
    setShowApproveModal(true);
  };

  // Approve seller
  const handleApprove = () => {
    if (!merchantId.trim()) {
      setMerchantError("Merchant ID is required");
      return;
    }
    if (!merchantId.match(/^[a-zA-Z0-9_-]+$/)) {
      setMerchantError("Invalid Merchant ID format");
      return;
    }
    approveSeller(selectedApp.applicantEmail, merchantId);
    setShowApproveModal(false);
    setSelectedApp(null);
  };

  // Open decline modal
  const handleOpenDecline = (app) => {
    setSelectedApp(app);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  // Decline seller
  const handleDecline = () => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining");
      return;
    }
    declineSeller(selectedApp.applicantEmail, declineReason);
    setShowDeclineModal(false);
    setSelectedApp(null);
  };

  return (
    <main className="admin-screen">
      <div className="admin-container">
        {/* Header */}
        <header className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage seller applications</p>
        </header>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === "sellers" ? "admin-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("sellers")}
          >
            Pending Applications ({pendingApps.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "approved" ? "admin-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved ({approvedApps.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "rejected" ? "admin-tab-btn--active" : ""}`}
            onClick={() => setActiveTab("rejected")}
          >
            Declined ({rejectedApps.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-tab-content">
          {/* Pending Sellers */}
          {activeTab === "sellers" && (
            <div className="admin-section">
              {pendingApps.length === 0 ? (
                <div className="admin-empty">
                  <p>No pending applications</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Business Name</th>
                        <th>Service Category</th>
                        <th>Experience</th>
                        <th>Service Area</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingApps.map((app) => (
                        <tr key={app.applicantEmail}>
                          <td>{app.applicantName}</td>
                          <td>{app.applicantEmail}</td>
                          <td>{app.businessName}</td>
                          <td>{app.serviceCategory}</td>
                          <td>{app.yearsOfExperience} years</td>
                          <td>{app.serviceArea}</td>
                          <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                          <td className="admin-actions">
                            <button
                              className="admin-action-btn admin-action-btn--approve"
                              onClick={() => handleOpenApprove(app)}
                            >
                              Approve
                            </button>
                            <button
                              className="admin-action-btn admin-action-btn--decline"
                              onClick={() => handleOpenDecline(app)}
                            >
                              Decline
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Approved Sellers */}
          {activeTab === "approved" && (
            <div className="admin-section">
              {approvedApps.length === 0 ? (
                <div className="admin-empty">
                  <p>No approved applications</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Business Name</th>
                        <th>Merchant ID</th>
                        <th>Approved Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedApps.map((app) => (
                        <tr key={app.applicantEmail}>
                          <td>{app.applicantName}</td>
                          <td>{app.applicantEmail}</td>
                          <td>{app.businessName}</td>
                          <td className="admin-merchant-id">{app.merchantId}</td>
                          <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Rejected Sellers */}
          {activeTab === "rejected" && (
            <div className="admin-section">
              {rejectedApps.length === 0 ? (
                <div className="admin-empty">
                  <p>No declined applications</p>
                </div>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Business Name</th>
                        <th>Decline Reason</th>
                        <th>Declined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedApps.map((app) => (
                        <tr key={app.applicantEmail}>
                          <td>{app.applicantName}</td>
                          <td>{app.applicantEmail}</td>
                          <td>{app.businessName}</td>
                          <td className="admin-decline-reason">{app.declineReason}</td>
                          <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedApp && (
        <div className="admin-modal-overlay" onClick={() => setShowApproveModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Approve Seller Application</h2>
              <button className="admin-modal-close" onClick={() => setShowApproveModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-modal-info">
                Approving <strong>{selectedApp.applicantName}</strong> will upgrade their account to Seller
                and assign them a merchant ID for PayPal transactions.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Merchant ID (for PayPal)</label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => {
                    setMerchantId(e.target.value);
                    setMerchantError("");
                  }}
                  placeholder="e.g. MERCHANT_ABC123"
                  className={`admin-form-input ${merchantError ? "admin-form-input--error" : ""}`}
                />
                {merchantError && <span className="admin-form-error">{merchantError}</span>}
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--outline"
                onClick={() => setShowApproveModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--approve"
                onClick={handleApprove}
              >
                Approve & Assign Merchant ID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedApp && (
        <div className="admin-modal-overlay" onClick={() => setShowDeclineModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Decline Seller Application</h2>
              <button className="admin-modal-close" onClick={() => setShowDeclineModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-modal-info">
                Declining <strong>{selectedApp.applicantName}</strong>'s application. Please provide a reason.
              </p>
              <div className="admin-form-group">
                <label className="admin-form-label">Reason for Declining</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Explain why this application is being declined..."
                  rows={4}
                  className="admin-form-textarea"
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn--outline"
                onClick={() => setShowDeclineModal(false)}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn--decline"
                onClick={handleDecline}
              >
                Decline Application
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
