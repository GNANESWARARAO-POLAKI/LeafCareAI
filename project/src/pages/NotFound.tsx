import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404 - Page Not Found</h1>
      <p className="notfound-message">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to="/" className="button">
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotFound;