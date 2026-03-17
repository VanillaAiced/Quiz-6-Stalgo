import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a seller
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    } else if (user?.role !== "seller") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Form states for adding new service
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Load seller's services from localStorage
  const [myServices, setMyServices] = useState([]);

  useEffect(() => {
    loadMyServices();
  }, [user?.email]);

  const loadMyServices = () => {
    const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const userEmail = user?.email;
    const sellerServices =
      JSON.parse(localStorage.getItem(`sellerServices_${userEmail}`)) || [];
    setMyServices(sellerServices);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Price must be a valid positive number";
    }
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle add service
  const handleAddService = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newService = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      seller: user?.email,
      sellerName: user?.name || "Service Expert",
      createdDate: new Date().toISOString(),
    };

    // Save to localStorage
    const sellerServices =
      JSON.parse(localStorage.getItem(`sellerServices_${user?.email}`)) || [];
    sellerServices.push(newService);
    localStorage.setItem(
      `sellerServices_${user?.email}`,
      JSON.stringify(sellerServices)
    );

    // Update state
    setMyServices(sellerServices);

    // Reset form and show success message
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      imageUrl: "",
    });
    setErrors({});
    setShowForm(false);
    setSuccessMessage("Service added successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Handle delete service
  const handleDeleteService = (serviceId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this service? This action cannot be undone."
      )
    ) {
      const updatedServices = myServices.filter((s) => s.id !== serviceId);
      localStorage.setItem(
        `sellerServices_${user?.email}`,
        JSON.stringify(updatedServices)
      );
      setMyServices(updatedServices);
      setSuccessMessage("Service deleted successfully!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  // Handle edit service (open form with service data)
  const handleEditService = (service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration,
      imageUrl: service.imageUrl,
    });
    // Store which service is being edited
    sessionStorage.setItem("editingServiceId", service.id);
    setShowForm(true);
  };

  // Handle update service
  const handleUpdateService = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const editingServiceId = sessionStorage.getItem("editingServiceId");

    if (editingServiceId) {
      const updatedServices = myServices.map((s) =>
        s.id === parseInt(editingServiceId)
          ? {
              ...s,
              ...formData,
              price: parseFloat(formData.price),
              updatedDate: new Date().toISOString(),
            }
          : s
      );

      localStorage.setItem(
        `sellerServices_${user?.email}`,
        JSON.stringify(updatedServices)
      );
      setMyServices(updatedServices);

      setFormData({
        name: "",
        description: "",
        price: "",
        duration: "",
        imageUrl: "",
      });
      setErrors({});
      setShowForm(false);
      sessionStorage.removeItem("editingServiceId");
      setSuccessMessage("Service updated successfully!");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }
  };

  // Check if form is for editing
  const isEditing = sessionStorage.getItem("editingServiceId");

  if (!isAuthenticated || user?.role !== "seller") {
    return null;
  }

  return (
    <div className="seller-dashboard">
      <div className="seller-dashboard-container">
        <div className="seller-dashboard-header">
          <div>
            <h1>Seller Dashboard</h1>
            <p className="seller-subtitle">Manage your services and bookings</p>
          </div>
          {!showForm && (
            <button className="btn-add-service" onClick={() => setShowForm(true)}>
              + Add New Service
            </button>
          )}
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {showForm && (
          <div className="seller-form-section">
            <div className="form-header">
              <h2>{isEditing ? "Edit Service" : "Add New Service"}</h2>
              <button
                className="btn-close-form"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    name: "",
                    description: "",
                    price: "",
                    duration: "",
                    imageUrl: "",
                  });
                  setErrors({});
                  sessionStorage.removeItem("editingServiceId");
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={isEditing ? handleUpdateService : handleAddService}
              className="seller-service-form"
            >
              <div className="form-group">
                <label htmlFor="name">Service Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g., AC Repair, Washing Machine Service"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your service in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={errors.description ? "input-error" : ""}
                />
                {errors.description && (
                  <span className="error-message">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    placeholder="e.g., 25.00"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={errors.price ? "input-error" : ""}
                  />
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <input
                    id="duration"
                    type="text"
                    name="duration"
                    placeholder="e.g., 2 hours, 30 mins"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={errors.duration ? "input-error" : ""}
                  />
                  {errors.duration && (
                    <span className="error-message">{errors.duration}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL *</label>
                <input
                  id="imageUrl"
                  type="url"
                  name="imageUrl"
                  placeholder="e.g., https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className={errors.imageUrl ? "input-error" : ""}
                />
                {errors.imageUrl && (
                  <span className="error-message">{errors.imageUrl}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit"
                >
                  {isEditing ? "Update Service" : "Add Service"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      name: "",
                      description: "",
                      price: "",
                      duration: "",
                      imageUrl: "",
                    });
                    setErrors({});
                    sessionStorage.removeItem("editingServiceId");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="services-section">
          <h2>My Services ({myServices.length})</h2>
          {myServices.length === 0 ? (
            <div className="no-services">
              <p>No services yet. Create your first service to get started!</p>
              <button
                className="btn-add-service-large"
                onClick={() => setShowForm(true)}
              >
                + Add Service
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {myServices.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-image">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x200?text=Service+Image";
                      }}
                    />
                    <div className="price-badge">${service.price}</div>
                  </div>

                  <div className="service-details">
                    <h3>{service.name}</h3>
                    <p className="description">
                      {service.description.substring(0, 100)}
                      {service.description.length > 100 ? "..." : ""}
                    </p>
                    <div className="service-meta">
                      <span className="duration">⏱ {service.duration}</span>
                    </div>

                    <div className="service-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditService(service)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
