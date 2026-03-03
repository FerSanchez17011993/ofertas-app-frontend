import React, { useState, useEffect } from 'react';
import { ShoppingCart, MapPin, Store, Plus, Loader2, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const CLOUD_NAME = "dwpgncjgn"; 

const PanelCliente = () => {
    const [ofertasPorLocal, setOfertasPorLocal] = useState({});
    const [loading, setLoading] = useState(true);
    const [userCoords, setUserCoords] = useState(null);
    const { addToCart, count, total } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn("GPS desactivado"),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const data = await api.getTodasLasOfertas();
                const agrupado = data.reduce((acc, oferta) => {
                    const nombreLocal = oferta.local?.nombre || 'Sucursal';
                    if (!acc[nombreLocal]) acc[nombreLocal] = { info: oferta.local, productos: [] };
                    acc[nombreLocal].productos.push(oferta);
                    return acc;
                }, {});
                setOfertasPorLocal(agrupado);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const calcularDistanciaTexto = (info) => {
        if (!userCoords || !info?.location?.coordinates) return "---";
        const [lngLocal, latLocal] = info.location.coordinates;
        const R = 6371; 
        const dLat = (latLocal - userCoords.lat) * Math.PI / 180;
        const dLon = (lngLocal - userCoords.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(latLocal * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return d < 1 ? `${(d * 1000).toFixed(0)}m` : `${d.toFixed(1)}km`;
    };

    const construirUrlImagen = (publicId) => {
        if (!publicId || publicId === 'placeholder_id') return null;
        return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400,h_300,c_fill,f_auto,q_auto/${publicId}`;
    };

    if (loading) return <div style={centerState}><Loader2 size={40} color="#e67e22" className="animate-spin" /></div>;

    return (
        <div style={container}>
            <header style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>Radar de Ofertas</h1>
                    <div style={{display:'flex', alignItems:'center', gap:5, color:'#94a3b8', fontSize:'0.85rem'}}>
                        <MapPin size={14} color="#22c55e" /> Tafí Viejo, Tucumán
                    </div>
                </div>
                <div style={cartFloatingCard} onClick={() => navigate('/carrito')}>
                    <ShoppingCart color="#e67e22" size={20} />
                    <span style={{fontWeight: '900'}}>${total.toLocaleString()}</span>
                    <div style={badgeCount}>{count}</div>
                </div>
            </header>

            {Object.keys(ofertasPorLocal).length === 0 ? (
                <div style={{textAlign:'center', padding:'50px', color:'#64748b'}}>No hay ofertas disponibles.</div>
            ) : (
                Object.keys(ofertasPorLocal).map(nombre => (
                    <div key={nombre} style={localSection}>
                        <div style={localHeader}>
                            <div style={localIconBox}><Store size={22} color="white" /></div>
                            <div style={{flex: 1}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <h2 style={localTitle}>{nombre}</h2>
                                    <span style={distanciaBadge}><MapPin size={12} /> {calcularDistanciaTexto(ofertasPorLocal[nombre].info)}</span>
                                </div>
                                <p style={localSub}>{ofertasPorLocal[nombre].info?.direccion}</p>
                            </div>
                        </div>

                        <div style={scrollContainer}>
                            {ofertasPorLocal[nombre].productos.map(prod => (
                                <div key={prod._id} style={productCard}>
                                    <div style={imageBox}>
                                        {construirUrlImagen(prod.publicId) ? (
                                            <img src={construirUrlImagen(prod.publicId)} alt={prod.producto} style={imgStyle} />
                                        ) : (
                                            <ImageIcon size={30} color="#cbd5e1" />
                                        )}
                                        <div style={stockBadgeStyle(prod.stock)}>{prod.stock} disp.</div>
                                    </div>
                                    <div style={infoBox}>
                                        <div style={brandTag}>{prod.marca || 'Genérico'}</div>
                                        <h4 style={prodTitle}>{prod.producto}</h4>
                                        <div style={priceContainer}>
                                            <span style={newPrice}>${prod.precioNuevo}</span>
                                            <span style={oldPrice}>${prod.precioViejo}</span>
                                        </div>
                                        <button style={btnAdd} onClick={() => addToCart(prod)}>
                                            <Plus size={16}/> Agregar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const container = { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' };
const titleStyle = { fontSize: '2rem', fontWeight: '900', color: '#1e293b', margin: 0 };
const cartFloatingCard = { background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', position: 'relative' };
const badgeCount = { background: '#e67e22', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' };
const localSection = { marginBottom: '50px' };
const localHeader = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' };
const localIconBox = { background: '#1e293b', padding: '10px', borderRadius: '12px' };
const localTitle = { margin: 0, fontSize: '1.4rem', fontWeight: 'bold' };
const localSub = { margin: 0, fontSize: '0.85rem', color: '#94a3b8' };
const distanciaBadge = { background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, border:'1px solid #dcfce7' };
const scrollContainer = { display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' };
const productCard = { minWidth: '240px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };
const imageBox = { height: '160px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const stockBadgeStyle = (s) => ({ position: 'absolute', top: 12, right: 12, background: 'rgba(30, 41, 59, 0.8)', color: 'white', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', backdropFilter: 'blur(4px)' });
const infoBox = { padding: '20px' };
const brandTag = { fontSize: '0.65rem', color: '#e67e22', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', letterSpacing:'0.05em' };
const prodTitle = { margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: '700', color: '#334155' };
const priceContainer = { display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' };
const newPrice = { fontSize: '1.5rem', fontWeight: '900', color: '#1e293b' };
const oldPrice = { fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' };
const btnAdd = { width: '100%', background: '#f1f5f9', color: '#1e293b', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: 8 };
const centerState = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' };

export default PanelCliente;