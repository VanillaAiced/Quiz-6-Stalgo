import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpenDropdown(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Washing</span>
        </Link>

        {/* Navigation Menu */}
        <ul className="nav-menu">
          {/* Our Services Dropdown */}
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown("services")}
            >
              Our Services
              <span className="dropdown-arrow">▼</span>
            </button>
            {openDropdown === "services" && (
              <div className="dropdown-menu">
                <Link to="/" className="dropdown-item">
                  AC Repair
                </Link>
                <Link to="/" className="dropdown-item">
                  Washing Machine
                </Link>
                <Link to="/" className="dropdown-item">
                  Refrigerator
                </Link>
                <Link to="/" className="dropdown-item">
                  Water Heater
                </Link>
              </div>
            )}
          </li>

          {/* Pricing */}
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Pricing
            </Link>
          </li>

          {/* For Business Dropdown */}
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown("business")}
            >
              For Business
              <span className="dropdown-arrow">▼</span>
            </button>
            {openDropdown === "business" && (
              <div className="dropdown-menu">
                <Link to="/" className="dropdown-item">
                  Partner with Us
                </Link>
                <Link to="/" className="dropdown-item">
                  Business Solutions
                </Link>
                <Link to="/" className="dropdown-item">
                  Contact Sales
                </Link>
              </div>
            )}
          </li>

          {/* Support */}
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Support
            </Link>
          </li>

          {/* Resources Dropdown */}
          <li className="nav-item dropdown">
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown("resources")}
            >
              Resources
              <span className="dropdown-arrow">▼</span>
            </button>
            {openDropdown === "resources" && (
              <div className="dropdown-menu">
                <Link to="/" className="dropdown-item">
                  Blog
                </Link>
                <Link to="/" className="dropdown-item">
                  Documentation
                </Link>
                <Link to="/" className="dropdown-item">
                  FAQs
                </Link>
              </div>
            )}
          </li>
        </ul>

        {/* Auth Links */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <>
                  <Link to="/admin-dashboard" className="nav-link nav-link--admin">
                    Admin Dashboard
                  </Link>
                  <Link to="/paypal-transactions" className="nav-link nav-link--paypal">
                    Transactions
                  </Link>
                </>
              )}
              {user?.role === "user" && (
                <Link to="/apply-seller" className="nav-link nav-link--seller">
                  Become a Seller
                </Link>
              )}
              {user?.role === "seller" && (
                <span className="nav-link role-badge role-badge--seller">Seller</span>
              )}
              {user?.role === "admin" && (
                <span className="nav-link role-badge role-badge--admin">Admin</span>
              )}
              <span className="nav-link user-text">{user?.first_name || "Logged In"}</span>
              <button onClick={handleLogout} className="nav-link logout-btn">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="nav-link">
                Sign Up
              </Link>
              <Link to="/signin" className="nav-link">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
