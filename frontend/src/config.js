// API Configuration
// Change REACT_APP_API_URL environment variable to switch between local and production

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.73:5000';

export default API_BASE_URL;
