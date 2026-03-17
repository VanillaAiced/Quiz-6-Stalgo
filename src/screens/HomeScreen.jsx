import { useNavigate } from "react-router-dom";
import "./HomeScreen.css";

const services = [
  {
    id: 1,
    service_name: "AC Repair",
    description:
      "Split and window AC inspection, cooling issue diagnosis, and gas refill support.",
    rating: 4.8,
    price: 1299,
    duration_of_service: "2-3 hours",
    name_of_the_expert: "Rajesh Kumar",
    sample_image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    service_name: "Washing Machine Service",
    description:
      "Drum cleaning, noise troubleshooting, and repair for top-load and front-load units.",
    rating: 4.6,
    price: 899,
    duration_of_service: "1-2 hours",
    name_of_the_expert: "Priya Singh",
    sample_image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    service_name: "Refrigerator Service",
    description:
      "Compressor, cooling, and leakage checks with complete preventive maintenance.",
    rating: 4.7,
    price: 1499,
    duration_of_service: "2-4 hours",
    name_of_the_expert: "Amit Patel",
    sample_image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    service_name: "Water Heater Repair",
    description:
      "Element replacement, thermostat checks, and emergency no-hot-water support.",
    rating: 4.5,
    price: 799,
    duration_of_service: "1-2 hours",
    name_of_the_expert: "Vikram Sharma",
    sample_image:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80",
  },
];

function HomeScreen() {
  const navigate = useNavigate();

  const handleCardClick = (service) => {
    navigate(`/details/${service.id}`, { state: { service } });
  };

  return (
    <main className="home-screen">
      <section className="services-section">
        <h1 className="services-title">Our Services</h1>
        <p className="services-subtitle">
          Choose a service category to get started quickly.
        </p>

        <div className="services-grid">
          {services.map((service) => (
            <article
              className="service-card"
              key={service.id}
              onClick={() => handleCardClick(service)}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCardClick(service);
                }
              }}
            >
              <img
                className="service-image"
                src={service.sample_image}
                alt={service.service_name}
                loading="lazy"
              />
              <div className="service-content">
                <h2 className="service-name">{service.service_name}</h2>
                <p className="service-description">{service.description}</p>
                <p className="service-rating">Rating: {service.rating} / 5</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomeScreen;
