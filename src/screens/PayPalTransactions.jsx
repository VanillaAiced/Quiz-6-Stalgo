import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./PayPalTransactions.css";

function PayPalTransactions() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    setTransactions(storedTransactions.reverse());
  }, []);

  // Only admins can view all transactions
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="paypal-screen">
        <div className="paypal-gate">
          <h2 className="paypal-gate-title">Access Denied</h2>
          <p className="paypal-gate-text">Only admins can view transaction history.</p>
          <button className="paypal-btn paypal-btn--primary" onClick={() => navigate("/")}>
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="paypal-screen">
      <div className="paypal-container">
        <header className="paypal-header">
          <h1 className="paypal-title">PayPal Merchant Transactions</h1>
          <p className="paypal-subtitle">Platform monitoring dashboard</p>
        </header>

        <div className="paypal-stats">
          <div className="stat-card">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">
              ${transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Sellers</div>
            <div className="stat-value">
              {new Set(transactions.map((t) => t.sellerMerchantId)).size}
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="paypal-empty">
            <p>No transactions recorded yet.</p>
          </div>
        ) : (
          <div className="paypal-table-wrapper">
            <table className="paypal-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Invoice #</th>
                  <th>Order Description</th>
                  <th>Price</th>
                  <th>Seller Merchant ID</th>
                  <th>Seller Name</th>
                  <th>Customer Name</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.transactionId}>
                    <td className="paypal-txn-id">{txn.transactionId}</td>
                    <td className="paypal-invoice">{txn.invoiceNumber}</td>
                    <td className="paypal-description">
                      <strong>{txn.paypalOrderDescription}</strong>
                    </td>
                    <td className="paypal-amount">${txn.amount}</td>
                    <td className="paypal-merchant">
                      <code>{txn.sellerMerchantId}</code>
                    </td>
                    <td>{txn.sellerName}</td>
                    <td>{txn.customerName}</td>
                    <td>{new Date(txn.bookingDate).toLocaleDateString()}</td>
                    <td>
                      <span className="paypal-status paypal-status--completed">
                        {txn.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PayPal Info Box */}
        <div className="paypal-info-box">
          <h3>PayPal Merchant Account Info</h3>
          <div className="paypal-info-grid">
            <div className="info-item">
              <span className="info-label">Platform Merchant ID</span>
              <span className="info-value">MERCHANT_PLATFORM</span>
            </div>
            <div className="info-item">
              <span className="info-label">Currency</span>
              <span className="info-value">USD</span>
            </div>
            <div className="info-item">
              <span className="info-label">Transaction Recording</span>
              <span className="info-value">Active (Client-side Demo)</span>
            </div>
            <div className="info-item">
              <span className="info-label">Multi-Merchant Model</span>
              <span className="info-value">Enabled</span>
            </div>
          </div>
          <p className="paypal-note">
            <strong>Note:</strong> In production, each seller's transactions would be visible in their
            own PayPal account. The platform displays all transactions for monitoring purposes only.
          </p>
        </div>
      </div>
    </main>
  );
}

export default PayPalTransactions;
