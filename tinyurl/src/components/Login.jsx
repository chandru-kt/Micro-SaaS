// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // If using react-router for redirection

const API_BASE_URL = 'http://localhost:5000'; // Your backend URL

function Login({ onLoginSuccess }) { // Pass a callback for successful login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Optional: For redirection after login

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle errors (e.g., 401 Unauthorized)
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // --- Login Successful ---
      console.log('Login successful:', data);

      // Store the token (e.g., in localStorage)
      if (data.token) {
        localStorage.setItem('authToken', data.token); // Store the JWT

        // Optionally: Call a function passed from the parent component
        if (onLoginSuccess) {
          onLoginSuccess(data.token);
        }

        // Optionally: Redirect the user (e.g., to the dashboard)
        // navigate('/dashboard'); // Make sure you have routing set up

      } else {
         throw new Error('No token received from server.');
      }

    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Basic Styling (Inline for simplicity, consider CSS Modules or Tailwind)
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh', // Use viewport height
      fontFamily: 'Arial, sans-serif',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      padding: '30px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      minWidth: '300px', // Minimum width for the form
      backgroundColor: '#f9f9f9'
    },
    inputGroup: {
      marginBottom: '15px',
    },
    label: {
      marginBottom: '5px',
      display: 'block',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box', // Include padding in width calculation
    },
    button: {
      padding: '10px 15px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.2s ease',
      opacity: loading ? 0.7 : 1, // Dim button when loading
    },
    buttonHover: { // Define hover effect separately if not using CSS classes
       // Use :hover in actual CSS or styled-components
    },
    error: {
      color: 'red',
      marginTop: '10px',
      textAlign: 'center',
      minHeight: '20px', // Reserve space even when no error
    },
    loading: {
       textAlign: 'center',
       marginTop: '10px',
       minHeight: '20px', // Reserve space
       color: '#555',
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="intern@dacoid.com" // Hint for testing
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Test123" // Hint for testing
          />
        </div>
         {/* Display Loading or Error Message */}
        {loading && <div style={styles.loading}>Logging in...</div>}
        {error && <div style={styles.error}>{error}</div>}

        <button
          type="submit"
          style={styles.button}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Submitting...' : 'Login'}
        </button>
      </form>
        <p style={{marginTop: '15px', color: '#666', fontSize: '0.9em'}}>
           Test Credentials: <br/>
           Email: <code>intern@dacoid.com</code> <br/>
           Password: <code>Test123</code>
        </p>
    </div>
  );
}

export default Login;