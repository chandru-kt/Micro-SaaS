// src/components/AnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// --- Register Chart.js components ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/links/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
           throw new Error('Unauthorized. Please log in again.');
        }
        if (!response.ok) {
          const errorData = await response.text(); // Try to get more error details
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
        }

        const data = await response.json();
        console.log("Fetched Analytics Data:", data); // Log fetched data for debugging
        // Ensure data is an array. If the API returns an object with a links property:
        // setAnalyticsData(data.links || []);
        // If the API returns the array directly:
        setAnalyticsData(Array.isArray(data) ? data : []); // Safely handle non-array responses


      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err.message || 'Failed to load analytics data.');
        if (err.message.includes('Unauthorized')) {
            localStorage.removeItem('authToken');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // --- Process Data for Charts using useMemo ---

  // 1. Clicks Over Time (Aggregated across all links)
  const timeChartData = useMemo(() => {
    const aggregatedClicks = {};

    // Ensure analyticsData is an array before iterating
    if (Array.isArray(analyticsData)) {
        analyticsData.forEach(link => {
        // Check if clicksOverTime exists and is an object
        if (link.clicksOverTime && typeof link.clicksOverTime === 'object') {
            Object.entries(link.clicksOverTime).forEach(([date, count]) => {
                // Ensure count is a number
                const numericCount = typeof count === 'number' ? count : 0;
                aggregatedClicks[date] = (aggregatedClicks[date] || 0) + numericCount;
            });
        }
        });
    }

    const sortedDates = Object.keys(aggregatedClicks).sort((a, b) => new Date(a) - new Date(b));
    const clickCounts = sortedDates.map(date => aggregatedClicks[date]);

    return {
      labels: sortedDates,
      datasets: [
        {
          label: 'Total Clicks per Day',
          data: clickCounts,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  }, [analyticsData]);

  // 2. Device Breakdown (Aggregated across all links)
  const deviceChartData = useMemo(() => {
    const aggregatedDevices = {};

    if (Array.isArray(analyticsData)) {
        analyticsData.forEach(link => {
            if (link.deviceBreakdown && typeof link.deviceBreakdown === 'object') {
                Object.entries(link.deviceBreakdown).forEach(([device, count]) => {
                const normalizedDevice = device || 'Unknown';
                const numericCount = typeof count === 'number' ? count : 0;
                aggregatedDevices[normalizedDevice] = (aggregatedDevices[normalizedDevice] || 0) + numericCount;
                });
            }
        });
    }

    const deviceLabels = Object.keys(aggregatedDevices);
    const deviceCounts = Object.values(aggregatedDevices);

    const backgroundColors = [
        'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(101, 143, 75, 0.8)', 'rgba(199, 199, 199, 0.8)',
     ];
     const borderColors = backgroundColors.map(color => color.replace('0.8', '1'));

    return {
      labels: deviceLabels,
      datasets: [
        {
          label: 'Clicks by Device',
          data: deviceCounts,
          backgroundColor: backgroundColors.slice(0, deviceLabels.length),
          borderColor: borderColors.slice(0, deviceLabels.length),
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  // --- Chart Options ---
  const commonChartOptions = { /* ... existing options ... */
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true },
        tooltip: { mode: 'index', intersect: false },
      },
      maintainAspectRatio: false,
   };

  const lineChartOptions = { /* ... existing options ... */
        ...commonChartOptions,
        plugins: {
            ...commonChartOptions.plugins,
            title: { display: true, text: 'Total Clicks Over Time (All Links)' },
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Clicks' } },
            x: { title: { display: true, text: 'Date' } }
        }
   };

  const pieChartOptions = { /* ... existing options ... */
    ...commonChartOptions,
     plugins: {
        ...commonChartOptions.plugins,
        title: { display: true, text: 'Clicks by Device Type (All Links)' },
        tooltip: {
             callbacks: {
                label: function(context) {
                    let label = context.label || '';
                    if (label) label += ': ';
                    if (context.parsed !== null) {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) + '%' : '0.0%'; // Handle total 0
                        label += context.formattedValue + ` (${percentage})`;
                    }
                    return label;
                }
            }
        }
     }
  };

  // --- Basic Styling ---
  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px', // Wider for table
      margin: '20px auto',
    },
    header: {
      borderBottom: '1px solid #eee',
      paddingBottom: '10px',
      marginBottom: '30px',
    },
    loading: { /* ... */ },
    error: { /* ... */ },
    chartContainer: { /* ... */
        marginBottom: '40px',
        height: '350px',
        position: 'relative',
        border: '1px solid #eee',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
     },
     noData: { /* ... */ },
     // Styles for the Links Table
     tableContainer: {
        marginTop: '40px',
     },
     table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '15px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        fontSize: '0.9em',
     },
     th: {
        border: '1px solid #ddd',
        padding: '10px 12px', // More padding
        textAlign: 'left',
        backgroundColor: '#f8f9fa', // Lighter header
        fontWeight: 'bold', // Make header bold
        whiteSpace: 'nowrap', // Prevent header text wrapping
     },
     td: {
        border: '1px solid #ddd',
        padding: '10px 12px', // More padding
        textAlign: 'left',
        verticalAlign: 'top', // Align content to top
     },
     tdOriginalUrl: { // Style for potentially long URLs
        maxWidth: '350px', // Limit width
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', // Prevent wrapping
        wordBreak: 'break-all', // Break long words if needed (though nowrap usually prevents this)
     },
     link: {
         color: '#007bff',
         textDecoration: 'none',
     }
  };

  // --- Render Logic ---
  if (loading) {
    return <div style={styles.loading}>Loading Analytics...</div>;
  }

  if (error) {
    // Display error details if available
    const displayError = error.includes("message: ") ? error.split("message: ")[1] : error;
    return <div style={styles.container}><div style={styles.error}>Error: {displayError}</div></div>;
  }

  // Check if analyticsData is an array and has items
   const hasLinkData = Array.isArray(analyticsData) && analyticsData.length > 0;

  // --- Helper Function to Format Date ---
  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          return new Date(dateString).toLocaleDateString(undefined, { // Use user's locale
                year: 'numeric',
                month: 'short',
                day: 'numeric'
          });
      } catch (e) {
          console.warn("Could not format date:", dateString, e);
          return dateString; // Return original if formatting fails
      }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Link Analytics Dashboard</h2>

      {/* --- Charts Section --- */}
      {!hasLinkData ? (
           <div style={styles.noData}>No link data available yet. Create some short links first!</div>
      ) : (
        <>
            {/* Clicks Over Time Chart */}
            <div style={styles.chartContainer}>
                {timeChartData.labels.length > 0 ? (
                    <Line options={lineChartOptions} data={timeChartData} />
                ) : (
                    <div style={styles.noData}>No click data yet for time trend.</div>
                )}
            </div>

            {/* Device Breakdown Chart */}
            <div style={styles.chartContainer}>
                {deviceChartData.labels.length > 0 ? (
                    <Pie options={pieChartOptions} data={deviceChartData} />
                ) : (
                    <div style={styles.noData}>No device click data yet.</div>
                )}
            </div>
        </>
      )}


      {/* --- Links Summary Table --- */}
      {hasLinkData && (
        <div style={styles.tableContainer}>
            <h3>Links Summary</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Short URL</th>
                  <th style={styles.th}>Original URL</th>
                  <th style={styles.th}>Total Clicks</th>
                  <th style={styles.th}>Date Created</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((link, index) => (
                  // Use link._id or link.shortCode if available and unique, otherwise fall back to index
                  <tr key={link._id || link.shortCode || index}>
                    <td style={styles.td}>
                      {/* Ensure shortUrl is complete, construct if needed */}
                      {link.shortUrl ? (
                          <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" style={styles.link}>
                            {/* Display relative part or full URL */}
                            {link.shortUrl.replace(/^https?:\/\//, '')}
                          </a>
                      ) : link.shortCode ? (
                          // Construct URL if only shortCode is available (adjust domain if needed)
                          <a href={`${window.location.origin}/${link.shortCode}`} target="_blank" rel="noopener noreferrer" style={styles.link}>
                              {`${window.location.host}/${link.shortCode}`}
                          </a>
                      ) : (
                          'N/A'
                      )}
                    </td>
                    <td style={{...styles.td, ...styles.tdOriginalUrl}} title={link.originalUrl || 'N/A'}>
                       {/* Add title attribute to show full URL on hover */}
                      {link.originalUrl || 'N/A'}
                    </td>
                    <td style={styles.td}>
                      {/* Assuming totalClicks is directly available on the link object */}
                      {typeof link.clicks === 'number' ? link.clicks : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      {formatDate(link.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
      {!hasLinkData && loading === false && !error && (
          // This message is already shown above, but keep it just in case
          // <div style={styles.noData}>No link data available yet.</div>
          null
      )}

    </div>
  );
}

export default AnalyticsPage;