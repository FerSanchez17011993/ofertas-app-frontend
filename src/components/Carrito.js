import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, Weight, Bike } from 'lucide-react';

// Función auxiliar para calcular distancia (Haversine)
const calcularDistanciaKm = (coords1, coords2) => {
    if (!coords1 || !coords2) return 0;
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const Carrito = ({ onCheckout, userCoords }) => {
    const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();

    // 1. Validar local único
    const localesEnCarrito = [...new Set(cart.map(item => item.local?.nombre || "Sucursal"))];
    const esLocalUnico = localesEnCarrito.length <= 1;

    // 2. Peso total
    const pesoTotal = cart.reduce((acc, item) => acc + ((item.peso || 1) * item.cantidad), 0);
    const excesoPeso = pesoTotal > 15;

    // 3. CÁLCULO DE ENVÍO
    const calcularEnvio = () => {
        if (!esLocalUnico || cart.length === 0 || !userCoords) return 800;
        
        const localCoords = cart[0].local?.location?.coordinates;
        if (!localCoords) return 800;

        const distanciaKm = calcularDistanciaKm(userCoords, { lat: localCoords[1], lng: localCoords[0] });
        const costoBase = 800;
        const distanciaMetros = distanciaKm * 1000;
        
        if (distanciaMetros > 500) {
            const metrosExcedentes = distanciaMetros - 500;
            const tramosExtra = Math.ceil(metrosExcedentes / 500);
            return costoBase + (tramosExtra * 500);
        }
        return costoBase;
    };

    const costoEnvio = calcularEnvio();
    const totalConEnvio = total + costoEnvio;

    if (cart.length === 0) {
        return (
            <div style={emptyCartStyle}>
                <ShoppingBag size={60} color="#cbd5e1" />
                <h3 style={{ color: '#64748b', marginTop: '20px' }}>Tu carrito está vacío</h3>
                <p style={{ color: '#94a3b8' }}>Agrega ofertas para comenzar</p>
            </div>
        );
    }

    return (
        <div style={cartContainer}>
            <div style={headerStyle}>
                <h2 style={{ margin: 0, color: '#1e293b' }}>Resumen de Compra</h2>
                <button onClick={clearCart} style={btnClear}>Vaciar Carrito</button>
            </div>

            {!esLocalUnico && (
                <div style={alertStyle}>
                    <AlertTriangle size={18} />
                    <span>Solo puedes pedir de un local a la vez.</span>
                </div>
            )}
            
            {excesoPeso && (
                <div style={alertStyle}>
                    <Weight size={18} />
                    <span>El peso total ({pesoTotal}kg) supera el límite de 15kg.</span>
                </div>
            )}

            <div style={tableWrapper}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={thRow}>
                            <th style={thStyle}>Producto</th>
                            <th style={thStyle}>Cant.</th>
                            <th style={thStyle}>Subtotal</th>
                            <th style={{...thStyle, textAlign: 'center'}}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item) => (
                            <tr key={item._id} style={trStyle}>
                                <td style={tdStyle}>
                                    <div style={prodName}>{item.producto}</div>
                                    <div style={localLabel}>{item.local?.nombre || 'Local'}</div>
                                </td>
                                <td style={tdStyle}>
                                    <div style={controls}>
                                        <button onClick={() => updateQuantity(item._id, item.cantidad - 1)} style={qtyBtn} disabled={item.cantidad <= 1}><Minus size={12} /></button>
                                        <span style={qtyNumber}>{item.cantidad}</span>
                                        <button onClick={() => item.cantidad < item.stock ? updateQuantity(item._id, item.cantidad + 1) : alert("Sin stock")} style={qtyBtn}><Plus size={12} /></button>
                                    </div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={priceTag}>${(item.precioNuevo * item.cantidad).toLocaleString()}</span>
                                </td>
                                <td style={{...tdStyle, textAlign: 'center'}}>
                                    <button onClick={() => removeFromCart(item._id)} style={btnDel}><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={summaryCard}>
                <div style={summaryRow}>
                    <span>Subtotal Productos:</span>
                    <span>${total.toLocaleString()}</span>
                </div>
                <div style={summaryRow}>
                    <span style={{display:'flex', alignItems:'center', gap:5}}><Bike size={14}/> Envío (Cadete):</span>
                    <span>${costoEnvio.toLocaleString()}</span>
                </div>
                <div style={summaryRow}>
                    <span>Peso estimado:</span>
                    <span style={{color: excesoPeso ? '#ff4d4d' : '#22c55e'}}>{pesoTotal} kg / 15 kg</span>
                </div>
                
                <div style={divider} />
                
                <div style={totalRow}>
                    <span>Total Final</span>
                    <span>${totalConEnvio.toLocaleString()}</span>
                </div>

                <button 
                    onClick={() => onCheckout({ totalConEnvio, costoEnvio })}
                    disabled={!esLocalUnico || excesoPeso}
                    style={(!esLocalUnico || excesoPeso) ? btnDisabled : btnCheckout}
                >
                    {(!esLocalUnico || excesoPeso) ? 'Revisar restricciones' : 'Confirmar Pedido'} 
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const cartContainer = { padding: '20px', maxWidth: '650px', margin: '0 auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const btnClear = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' };
const alertStyle = { background: '#fff1f2', color: '#e11d48', padding: '12px', borderRadius: '12px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', border: '1px solid #fecdd3', fontWeight: 'bold' };
const tableWrapper = { background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '30px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '15px', fontSize: '0.9rem' };
const prodName = { fontWeight: 'bold', color: '#1e293b', textTransform: 'capitalize' };
const localLabel = { fontSize: '0.7rem', color: '#94a3b8' };
const priceTag = { fontWeight: '800', color: '#1e293b' };
const controls = { display: 'flex', alignItems: 'center', gap: '10px' };
const qtyBtn = { width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const qtyNumber = { fontWeight: 'bold', minWidth: '15px', textAlign: 'center' };
const btnDel = { color: '#ef4444', cursor: 'pointer', border: 'none', background: 'none', opacity: 0.6 };
const summaryCard = { background: '#1e293b', padding: '25px', borderRadius: '24px', color: 'white', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', opacity: 0.8 };
const divider = { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '900', marginBottom: '25px' };
const btnCheckout = { width: '100%', padding: '18px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', transition: '0.2s' };
const btnDisabled = { ...btnCheckout, background: '#334155', cursor: 'not-allowed', opacity: 0.5 };
const emptyCartStyle = { textAlign: 'center', padding: '100px 20px', color: '#94a3b8' };

export default Carrito;