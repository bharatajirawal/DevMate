import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000, // 10 second timeout
});

// Request interceptor to add token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            const errorCode = error.response.data?.code;
            
            // Clear token for these specific auth errors
            if (['TOKEN_EXPIRED', 'TOKEN_BLACKLISTED', 'INVALID_TOKEN'].includes(errorCode)) {
                localStorage.removeItem('token');
                
                // Optional: Redirect to login page
                // window.location.href = '/login';
                
                // Or dispatch a logout action if using Redux/Context
                // store.dispatch(logout());
            }
        }
        
        return Promise.reject(error);
    }
);

// Helper function to manually set/remove token
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export default axiosInstance;