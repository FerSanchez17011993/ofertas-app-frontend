import React, { useState, useEffect, useCallback } from 'react';
import { Truck, CheckCircle, Clock, User, MapPin, Package } from 'lucide-react';
import axios from 'axios';

const VistaPedidosVendedor = ({ localId }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = useCallback(async () => {
    if (!localId) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/pedidos/local/${localId}`);
      setPedidos(res.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [localId]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/pedidos/${id}/estado`, { 
        estado: nuevoEstado 
      });
      
      if (res.status === 200) {
        setPedidos(prevPedidos => 
          prevPedidos.map(p => p._id === id ? { ...p, estado: nuevoEstado } : p)
        );
      }
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  };

  if (loading) return <p style={{ color: '#64748b', padding: '20px' }}>Cargando pedidos de la nube...</p>;
  
  if (pedidos.length === 0) return (
    <div style={emptyState}>
      <Clock size={40} color="#cbd5e1" />
      <p>No tienes pedidos pendientes.</p>
    </div>
  );

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={sectionHeader}>
        <h3 style={{ color: '#1e293b', margin: 0 }}>Gestión de Pedidos</h3>
        <span style={badgeCount}>{pedidos.filter(p => p.estado !== 'completado').length} Pendientes</span>
      </div>

      {pedidos.map(p => (
        <div key={p._id} style={cardPedido}>
          <div style={customerInfo}>
            <div style={userRow}>
              <User size={16} color="#e67e22" />
              <span style={userName}>{p.cliente?.nombre || 'Cliente Anónimo'}</span>
            </div>
            <div style={userRow}>
              <MapPin size={14} color="#94a3b8" />
              <span style={addressText}>{p.puntoEntrega?.direccion || 'Retira en local'}</span>
            </div>
          </div>

          <div style={itemsSection}>
            {p.items.map((item, idx) => (
              <div key={idx} style={itemLine}>
                <Package size={12} color="#94a3b8" />
                <span>{item.cantidad}x {item.producto}</span>
              </div>
            ))}
          </div>

          <div style={actionsSection}>
            <div style={priceContainer}>
              <span style={totalLabel}>Total</span>
              <span style={totalAmount}>${p.total}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {p.estado === 'proceso' && (
                <button onClick={() => cambiarEstado(p._id, 'camino')} style={btnCamino}>
                  <Truck size={16}/> Despachar
                </button>
              )}
              {p.estado === 'camino' && (
                <button onClick={() => cambiarEstado(p._id, 'completado')} style={btnOk}>
                  <CheckCircle size={16}/> Entregado
                </button>
              )}
              {p.estado === 'completado' && (
                <span style={completadoTag}><CheckCircle size={16}/> Completado</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- ESTILOS ---
const sectionHeader = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' };
const badgeCount = { background: '#ffedd5', color: '#e67e22', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' };
const cardPedido = { background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '15px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const customerInfo = { borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' };
const userRow = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' };
const userName = { fontWeight: 'bold', color: '#1e293b', fontSize: '1rem' };
const addressText = { color: '#64748b', fontSize: '0.85rem' };
const itemsSection = { marginBottom: '15px' };
const itemLine = { display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '0.9rem', marginBottom: '5px' };
const actionsSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' };
const priceContainer = { display: 'flex', flexDirection: 'column' };
const totalLabel = { fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' };
const totalAmount = { fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' };
const btnCamino = { background: '#e67e22', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
const btnOk = { background: '#22c55e', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
const completadoTag = { color: '#22c55e', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' };
const emptyState = { textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' };

export default VistaPedidosVendedor;