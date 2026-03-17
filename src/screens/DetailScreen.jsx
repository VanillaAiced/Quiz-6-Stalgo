import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DetailScreen.css";

function DetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const service = location.state?.service;
  const { isAuthenticated } = useAuth();

  const handleBookService = () => {
    if (!isAuthenticated) {
      navigate("/signin");
    } else {
      navigate(`/booking/${service.id}`, { state: { service } });
    }
  };

  if (!service) {
    return (
      <main className="detail-screen">
        <div className="error-container">
          <p>Service not found.</p>
          <button className="back-button" onClick={() => navigate("/")}>
            Back to Services
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-screen">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Back
      </button>

      <article className="detail-container">
        <div className="detail-image-section">
          <img
            className="detail-image"
            src={service.sample_image}
            alt={service.service_name}
          />
        </div>

        <div className="detail-content-section">
          <h1 className="detail-service-name">{service.service_name}</h1>

          <div className="detail-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-text">{service.rating} / 5</span>
          </div>

          <p className="detail-description">{service.description}</p>

          <div className="detail-info-grid">
            <div className="info-item">
              <label className="info-label">Price</label>
              <p className="info-value">${service.price}</p>
            </div>

            <div className="info-item">
              <label className="info-label">Duration</label>
              <p className="info-value">{service.duration_of_service}</p>
            </div>

            <div className="info-item full-width">
              <label className="info-label">Service Expert</label>
              <p className="info-value">{service.name_of_the_expert}</p>
            </div>
          </div>

          <button className="cta-button" onClick={handleBookService}>
            Book Service
          </button>
        </div>
      </article>
    </main>
  );
}

export default DetailScreen;
