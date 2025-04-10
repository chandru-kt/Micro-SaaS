// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // To potentially navigate after logout

const API_BASE_URL = 'http://localhost:5000'; // Your backend URL

function Dashboard() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expirationDate, setExpirationDate] = useState(''); // Store as string from input
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // --- Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    // Navigate to login page after clearing token
    // App.js's ProtectedRoute will also handle redirection if state updates properly,
    // but direct navigation is clearer here.
    navigate('/login');
     // Optional: Force reload if state management isn't immediately reflecting the change
     // window.location.reload();
  };

  // --- Form Submission Handler ---
  const handleCreateLink = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication error. Please log in again.');
      setLoading(false);
      // Optional: Redirect to login if token is missing
      // handleLogout();
      return;
    }

    // Prepare payload - only include optional fields if they have values
    const payload = {
      originalUrl,
    };
    if (customAlias) {
      payload.customAlias = customAlias;
    }
    if (expirationDate) {
      // Ensure the date string is in a format the backend understands (ISO 8601 is good)
      // The datetime-local input usually provides a suitable format.
      payload.expirationDate = expirationDate;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/links/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the JWT
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status}`);
      }

      // --- Success ---
      setSuccessMessage(`Short URL created: ${data.shortUrl}`);
      // Clear the form fields after successful submission
      setOriginalUrl('');
      setCustomAlias('');
      setExpirationDate('');

    } catch (err) {
      console.error('Failed to create link:', err);
      setError(err.message || 'Failed to create short link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Basic Styling (Inline for simplicity) ---
   const styles = {
    dashboardContainer: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px', // Limit width
        margin: '20px auto', // Center container
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px', // Space between form elements
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      marginBottom: '30px' // Space below the form
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '5px',
      fontWeight: 'bold',
      fontSize: '0.9em',
      color: '#333'
    },
    input: {
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '1em',
    },
    button: {
      padding: '10px 15px',
      backgroundColor: '#28a745', // Green color for create
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.2s ease',
      opacity: loading ? 0.7 : 1,
      alignSelf: 'flex-start' // Align button left
    },
     logoutButton: {
      padding: '8px 12px',
      backgroundColor: '#dc3545', // Red color for logout
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
       float: 'right' // Position logout button top right
    },
    message: {
      marginTop: '10px',
      padding: '10px',
      borderRadius: '4px',
      textAlign: 'center',
      minHeight: '20px',
    },
    success: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb',
    },
    loading: {
       textAlign: 'center',
       color: '#555',
       minHeight: '20px',
       marginBottom: '10px'
    },
    header: {
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
    }
  };


  // --- Render Component ---
  return (
    <div style={styles.dashboardContainer}>
       <p>Welcome! Create a new short link below.</p>

       {/* Create Link Form */}
       <form onSubmit={handleCreateLink} style={styles.form}>
         <h3>Create New Short Link</h3>
         <div style={styles.inputGroup}>
           <label htmlFor="originalUrl" style={styles.label}>Original URL*:</label>
           <input
             type="url" // Use type="url" for basic validation
             id="originalUrl"
             value={originalUrl}
             onChange={(e) => setOriginalUrl(e.target.value)}
             required
             style={styles.input}
             placeholder="https://your-long-url.com/goes-here"
           />
         </div>

         <div style={styles.inputGroup}>
           <label htmlFor="customAlias" style={styles.label}>Custom Alias (Optional):</label>
           <input
             type="text"
             id="customAlias"
             value={customAlias}
             onChange={(e) => setCustomAlias(e.target.value)}
             style={styles.input}
             placeholder="my-custom-link (no spaces)"
           />
         </div>

         <div style={styles.inputGroup}>
           <label htmlFor="expirationDate" style={styles.label}>Expiration Date (Optional):</label>
           <input
             type="datetime-local" // Use datetime-local for date and time selection
             id="expirationDate"
             value={expirationDate}
             onChange={(e) => setExpirationDate(e.target.value)}
             style={styles.input}
             min={new Date().toISOString().slice(0, 16)} // Prevent selecting past dates
           />
         </div>

         {/* Loading Indicator */}
         {loading && <div style={styles.loading}>Creating link...</div>}

         {/* Success/Error Messages */}
         {successMessage && <div style={{...styles.message, ...styles.success}}>{successMessage}</div>}
         {error && <div style={{...styles.message, ...styles.error}}>{error}</div>}

         <button
           type="submit"
           style={styles.button}
           disabled={loading || !originalUrl} // Disable if loading or no URL entered
         >
           {loading ? 'Creating...' : 'Create Short Link'}
         </button>
       </form>
    </div>
  );
}

export default Dashboard;