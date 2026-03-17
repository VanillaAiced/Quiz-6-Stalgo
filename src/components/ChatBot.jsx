import { useState } from "react";
import "./ChatBot.css";

// Knowledge base for the appliance repair service platform
const CHATBOT_KNOWLEDGE = {
  services: {
    keywords: ["service", "repair", "appliance", "available", "offers"],
    response:
      "We offer four main services: AC Repair, Washing Machine Service, Refrigerator Service, and Water Heater Repair. Each service includes expert diagnosis and professional maintenance. Price ranges from $14 to $27 depending on the service.",
  },
  booking: {
    keywords: ["book", "booking", "schedule", "appointment", "how to book"],
    response:
      "To book a service: 1) Browse our services on the home page 2) Click on a service card 3) Select your location, property type, and appliance details 4) Choose your preferred date and time 5) Enter your contact information 6) Complete payment via PayPal. You must be logged in to book.",
  },
  payment: {
    keywords: ["payment", "pay", "price", "cost", "paypal", "subscription"],
    response:
      "We accept PayPal payments directly. Payment goes to the service expert's PayPal account, with the platform monitoring all transactions. We also offer subscription plans: Starter ($9.99/month), Professional ($24.99/month), and Enterprise ($99.99/month).",
  },
  seller: {
    keywords: [
      "seller",
      "become seller",
      "apply",
      "merchant",
      "provide service",
    ],
    response:
      "To become a seller: 1) Create an account as a regular user 2) Click 'Become a Seller' 3) Fill out your business information and experience 4) Submit your application 5) Wait for admin approval. Once approved, you'll get a Merchant ID and can provide services on our platform.",
  },
  subscription: {
    keywords: ["subscription", "tier", "plan", "starter", "professional"],
    response:
      "Our subscription tiers are: Starter ($9.99/mo) - 5 services, Profesional ($24.99/mo) - 20 services, and Enterprise ($99.99/mo) - Unlimited services. Each tier includes different levels of support.",
  },
  orders: {
    keywords: ["order", "booking status", "my order", "track", "history"],
    response:
      "You can view all your orders in your Profile page. Click your profile icon > 'My Profile' to see your order history, order status, and service details.",
  },
  contact: {
    keywords: ["contact", "support", "help", "email", "phone"],
    response:
      "For support, visit our Support page in the navbar or email us. Our support team responds within 24 hours. Priority support is available for Professional and Enterprise subscribers.",
  },
  default: "I'm not sure about that. Could you ask about services, booking, payment, becoming a seller, subscriptions, or your orders?",
};

function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm here to help with questions about our appliance repair services. How can I assist you?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Match user input to knowledge base
  const findAnswer = (userInput) => {
    const input = userInput.toLowerCase();

    for (const [key, data] of Object.entries(CHATBOT_KNOWLEDGE)) {
      if (data.keywords.some((keyword) => input.includes(keyword))) {
        return data.response;
      }
    }

    return CHATBOT_KNOWLEDGE.default;
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot thinking and response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: findAnswer(inputValue),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  if (!isOpen) {
    return (
      <button
        className="chatbot-fab"
        onClick={() => setIsOpen(true)}
        title="Open Chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3 className="chatbot-title">Platform Assistant</h3>
        <button className="chatbot-close" onClick={() => setIsOpen(false)}>
          ✕
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chatbot-message ${msg.isBot ? "bot" : "user"}`}>
            {msg.isBot && <span className="chatbot-avatar">🤖</span>}
            <div className="chatbot-bubble">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="chatbot-message bot">
            <span className="chatbot-avatar">🤖</span>
            <div className="chatbot-bubble chatbot-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <form className="chatbot-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chatbot-input"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
        />
        <button type="submit" className="chatbot-send-btn" disabled={isTyping}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBot;
