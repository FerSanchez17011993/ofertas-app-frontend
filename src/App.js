import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './services/api'; 

// COMPONENTES
import Header from './components/Header';
import Login from './components/Login';
import Home from './components/Home';
import Registro from './components/Registro';
import GestionLocales from './components/GestionLocales'; 
import GestionOfertas from './components/GestionOfertas'; 
import PanelCliente from './components/PanelCliente'; 
import Carrito from './components/Carrito';
import MisPedidosCliente from './components/MisPedidosCliente';
// IMPORTAMOS EL NUEVO COMPONENTE
import HistorialVendedor from './components/HistorialVendedor'; 

const PrivateRoute = ({ children, roleRequired }) => {
    const { user, isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    const userRole = String(user?.rol || '').toLowerCase().trim();
    const required = roleRequired.toLowerCase().trim();

    if (roleRequired && userRole !== required) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const AppRoutes = () => {
    const { user, isAuthenticated } = useAuth();
    const { cart, total, clearCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = async (datosEnvio) => {
        try {
            if (cart.length === 0) return;
            
            const pedidoData = {
                cliente: user?.id || user?._id, 
                local: cart[0].local?._id || cart[0].local,
                items: cart.map(item => ({
                    productoId: item._id,
                    productoNombre: item.producto,
                    cantidad: item.cantidad,
                    precio: item.precioNuevo
                })),
                costoEnvio: datosEnvio?.costoEnvio || 800,
                total: datosEnvio?.totalConEnvio || (total + 800),
                puntoEntrega: {
                    direccion: "Entrega a domicilio",
                    lat: 0,
                    lng: 0
                }
            };

            await api.crearPedido(pedidoData); 
            alert("¡Pedido confirmado! El vendedor está preparando tu pedido.");
            clearCart();
            navigate('/mis-pedidos');
        } catch (error) {
            console.error("Error en el Checkout:", error);
            alert(`Error al procesar: ${error.message}`);
        }
    };

    return (
        <>
            <Header /> 
            <Routes>
                <Route path="/" element={
                    isAuthenticated ? (
                        user?.rol === 'vendedor' ? 
                        <Navigate to="/dashboard" replace /> : 
                        <Navigate to="/panel-cliente" replace />
                    ) : (
                        <Home isLoggedIn={false} />
                    )
                } />

                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
                <Route path="/registro" element={<Registro />} />

                {/* RUTAS VENDEDOR */}
                <Route path="/dashboard" element={
                    <PrivateRoute roleRequired="vendedor">
                        <GestionLocales /> 
                    </PrivateRoute>
                } />

                <Route path="/gestion-inventario/:id" element={
                    <PrivateRoute roleRequired="vendedor">
                        <GestionOfertas /> 
                    </PrivateRoute>
                } />

                {/* --- NUEVA RUTA: HISTORIAL DE VENTAS --- */}
                <Route path="/ventas" element={
                    <PrivateRoute roleRequired="vendedor">
                        <HistorialVendedor /> 
                    </PrivateRoute>
                } />

                {/* RUTAS CLIENTE */}
                <Route path="/panel-cliente" element={
                    <PrivateRoute roleRequired="cliente">
                        <PanelCliente />
                    </PrivateRoute>
                } />

                <Route path="/carrito" element={
                    <PrivateRoute roleRequired="cliente">
                        <Carrito onCheckout={handleCheckout} />
                    </PrivateRoute>
                } />

                <Route path="/mis-pedidos" element={
                    <PrivateRoute roleRequired="cliente">
                        <MisPedidosCliente />
                    </PrivateRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
                        <AppRoutes />
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;