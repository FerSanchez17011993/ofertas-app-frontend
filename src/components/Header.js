import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, LayoutDashboard, UserPlus, Search, ShoppingCart, Package, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { totalItems } = useCart();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Normalización agresiva: buscamos rol en todas las variantes posibles
    const nombreReal = user?.nombre || user?.name || user?.user?.nombre || "Usuario";
    const userRole = String(user?.rol || user?.role || user?.tipo || '').toLowerCase().trim();
    
    const esVendedor = userRole === 'vendedor';
    const esCliente = userRole === 'cliente' || userRole === 'comprador' || (!esVendedor && isAuthenticated);

    useEffect(() => {
        if (location.pathname === '/' && !location.search) {
            setSearchTerm("");
        }
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(searchTerm.trim() ? `/?search=${searchTerm}` : '/');
    };

    const irAlPanel = (e) => {
        if (e) e.preventDefault();
        // Consola para debuguear en vivo (puedes quitarlo luego)
        console.log("Navegando con rol:", userRole);
        
        if (esVendedor) {
            navigate('/dashboard');
        } else {
            navigate('/panel-cliente');
        }
    };

    return (
        <header style={headerContainer}>
            <div style={logoSection} onClick={() => navigate('/')}>
                <span style={logoWhite}>OFERTAS</span>
                <span style={logoOrange}>APP</span>
            </div>

            {!esVendedor && (
                <form onSubmit={handleSearch} style={searchWrapper}>
                    <Search size={18} color="#94a3b8" />
                    <input 
                        type="text" 
                        placeholder="¿Qué buscás hoy?" 
                        style={searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            )}

            <nav style={navLinks}>
                {!isAuthenticated ? (
                    <div style={authGroup}>
                        <button onClick={() => navigate('/registro')} style={linkBtn}>
                            <UserPlus size={18} /> <span>Cuenta</span>
                        </button>
                        <button onClick={() => navigate('/login')} style={loginButton}>Ingresar</button>
                    </div>
                ) : (
                    <div style={userActionsWrapper}>
                        {esCliente && (
                            <div style={clientExtras}>
                                <button onClick={() => navigate('/mis-pedidos')} style={iconActionBtn}>
                                    <Package size={20} color="white" />
                                    <span style={iconLabel}>Pedidos</span>
                                </button>
                                <div style={cartIconStyle} onClick={() => navigate('/carrito')}>
                                    <ShoppingCart size={22} color="white" />
                                    {totalItems > 0 && <span style={cartBadge}>{totalItems}</span>}
                                </div>
                            </div>
                        )}

                        <div style={userInfo}>
                            <div style={userAvatar}><User size={16} color="white" /></div>
                            <div style={userTextDetails}>
                                <span style={userNameText}>{nombreReal}</span>
                                <span style={userRoleTag}>{esVendedor ? 'Vendedor' : 'Cliente'}</span>
                            </div>
                        </div>

                        <button onClick={irAlPanel} style={panelButton} type="button">
                            {esVendedor ? <Store size={20} /> : <LayoutDashboard size={20} />}
                            <span style={hideMobile}>Panel</span>
                        </button>
                        
                        <button onClick={logout} style={logoutBtn} type="button">
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </nav>
        </header>
    );
};

// --- ESTILOS MANTENIDOS ---
const headerContainer = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4%', background: '#1e293b', height: '75px', position: 'sticky', top: 0, zIndex: 9999, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', gap: '20px' };
const logoSection = { cursor: 'pointer', fontSize: '1.4rem', fontWeight: '800', display: 'flex' };
const logoWhite = { color: '#ffffff' };
const logoOrange = { color: '#e67e22', marginLeft: '4px' };
const searchWrapper = { flex: 1, maxWidth: '300px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '8px 15px', borderRadius: '12px', gap: '10px' };
const searchInput = { background: 'none', border: 'none', outline: 'none', color: 'white', width: '100%', fontSize: '0.9rem' };
const navLinks = { display: 'flex', alignItems: 'center' };
const authGroup = { display: 'flex', alignItems: 'center', gap: '15px' };
const userActionsWrapper = { display: 'flex', alignItems: 'center', gap: '15px' };
const clientExtras = { display: 'flex', alignItems: 'center', gap: '15px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '15px' };
const userInfo = { display: 'flex', alignItems: 'center', gap: '10px' };
const userAvatar = { background: '#334155', padding: '6px', borderRadius: '50%', display: 'flex' };
const userTextDetails = { display: 'flex', flexDirection: 'column' };
const userNameText = { color: 'white', fontSize: '0.85rem', fontWeight: 'bold' };
const userRoleTag = { color: '#e67e22', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' };
const panelButton = { background: '#e67e22', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
const logoutBtn = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' };
const cartIconStyle = { position: 'relative', cursor: 'pointer', display: 'flex' };
const cartBadge = { position: 'absolute', top: '-8px', right: '-8px', background: '#e67e22', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' };
const iconActionBtn = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const iconLabel = { color: 'white', fontSize: '0.6rem', marginTop: '2px' };
const linkBtn = { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const loginButton = { background: '#e67e22', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer' };
const hideMobile = { fontSize: '0.85rem' };

export default Header;