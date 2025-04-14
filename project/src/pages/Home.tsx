import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, MessageSquare, Shield } from 'lucide-react';
import { Helmet } from "react-helmet-async";

export const Home = () => {
  return (
    <div className="container">
      <Helmet>
        <title>LeafCare AI</title>
        <meta name="title" content="LeafCare AI" />
        <meta name='site_name' content='LeafCare AI' />
        <meta name="description" content="Detect plant diseases with AI. Upload a photo of your plant's leaf and get instant disease detection powered by advanced AI. Chat with our bot to learn more about treatment options." />
        <meta name="author" content="Gnaneswararao Polaki" />
        <meta name="keywords" content="LeafCareAI,LeafAI,LeafCareAI,AI,Disease Detection, Leaf Disease Detection,LeafCare AI,LeafCare,Leaf Care,LeafCare AI Detection,LeafDiseases,LeafCare AI disease Detection,LeafCare AI Chat" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://leafcareai.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://leafcareai.vercel.app/" />
        <meta property="og:title" content="LeafCare AI" />
        <meta property="og:description" content="Detect plant diseases with AI. Upload a photo of your plant's leaf and get instant disease detection powered by advanced AI. Chat with our bot to learn more about treatment options." />
        <meta property="og:image" content="https://leafcareai.vercel.app/media/image.png" />
        <meta property="og:site_name" content="LeafCare AI" />
        <meta name="google-site-verification" content="d0oy5jCoPPwl3c5Bsw-1MykaGi_9SfS10l7kIwaKVlw" />
        
      </Helmet>
      <div className="hero-section">
        <h1>Detect Plant Leaf Diseases with AI</h1>
        <p>Upload a photo of your plant's leaf and get instant disease detection
          powered by AI. Chat with our bot to learn more about treatment options.</p>
        <Link to="/upload" className="button">Get Started</Link>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <Upload className="feature-icon" />
          <h3>Easy Upload</h3>
          <p>Simply upload a photo of your plant's leaf to begin the analysis</p>
        </div>
        <div className="feature-card">
          <Shield className="feature-icon" />
          <h3>Instant Detection</h3>
          <p>Get disease detection results within seconds</p>
        </div>
        <div className="feature-card">
          <MessageSquare className="feature-icon" />
          <h3>AI Chat</h3>
          <p>Chat with our AI bot for detailed treatment recommendations</p>
        </div>
      </div>
    </div>
  );
}