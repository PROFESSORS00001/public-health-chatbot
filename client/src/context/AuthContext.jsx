import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const navigate = useNavigate();
    const location = useLocation();

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();

                if (data.authenticated) {
                    setIsAuthenticated(true);
                } else {
                    // Token invalid/expired
                    logout();
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                setToken(data.token);
                setIsAuthenticated(true);
                navigate('/admin');
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Connection error" };
        }
    };

    const logout = () => {
        // Call backend to invalidate session
        if (token) {
            fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            }).catch(console.error);
        }

        localStorage.removeItem('adminToken');
        setToken(null);
        setIsAuthenticated(false);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login, preserving intended destination
        navigate('/login', { replace: true, state: { from: location } });
        return null;
    }

    return children;
};
