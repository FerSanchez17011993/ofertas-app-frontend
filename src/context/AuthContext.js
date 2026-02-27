import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedSession = localStorage.getItem('user-session');
        if (savedSession) {
            try {
                const parsed = JSON.parse(savedSession);
                console.log("AUTH_DEBUG: Cargando desde Storage:", parsed);
                setSession(parsed);
            } catch (e) {
                localStorage.removeItem('user-session');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Recibe { token, user: { rol, ... } }
        console.log("AUTH_DEBUG: Recibiendo login:", userData);
        setSession(userData);
        localStorage.setItem('user-session', JSON.stringify(userData));
    };

    const logout = () => {
        setSession(null);
        localStorage.removeItem('user-session');
        localStorage.removeItem('active-cart');
        window.location.href = '/login';
    };

    // EXTRACCIÓN CRÍTICA: 
    // Si session tiene .user, usamos eso. Si no, pero existe session, vemos si el rol está ahí.
    const currentUser = session?.user ? session.user : (session?.rol ? session : null);

    return (
        <AuthContext.Provider value={{ 
            user: currentUser, 
            token: session?.token, 
            isAuthenticated: !!session,
            login, 
            logout,
            loading 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);