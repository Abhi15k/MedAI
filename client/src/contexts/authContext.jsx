import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || null);
    const [loading, setLoading] = useState(true);

    // Update the Authorization header when accessToken changes
    useEffect(() => {
        if (accessToken) {
            axiosInstance.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
            delete axiosInstance.defaults.headers['Authorization'];
        }
    }, [accessToken]);

    const fetchUserProfile = useCallback(async () => {
        if (!accessToken) {
            setLoading(false);
            return;
        }
        try {
            const res = await axiosInstance.get('/auth/me');
            setUser(res.data.user);
        } catch (err) {
            console.error('Fetching user failed:', err);
            if (err.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('accessToken');
                setAccessToken(null);
                setUser(null);
            } else {
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
            const res = await axiosInstance.post('/auth/signup', { name, email, password, role });
            const { accessToken, user } = res.data;

            localStorage.setItem('accessToken', accessToken);
            setAccessToken(accessToken);
            setUser(user);
            toast.success(`Welcome, ${user.name}!`);

            // Instead of page reload, return success for navigation control
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
            const res = await axiosInstance.post('/auth/login', { email, password });
            const { accessToken, user } = res.data;

            localStorage.setItem('accessToken', accessToken);
            setAccessToken(accessToken);
            setUser(user);
            toast.success(`Welcome back, ${user.name}!`);

            // Instead of page reload, return success for navigation control
            return { success: true, user };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setLoading(true);
        try {
            localStorage.removeItem('accessToken');
            setAccessToken(null);
            setUser(null);
            setLoading(false);
            toast.info('You have been logged out');
        }
        catch (err) {
            console.error('Logout failed:', err);
            toast.error('Logout failed. Please try again.');
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
        signup
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};