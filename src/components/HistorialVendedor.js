import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, DollarSign, Loader2, PackageCheck, History } from 'lucide-react';

const HistorialVendedor = () => {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const vendedorId = user?.id || user?._id;
                if (!vendedorId) return;
                const data = await api.getPedidosVendedor(vendedorId);
                setVentas(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar ventas:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchVentas();
    }, [user]);

    if (loading) return <div style={center}><Loader2 className="animate-spin" color="#3b82f6" /></div>;

    const totalIngresos = ventas.reduce((acc, v) => 
        v.estado !== 'cancelado' ? acc + v.total : acc, 0
    );

    return (
        <div style={container}>
            <header style={header}>
                <div>
                    <h2 style={title}>Historial de Ventas</h2>
                    <p style={subtitle}>Monitorea los productos vendidos y tus ingresos.</p>
                </div>
                <div style={statsCard}>
                    <DollarSign size={20} color="#10b981" />
                    <div>
                        <span style={statsLabel}>Ingresos Totales</span>
                        <div style={statsValue}>${totalIngresos.toLocaleString()}</div>
                    </div>
                </div>
            </header>

            <div style={list}>
                {ventas.length === 0 ? (
                    <div style={emptyState}>
                        <History size={48} color="#cbd5e1" />
                        <p>No hay registros de ventas todavía.</p>
                    </div>
                ) : (
                    ventas.map((venta) => (
                        <div key={venta._id} style={card}>
                            <div style={cardHeader}>
                                <div style={clientInfo}>
                                    <div style={avatar}><User size={16} /></div>
                                    <div>
                                        <div style={clientName}>{venta.cliente?.nombre || 'Cliente'}</div>
                                        <div style={orderId}>Pedido #{venta._id.slice(-6).toUpperCase()}</div>
                                    </div>
                                </div>
                                <div style={{
                                    ...statusBadge,
                                    backgroundColor: venta.estado === 'cancelado' ? '#fee2e2' : '#dcfce7',
                                    color: venta.estado === 'cancelado' ? '#b91c1c' : '#15803d'
                                }}>
                                    {venta.estado.toUpperCase()}
                                </div>
                            </div>

                            <div style={productsBox}>
                                {venta.items.map((item, idx) => (
                                    <div key={idx} style={productRow}>
                                        <div style={productMain}>
                                            <PackageCheck size={14} color="#94a3b8" />
                                            <span>{item.productoNombre}</span>
                                        </div>
                                        <div style={productDetails}>
                                            <span>{item.cantidad} x ${item.precio.toLocaleString()}</span>
                                            <span style={rowTotal}>${(item.cantidad * item.precio).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={cardFooter}>
                                <span style={date}>{new Date(venta.createdAt).toLocaleString()}</span>
                                <div style={finalTotal}>
                                    Total: <span>${venta.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- ESTILOS ---
const container = { padding: '20px', maxWidth: '700px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', gap: '20px' };
const title = { margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' };
const subtitle = { margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' };
const statsCard = { background: '#fff', padding: '15px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const statsLabel = { fontSize: '0.75rem', color: '#64748b', display: 'block' };
const statsValue = { fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' };
const list = { display: 'flex', flexDirection: 'column', gap: '16px' };
const card = { background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const clientInfo = { display: 'flex', alignItems: 'center', gap: '12px' };
const avatar = { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' };
const clientName = { fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' };
const orderId = { fontSize: '0.75rem', color: '#94a3b8' };
const statusBadge = { padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800' };
const productsBox = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '15px' };
const productRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.9rem' };
const productMain = { display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: '500' };
const productDetails = { display: 'flex', gap: '15px', color: '#64748b' };
const rowTotal = { fontWeight: '700', color: '#1e293b', minWidth: '60px', textAlign: 'right' };
const cardFooter = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' };
const date = { fontSize: '0.8rem', color: '#94a3b8' };
const finalTotal = { fontSize: '1rem', fontWeight: '500', color: '#64748b' };
const emptyState = { textAlign: 'center', padding: '100px 20px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' };
const center = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' };

export default HistorialVendedor;