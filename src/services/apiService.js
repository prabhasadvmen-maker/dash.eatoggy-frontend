const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://dash-eatoggy-backend.onrender.com' : 'http://localhost:5000');

export default API_BASE_URL;
