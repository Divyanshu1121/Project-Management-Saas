import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // We might want to fetch full user details here from /me endpoint
                    // For now, trust the token somewhat or just set basic info
                    setUser(decoded);
                    // Ideally: fetchUser(token).then(u => setUser(u)).catch(() => logout())
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => { // userData from login response
        localStorage.setItem('token', token);
        // Decode to get minimal info immediately if needed, or use userData
        // const decoded = jwtDecode(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // window.location.href = '/login'; // Or use navigate in component
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
