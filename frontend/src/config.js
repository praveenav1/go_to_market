// API Configuration
// Change REACT_APP_API_URL environment variable to switch between local and production

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.216.27.100:5000';

export default API_BASE_URL;
