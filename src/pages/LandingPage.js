import React, { useEffect, useState } from "react";
import { MapPin, Users, BookOpen, BarChart3, Bell, Shield, Star, Clock, Map } from "lucide-react";
import './LandingPage.css';

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("features");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sample study spots data
  const studySpots = [
    {
      id: 1,
      name: "UiTM Central Library",
      position: [3.0738, 101.5183],
      rating: 4.8,
      amenities: ["WiFi", "Quiet", "Power Outlets"],
      type: "library"
    },
    {
      id: 2,
      name: "Campus Cafe",
      position: [3.075, 101.517],
      rating: 4.2,
      amenities: ["Coffee", "Casual", "Group Friendly"],
      type: "cafe"
    },
    {
      id: 3,
      name: "Study Lounge",
      position: [3.072, 101.519],
      rating: 4.5,
      amenities: ["24/7 Access", "Whiteboards", "Printers"],
      type: "lounge"
    }
  ];

  // Sample study groups data
  const studyGroups = [
    {
      id: 1,
      name: "CS Study Group",
      subject: "ITT440",
      day: "Saturday",
      time: "14:00",
      location: "UiTM Shah Alam",
      match: 70,
      joined: true
    },
    {
      id: 2,
      name: "Math Wizards",
      subject: "MAT420",
      day: "Wednesday",
      time: "16:00",
      location: "Online",
      match: 85,
      joined: false
    },
    {
      id: 3,
      name: "Research Team",
      subject: "FYP",
      day: "Friday",
      time: "10:00",
      location: "Central Library",
      match: 65,
      joined: false
    }
  ];

  useEffect(() => {
    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setActiveTab(sectionId);
      setIsMenuOpen(false);
    }
  };

  const handleLogin = () => {
    alert("Redirecting to login page...");
  };

  const handleRegister = () => {
    alert("Redirecting to registration page...");
  };

  const handleDemo = () => {
    alert("Starting demo tour...");
  };

  return (
    <div className="landing-page">
      {/* Header/Navigation */}
      <header className={`header ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-text">StudyAlly</div>
              <div className="tagline">Collaborate. Study. Succeed.</div>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className={`hamburger-line ${isMenuOpen ? 'rotate-45' : ''}`}></div>
              <div className={`hamburger-line ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`hamburger-line ${isMenuOpen ? 'rotate-neg-45' : ''}`}></div>
            </button>
            
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <a 
                className={`nav-link ${activeTab === "features" ? "active" : ""}`}
                onClick={() => scrollToSection("features")}
              >
                Features
              </a>
              <a 
                className={`nav-link ${activeTab === "how-it-works" ? "active" : ""}`}
                onClick={() => scrollToSection("how-it-works")}
              >
                How It Works
              </a>
              <a 
                className={`nav-link ${activeTab === "testimonials" ? "active" : ""}`}
                onClick={() => scrollToSection("testimonials")}
              >
                Testimonials
              </a>
              <button 
                className="signin-button"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button 
                className="get-started-button"
                onClick={handleRegister}
              >
                Get Started
              </button>
            </nav>
          </div>

          {/* Mobile Navigation */}
          <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
            <nav className="mobile-nav-content">
              <a 
                className={`mobile-nav-link ${activeTab === "features" ? "active" : ""}`}
                onClick={() => scrollToSection("features")}
              >
                Features
              </a>
              <a 
                className={`mobile-nav-link ${activeTab === "how-it-works" ? "active" : ""}`}
                onClick={() => scrollToSection("how-it-works")}
              >
                How It Works
              </a>
              <a 
                className={`mobile-nav-link ${activeTab === "testimonials" ? "active" : ""}`}
                onClick={() => scrollToSection("testimonials")}
              >
                Testimonials
              </a>
              <button 
                className="mobile-signin-button"
                onClick={handleLogin}
              >
                Sign In
              </button>
              <button 
                className="mobile-get-started-button"
                onClick={handleRegister}
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-content fade-in">
              <div className="hero-text">
                <h1 className="hero-title">
                  Find Your Perfect{" "}
                  <span className="highlight">Study Space</span> &{" "}
                  <span className="highlight">Study Buddies</span>
                </h1>
                <p className="hero-description">
                  Discover quiet study spots, connect with compatible study partners, and boost your 
                  academic success with StudyAlly – Malaysia's premier study collaboration platform.
                </p>
              </div>
              
              <div className="hero-buttons">
                <button 
                  className="primary-button"
                  onClick={handleRegister}
                >
                  Join Now - It's Free
                </button>
                <button 
                  className="secondary-button"
                  onClick={() => scrollToSection("how-it-works")}
                >
                  Learn More
                </button>
              </div>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">2,500+</div>
                  <div className="stat-label">Active Students</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">150+</div>
                  <div className="stat-label">Study Locations</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4.9</div>
                  <div className="stat-label">User Rating</div>
                </div>
              </div>
            </div>

            <div className="hero-cards fade-in">
              <div className="card-grid">
                {/* Study Spot Card */}
                <div className="study-spot-card">
                  <div className="card-header">
                    <div className="card-icon">
                      <MapPin className="icon" />
                    </div>
                    <div className="card-title-section">
                      <h4 className="card-title">Study Spots Near You</h4>
                      <p className="card-subtitle">{studySpots.length} locations found</p>
                    </div>
                  </div>
                  <div className="amenity-tags">
                    <span className="tag rating-tag">⭐ {studySpots[0].rating} rating</span>
                    <span className="tag wifi-tag">📶 Free WiFi</span>
                    <span className="tag quiet-tag">🔇 Quiet</span>
                  </div>
                  <button className="card-button">
                    View All Spots
                  </button>
                </div>

                {/* Map Card */}
                <div className="map-card">
                  <div className="map-icon-container">
                    <Map className="map-icon" />
                  </div>
                  <h4 className="map-card-title">Interactive Study Map</h4>
                  <p className="map-card-description">Find & book study spaces in real-time</p>
                </div>

                {/* Study Group Card */}
                <div className="study-group-card">
                  <div className="subject-tag">
                    📖 {studyGroups[0].subject}
                  </div>
                  <h3 className="group-name">{studyGroups[0].name}</h3>
                  <div className="group-details">
                    <div className="detail-item">
                      <span>📅</span>
                      <span className="detail-text">{studyGroups[0].day}</span>
                    </div>
                    <div className="detail-item">
                      <Clock className="detail-icon" />
                      <span className="detail-text">{studyGroups[0].time}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin className="detail-icon" />
                      <span className="detail-text">{studyGroups[0].location}</span>
                    </div>
                  </div>
                  <div className="group-rating-section">
                    <div className="rating-stars">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="star-icon" />
                      ))}
                    </div>
                    <span className="match-percentage">Match: {studyGroups[0].match}%</span>
                  </div>
                  <button 
                    className={`group-button ${studyGroups[0].joined ? 'joined' : ''}`}
                  >
                    {studyGroups[0].joined ? '✓ Joined' : 'Join Group'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header fade-in">
            <h2 className="section-title">Supercharge Your Study Sessions</h2>
            <p className="section-description">
              Everything you need to study smarter, not harder
            </p>
          </div>
          
          <div className="features-grid">
            {[
              { icon: MapPin, title: "Smart Spot Finder", desc: "Discover the best study locations with real-time availability, noise levels, and amenity information." },
              { icon: Users, title: "Compatibility Matching", desc: "Connect with study partners who share your academic goals, schedule, and learning style." },
              { icon: BookOpen, title: "Group Collaboration", desc: "Create or join study groups with shared resources, schedules, and progress tracking." },
              { icon: BarChart3, title: "Study Analytics", desc: "Track your study habits, productivity, and group participation with insightful metrics." },
              { icon: Bell, title: "Smart Reminders", desc: "Get notifications for study sessions, group updates, and recommended study times." },
              { icon: Shield, title: "Verified Community", desc: "Study with confidence knowing all users are verified through university email addresses." }
            ].map((feature, index) => (
              <div key={index} className="feature-card fade-in">
                <div className="feature-icon">
                  <feature.icon className="icon" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header fade-in">
            <h2 className="section-title">How StudyAlly Works</h2>
            <p className="section-description">Get started in just a few simple steps</p>
          </div>
          
          <div className="steps-container">
            {[
              { num: "1", title: "Create Your Profile", desc: "Sign up with your university email and tell us about your subjects, schedule, and study preferences." },
              { num: "2", title: "Find Your Matches", desc: "Discover ideal study spots and compatible study partners based on your profile." },
              { num: "3", title: "Start Collaborating", desc: "Join study groups, book study spaces, and begin your journey to academic success." }
            ].map((step, index) => (
              <div key={index} className="step-item fade-in">
                <div className="step-number">{step.num}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cta-section fade-in">
            <button 
              className="cta-button"
              onClick={handleRegister}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header fade-in">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-description">
              Join thousands of students who have improved their grades with StudyAlly
            </p>
          </div>
          
          <div className="testimonials-grid">
            {[
              { name: "Ahmad Faris", school: "Computer Science, UiTM", quote: "StudyAlly helped me find the perfect study group for my computer science courses. My grades improved by a full letter grade!", avatar: "A" },
              { name: "Siti Nurhaliza", school: "Engineering, UM", quote: "I never knew there were so many great study spots on campus until I used StudyAlly. The noise level ratings are super accurate!", avatar: "S" },
              { name: "John Smith", school: "Business, UKM", quote: "As an international student, StudyAlly made it so easy to connect with local students who could help me with course material.", avatar: "J" }
            ].map((testimonial, index) => (
              <div key={index} className="testimonial-card fade-in">
                <div className="testimonial-rating">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="testimonial-star" />
                  ))}
                </div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.avatar}</div>
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <p className="author-school">{testimonial.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="final-cta-container">
          <div className="final-cta-content fade-in">
            <h2 className="final-cta-title">Ready to Transform Your Study Experience?</h2>
            <p className="final-cta-description">
              Join thousands of Malaysian students who are studying smarter with StudyAlly
            </p>
            <div className="final-cta-buttons">
              <button 
                className="final-primary-button"
                onClick={handleRegister}
              >
                Sign Up Free
              </button>
              <button 
                className="final-secondary-button"
                onClick={handleDemo}
              >
                Take a Tour
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">StudyAlly</div>
              <p className="footer-tagline">Collaborate. Study. Succeed.</p>
              <p className="footer-copyright">
                © {new Date().getFullYear()} StudyAlly. All rights reserved.
              </p>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-column-title">Product</h4>
              <div className="footer-links">
                <a href="#features" className="footer-link">Features</a>
                <a href="#how-it-works" className="footer-link">How It Works</a>
                <a href="#" className="footer-link">Pricing</a>
                <a href="#" className="footer-link">Demo</a>
              </div>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-column-title">Company</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">About Us</a>
                <a href="#" className="footer-link">Blog</a>
                <a href="#" className="footer-link">Careers</a>
                <a href="#" className="footer-link">Contact</a>
              </div>
            </div>
            
            <div className="footer-column">
              <h4 className="footer-column-title">Universities</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">UiTM</a>
                <a href="#" className="footer-link">UM</a>
                <a href="#" className="footer-link">UKM</a>
                <a href="#" className="footer-link">UTM</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Privacy Policy</a>
              <a href="#" className="footer-legal-link">Terms of Service</a>
              <a href="#" className="footer-legal-link">Help Center</a>
            </div>
            <div className="footer-social">
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">t</a>
              <a href="#" className="social-link">ig</a>
              <a href="#" className="social-link">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;