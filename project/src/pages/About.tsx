import React from 'react';
import { Plane as Plant, Shield, Brain, Heart } from 'lucide-react';

export const About = () => {
  return (
    <div className="container">
      <div className="hero-section">
        <h1>About LeafCare AI</h1>
        <p>We're dedicated to helping farmers and gardeners identify and treat plant diseases
          using cutting-edge artificial intelligence technology.</p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon-wrapper">
            <Plant className="about-icon" />
          </div>
          <h3>Our Mission</h3>
          <p>To make plant disease detection accessible to everyone, helping maintain
            healthier crops and gardens worldwide.</p>
        </div>

        <div className="about-card">
          <div className="about-icon-wrapper">
            <Brain className="about-icon" />
          </div>
          <h3>AI Technology</h3>
          <p>Powered by  machine learning models trained on thousands of leaf
            images of plants Apple,Tomato,Potato,Corn,.etc for better detection.</p>
        </div>

        {/* <div className="about-card">
          <div className="about-icon-wrapper">
            <Shield className="about-icon" />
          </div>
          <h3>Privacy & Security</h3>
          <p>Your data is secure with us. We use industry-standard encryption and
            never share your information.</p>
        </div>

        <div className="about-card">
          <div className="about-icon-wrapper">
            <Heart className="about-icon" />
          </div>
          <h3>Community</h3>
          <p>Join our growing community of gardeners and farmers helping each other
            maintain healthy plants.</p>
        </div> */}
      </div>
    </div>
  );
}