const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://api.eatoggy.in' : 'http://localhost:5000');

export default API_BASE_URL;
