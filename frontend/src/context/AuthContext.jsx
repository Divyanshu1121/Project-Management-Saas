import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async (token) => {
            try {
                // Check if token is expired before hitting the backend
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000; // in seconds
                if (decoded.exp && decoded.exp < currentTime) {
                    // Token has expired — clear it without calling backend
                    localStorage.removeItem('token');
                    setLoading(false);
                    return;
                }

                // Fetch from backend to ensure the user still exists/is active
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const profile = await res.json();
                    setUser(profile);
                } else {
                    logout();
                }
            } catch (error) {
                console.error('Profile fetch failed:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
