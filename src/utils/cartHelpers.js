const API_URL = "https://ofertas-app-fullstack.onrender.com/api"; // Forzamos la URL de producción

const getAuthHeaders = () => {
    const savedUser = localStorage.getItem('user-session');
    if (savedUser) {
        try {
            const { token } = JSON.parse(savedUser);
            return {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
        } catch (e) {
            return { 'Content-Type': 'application/json' };
        }
    }
    return { 'Content-Type': 'application/json' };
};

export const api = {
    // --- AUTH ---
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email.trim().toLowerCase(), password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Error en el login");
        return data; 
    },

    registro: async (datos) => {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || "Error al registrar");
        return data;
    },

    // --- LOCALES ---
    getLocalesVendedor: async (vendedorId) => {
        const res = await fetch(`${API_URL}/locales/vendedor/${vendedorId}`, {
            headers: getAuthHeaders()
        });
        return await res.json();
    },

    crearLocal: async (data) => {
        const res = await fetch(`${API_URL}/locales`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data) 
        });
        return await res.json();
    },

    // --- OFERTAS Y PRODUCTOS ---
    publicarLoteOfertas: async (localId, productos) => {
        const res = await fetch(`${API_URL}/ofertas/bulk`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ localId, productos })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Error en carga masiva");
        return data;
    },

    getOfertasLocal: async (localId) => {
        const res = await fetch(`${API_URL}/ofertas/local/${localId}`);
        return await res.json();
    },

    eliminarOferta: async (id) => {
        const res = await fetch(`${API_URL}/ofertas/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await res.json();
    }
};