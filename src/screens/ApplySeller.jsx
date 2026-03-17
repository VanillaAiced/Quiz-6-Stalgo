import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./ApplySeller.css";

const SERVICE_CATEGORIES = [
  "AC Repair",
  "Washing Machine Service",
  "Refrigerator Service",
  "Water Heater Repair",
  "Other Appliances",
];

function ApplySeller() {
  const navigate = useNavigate();
  const { isAuthenticated, user, applyForSeller, getMySellerApplication } = useAuth();

  const existing = getMySellerApplication();

  const [formData, setFormData] = useState({
    businessName: "",
    serviceCategory: "",
    yearsOfExperience: "",
    bio: "",
    certifications: "",
    serviceArea: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Redirect unauthenticated users to sign in
  if (!isAuthenticated) {
    return (
      <main className="as-screen">
        <div className="as-gate">
          <h2 className="as-gate-title">Sign in to apply as a Seller</h2>
          <p className="as-gate-text">
            You need an account to submit a seller application.
          </p>
          <div className="as-gate-actions">
            <Link to="/signin" className="as-btn as-btn--primary">Sign In</Link>
            <Link to="/signup" className="as-btn as-btn--outline">Create Account</Link>
          </div>
        </div>
      </main>
    );
  }

  // Users who are already sellers or admins
  if (user.role === "seller") {
    return (
      <main className="as-screen">
        <div className="as-gate">
          <div className="as-status-icon as-status-icon--approved">✓</div>
          <h2 className="as-gate-title">You are already a Seller!</h2>
          <p className="as-gate-text">Your seller account is active.</p>
          <Link to="/" className="as-btn as-btn--primary">Go to Home</Link>
        </div>
      </main>
    );
  }

  if (user.role === "admin") {
    return (
      <main className="as-screen">
        <div className="as-gate">
          <div className="as-status-icon as-status-icon--approved">★</div>
          <h2 className="as-gate-title">You are an Admin</h2>
          <p className="as-gate-text">Admin accounts manage seller applications.</p>
          <Link to="/" className="as-btn as-btn--primary">Go to Home</Link>
        </div>
      </main>
    );
  }

  // Show pending / rejected status for existing applications
  if (existing && !submitted) {
    return (
      <main className="as-screen">
        <div className="as-gate">
          {existing.status === "pending" && (
            <>
              <div className="as-status-icon as-status-icon--pending">⏳</div>
              <h2 className="as-gate-title">Application Under Review</h2>
              <p className="as-gate-text">
                Your seller application for <strong>{existing.businessName}</strong> was
                submitted on {new Date(existing.submittedAt).toLocaleDateString()} and is
                currently pending admin approval.
              </p>
              <div className="as-status-badge as-status-badge--pending">Pending Approval</div>
            </>
          )}
          {existing.status === "rejected" && (
            <>
              <div className="as-status-icon as-status-icon--rejected">✕</div>
              <h2 className="as-gate-title">Application Rejected</h2>
              <p className="as-gate-text">
                Unfortunately your previous application was not approved. You may
                submit a new application below.
              </p>
              <button
                className="as-btn as-btn--primary"
                onClick={() => setFormData({ businessName: "", serviceCategory: "", yearsOfExperience: "", bio: "", certifications: "", serviceArea: "" })}
              >
                Reapply
              </button>
            </>
          )}
          <Link to="/" className="as-btn as-btn--outline" style={{ marginTop: 12 }}>Back to Home</Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="as-screen">
        <div className="as-gate">
          <div className="as-status-icon as-status-icon--pending">⏳</div>
          <h2 className="as-gate-title">Application Submitted!</h2>
          <p className="as-gate-text">
            Thank you, <strong>{user.first_name}</strong>! Your application to become a
            seller has been submitted and is pending review by our admin team. We will
            notify you once a decision has been made.
          </p>
          <div className="as-status-badge as-status-badge--pending">Pending Approval</div>
          <Link to="/" className="as-btn as-btn--outline" style={{ marginTop: 16 }}>Back to Home</Link>
        </div>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!formData.serviceCategory) newErrors.serviceCategory = "Please select a service category";
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Please enter your years of experience";
    else if (isNaN(formData.yearsOfExperience) || Number(formData.yearsOfExperience) < 0)
      newErrors.yearsOfExperience = "Please enter a valid number";
    if (!formData.bio.trim()) newErrors.bio = "Please provide a short bio";
    if (!formData.serviceArea.trim()) newErrors.serviceArea = "Service area is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    applyForSeller(formData);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="as-screen">
      <div className="as-container">
        {/* Header */}
        <header className="as-header">
          <h1 className="as-title">Apply to Become a Seller</h1>
          <p className="as-subtitle">
            Join our platform as a verified service expert. Fill in the details below
            and our admin team will review your application.
          </p>
        </header>

        {/* Info Banner */}
        <div className="as-info-banner">
          <span className="as-info-icon">ℹ</span>
          <span>
            Applications are reviewed by our admin team within 2–3 business days.
            You will be notified of the outcome.
          </span>
        </div>

        {/* Form */}
        <form className="as-form" onSubmit={handleSubmit} noValidate>
          <div className="as-section-title">Business Information</div>

          <div className="as-row">
            <div className="as-group">
              <label className="as-label">Business / Trade Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g. Evangelista Appliance Repair"
                className={`as-input ${errors.businessName ? "as-input--error" : ""}`}
              />
              {errors.businessName && <span className="as-error">{errors.businessName}</span>}
            </div>

            <div className="as-group">
              <label className="as-label">Primary Service Category</label>
              <div className="as-select-wrap">
                <select
                  name="serviceCategory"
                  value={formData.serviceCategory}
                  onChange={handleChange}
                  className={`as-select ${errors.serviceCategory ? "as-input--error" : ""}`}
                >
                  <option value="">Select a category</option>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              {errors.serviceCategory && <span className="as-error">{errors.serviceCategory}</span>}
            </div>
          </div>

          <div className="as-row">
            <div className="as-group">
              <label className="as-label">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 5"
                className={`as-input ${errors.yearsOfExperience ? "as-input--error" : ""}`}
              />
              {errors.yearsOfExperience && <span className="as-error">{errors.yearsOfExperience}</span>}
            </div>

            <div className="as-group">
              <label className="as-label">Service Area <span className="as-optional">(city / region)</span></label>
              <input
                type="text"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleChange}
                placeholder="e.g. Pampanga, Metro Manila"
                className={`as-input ${errors.serviceArea ? "as-input--error" : ""}`}
              />
              {errors.serviceArea && <span className="as-error">{errors.serviceArea}</span>}
            </div>
          </div>

          <div className="as-section-title" style={{ marginTop: 24 }}>About You</div>

          <div className="as-group as-group--full">
            <label className="as-label">Short Bio / Experience Summary</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your expertise, background, and what makes you a great service provider..."
              className={`as-textarea ${errors.bio ? "as-input--error" : ""}`}
            />
            {errors.bio && <span className="as-error">{errors.bio}</span>}
          </div>

          <div className="as-group as-group--full">
            <label className="as-label">Certifications / Licenses <span className="as-optional">(optional)</span></label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
              placeholder="e.g. TESDA NC II Refrigeration & Air-conditioning"
              className="as-input"
            />
          </div>

          {/* Applicant info read-only */}
          <div className="as-applicant-info">
            <span className="as-applicant-label">Applying as:</span>
            <span className="as-applicant-value">
              {user.first_name} {user.last_name} &bull; {user.email}
            </span>
          </div>

          <div className="as-form-actions">
            <button type="button" className="as-btn as-btn--outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="as-btn as-btn--primary">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ApplySeller;
