import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

// Ensure the base URL doesn't include /api since it will be added in the route paths
const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Essential for cookies to be sent
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add response interceptor for handling token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("Attempting to refresh token...");
                // Try to refresh the token
                const refreshResponse = await axios.post(
                    `${API_URL}/api/auth/refresh-token`,
                    {},
                    {
                        withCredentials: true // Essential for receiving cookies
                    }
                );

                if (refreshResponse.data && refreshResponse.data.accessToken) {
                    // Update token in storage and headers
                    console.log("Token refreshed successfully");
                    localStorage.setItem('accessToken', refreshResponse.data.accessToken);
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;

                    // Retry the original request
                    return axiosInstance(originalRequest);
                } else {
                    console.warn("Refresh response received but no token found:", refreshResponse.data);
                    throw new Error("No token in refresh response");
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Clear user data on refresh failure
                localStorage.removeItem('accessToken');
                // Handle logout
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
    const [loading, setLoading] = useState(true);

    // Update the Authorization header when accessToken changes
    useEffect(() => {
        if (accessToken) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    }, [accessToken]);

    // Listen for logout events (for handling from interceptors)
    useEffect(() => {
        const handleLogout = () => {
            setAccessToken(null);
            setUser(null);
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const fetchUserProfile = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }

        try {
            const res = await axiosInstance.get('/api/auth/me');
            if (res.data && res.data.user) {
                setUser(res.data.user);
                console.log("User profile fetched successfully:", res.data.user);
            } else {
                console.warn("User profile response missing user data:", res.data);
                // If no user data, clear token
                setAccessToken(null);
                localStorage.removeItem('accessToken');
            }
        } catch (err) {
            console.error('Fetching user failed:', err);
            // Error handling is now in the interceptor
            if (err.response && err.response.status !== 401) {
                toast.error('Failed to fetch user profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [accessToken]);

    // Get user info on first mount if token exists
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const signup = async (name, email, password, role) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/api/auth/signup', { name, email, password, role });
            const { accessToken, user } = res.data;

            localStorage.setItem('accessToken', accessToken);
            setAccessToken(accessToken);
            setUser(user);
            toast.success(`Welcome, ${user.name}!`);

            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
            toast.error(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    }

    const login = async (email, password) => {
        setLoading(true);
        try {
            console.log(`Attempting login for ${email}`);
            const res = await axiosInstance.post('/api/auth/login', { email, password });

            if (res.data && res.data.accessToken && res.data.user) {
                console.log('Login successful, saving token and user data');
                const { accessToken, user } = res.data;

                localStorage.setItem('accessToken', accessToken);
                setAccessToken(accessToken);
                setUser(user);
                toast.success(`Welcome back, ${user.name}!`);

                return { success: true, user };
            } else {
                console.warn('Login response missing token or user data:', res.data);
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Login failed:', err);
            const statusCode = err.response?.status;
            let errorMessage = 'Login failed. Please try again.';

            if (statusCode === 401) {
                errorMessage = 'Invalid email or password.';
            } else if (statusCode === 404) {
                errorMessage = 'User not found. Please check your email or sign up.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            // Call logout endpoint to clear cookies on server
            try {
                console.log("Calling logout endpoint to clear server-side cookies");
                await axiosInstance.post('/api/auth/logout');
            } catch (logoutErr) {
                console.error('Logout API call failed:', logoutErr);
                // Continue with client-side logout regardless
            }

            // Clear client-side storage
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);

            toast.info('You have been logged out');
            return true;
        } catch (err) {
            console.error('Logout failed:', err);
            toast.error('Logout failed. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const contextValue = {
        user,
        accessToken,
        loading,
        login,
        logout,
        axiosInstance,
        signup,
        refreshUser: fetchUserProfile
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};