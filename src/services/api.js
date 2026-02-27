const API_URL = "https://ofertas-app-fullstack.onrender.com/api";

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

    eliminarLocal: async (id) => {
        const res = await fetch(`${API_URL}/locales/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await res.json();
    },

    // --- OFERTAS ---
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
        const res = await fetch(`${API_URL}/ofertas/local/${localId}`, {
            headers: { 'Content-Type': 'application/json' }
        });
        return await res.json();
    },

    eliminarOferta: async (id) => {
        const res = await fetch(`${API_URL}/ofertas/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await res.json();
    },

    getTodasLasOfertas: async () => {
        const res = await fetch(`${API_URL}/ofertas`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return await res.json();
    },

    // --- PEDIDOS ---
    crearPedido: async (pedidoData) => {
        const res = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(pedidoData)
        });
        return await res.json();
    },

    getPedidosCliente: async (clienteId) => {
        const res = await fetch(`${API_URL}/pedidos/cliente/${clienteId}`, {
            headers: getAuthHeaders()
        });
        return await res.json();
    },

    getPedidosVendedor: async (vendedorId) => {
        const res = await fetch(`${API_URL}/pedidos/vendedor/${vendedorId}`, {
            headers: getAuthHeaders()
        });
        return await res.json();
    },

    actualizarEstadoPedido: async (pedidoId, nuevoEstado) => {
        const res = await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ estado: nuevoEstado })
        });
        return await res.json();
    }
};