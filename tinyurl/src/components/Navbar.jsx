// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login'; // Full page reload
  };

  // Basic Styling for the Navbar
  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'space-between', // Pushes logo left, links right
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f8f9fa', // Light background color
      borderBottom: '1px solid #dee2e6', // Subtle bottom border
      fontFamily: 'Arial, sans-serif',
    },
    logo: {
      fontWeight: 'bold',
      fontSize: '1.5em',
      color: '#007bff', // Blue color for logo
      textDecoration: 'none', // Remove underline if using Link for logo
    },
    navLinks: {
      display: 'flex',
      gap: '20px', // Space between links and button
      alignItems: 'center',
    },
    link: {
      textDecoration: 'none',
      color: '#343a40', // Darker color for links
      fontSize: '1em',
      padding: '5px 0',
      borderBottom: '2px solid transparent', // For hover effect
      transition: 'border-color 0.2s ease-in-out',
    },
    // Add a pseudo-class effect simulation if needed for inline styles,
    // but prefer CSS for :hover
    linkHover: { // You'd apply this conditionally or use CSS classes
       borderBottomColor: '#007bff',
    },
    logoutButton: {
      padding: '8px 12px',
      backgroundColor: '#dc3545', // Red color for logout
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.9em',
      transition: 'background-color 0.2s ease',
    },
  };

  return (
    <nav style={styles.navbar}>
      {/* Logo Section */}
      <div>
        {/* You can make the logo a link to the dashboard/home */}
        <Link to="/dashboard" style={styles.logo}>
          TinyLinker {/* Or your App Name / Logo Image */}
        </Link>
      </div>

      {/* Navigation Links & Logout Section */}
      <div style={styles.navLinks}>
        <Link to="/dashboard" style={styles.link}>
          Home
        </Link>
        <Link to="/analytics" style={styles.link}>
          Analytics
        </Link>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;