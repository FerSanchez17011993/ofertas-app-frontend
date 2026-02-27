import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Loader2, Bike, Store, XCircle, Package } from 'lucide-react';

const MisPedidosCliente = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progresoEnvio, setProgresoEnvio] = useState({}); 
  const { user } = useAuth();
  
  // Ref para evitar que se dispare la actualización a la DB múltiples veces
  const pedidosFinalizadosRef = useRef(new Set());

  const fetchPedidos = useCallback(async () => {
    try {
      const clienteId = user?.id || user?._id;
      if (!clienteId) return;
      const data = await api.getPedidosCliente(clienteId);
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchPedidos();
  }, [user, fetchPedidos]);

  // Lógica de simulación de envío y guardado automático en DB
  useEffect(() => {
    const intervals = [];
    
    pedidos.forEach(pedido => {
      const estado = pedido.estado?.toLowerCase();
      
      // Solo animamos si el estado es 'camino'
      if (estado === 'camino') {
        const interval = setInterval(async () => {
          setProgresoEnvio(prev => {
            const actual = prev[pedido._id] || 0;
            
            if (actual >= 100) {
              clearInterval(interval);
              
              // Verificamos si ya enviamos la señal de completado para este pedido
              if (!pedidosFinalizadosRef.current.has(pedido._id)) {
                pedidosFinalizadosRef.current.add(pedido._id);
                
                // LLAMADA CORREGIDA: Usamos la función que SÍ existe en api.js
                api.actualizarEstadoPedido(pedido._id, 'completado')
                  .then(() => console.log(`Pedido ${pedido._id} marcado como entregado.`))
                  .catch(err => console.error("Error al actualizar estado:", err));
              }
              return { ...prev, [pedido._id]: 100 };
            }
            return { ...prev, [pedido._id]: actual + 1 };
          });
        }, 300); // 30 segundos total aprox.
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(id => clearInterval(id));
  }, [pedidos]);

  const handleCancelar = async (pedidoId) => {
    if (!window.confirm("¿Deseas cancelar este pedido?")) return;
    try {
      await api.cancelarPedido(pedidoId);
      fetchPedidos(); 
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div style={msgContainer}><Loader2 className="animate-spin" color="#3182ce" size={40} /></div>;

  return (
    <div style={container}>
      <h2 style={title}>Seguimiento en Vivo</h2>

      <div style={listContainer}>
        {pedidos.length === 0 ? (
          <div style={emptyState}>
            <Package size={48} color="#cbd5e1" />
            <p>No tienes pedidos activos actualmente.</p>
          </div>
        ) : (
          pedidos.map((pedido) => {
            const estado = pedido.estado?.toLowerCase();
            const p = estado === 'completado' ? 100 : (progresoEnvio[pedido._id] || 0);
            const entregado = p >= 100 || estado === 'completado';

            return (
              <div key={pedido._id} style={orderCard}>
                <div style={orderHeader}>
                  <span style={dateText}>ID: {pedido._id?.slice(-6).toUpperCase()}</span>
                  <span style={{...statusText, color: entregado ? '#10b981' : '#3b82f6'}}>
                    {entregado ? 'ENTREGADO' : 'EN REPARTO'}
                  </span>
                </div>

                <div style={stepperWrapper}>
                  <div style={stepperBackground}>
                    <div style={{ ...stepperFill, width: `${p}%`, backgroundColor: entregado ? '#10b981' : '#3b82f6' }} />
                  </div>
                  
                  <div style={nodesContainer}>
                    <div style={nodeGroup}>
                        <Store size={16} color={p >= 0 ? '#3b82f6' : '#cbd5e1'}/>
                        <span style={nodeLabel}>Local</span>
                    </div>
                    <div style={nodeGroup}>
                        <Bike size={16} color={p >= 50 ? '#3b82f6' : '#cbd5e1'}/>
                        <span style={nodeLabel}>Viaje</span>
                    </div>
                    <div style={nodeGroup}>
                        <CheckCircle size={16} color={entregado ? '#10b981' : '#cbd5e1'}/>
                        <span style={nodeLabel}>Destino</span>
                    </div>
                  </div>
                </div>

                <div style={bodyCard}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h4 style={localName}>{pedido.local?.nombre || 'Tienda'}</h4>
                    <span style={price}>${pedido.total?.toLocaleString()}</span>
                  </div>

                  {estado === 'camino' && p < 15 && (
                    <button onClick={() => handleCancelar(pedido._id)} style={cancelButton}>
                      <XCircle size={14} /> Cancelar Pedido
                    </button>
                  )}
                  
                  {entregado && (
                    <div style={successBox}>¡Tu pedido ha llegado con éxito!</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- ESTILOS ---
const container = { padding: '20px', maxWidth: '480px', margin: '0 auto', minHeight: '100vh' };
const title = { fontWeight: '900', marginBottom: '25px', color: '#1e293b', fontSize: '1.4rem' };
const listContainer = { display: 'flex', flexDirection: 'column', gap: '20px' };
const orderCard = { background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const orderHeader = { padding: '12px 20px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc' };
const dateText = { fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' };
const statusText = { fontSize: '0.7rem', fontWeight: '900' };
const stepperWrapper = { padding: '40px 30px', position: 'relative' };
const stepperBackground = { height: '4px', background: '#f1f5f9', borderRadius: '10px' };
const stepperFill = { height: '100%', borderRadius: '10px', transition: 'width 0.4s linear' };
const nodesContainer = { position: 'absolute', top: '34px', left: '30px', right: '30px', display: 'flex', justifyContent: 'space-between' };
const nodeGroup = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' };
const nodeLabel = { fontSize: '0.6rem', fontWeight: 'bold', color: '#94a3b8' };
const bodyCard = { padding: '15px 20px' };
const localName = { margin: 0, fontSize: '1rem', fontWeight: '700' };
const price = { fontWeight: '800', color: '#1e293b' };
const cancelButton = { marginTop: '15px', width: '100%', padding: '10px', border: 'none', background: '#fff1f2', color: '#e11d48', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' };
const successBox = { marginTop: '12px', textAlign: 'center', color: '#059669', fontSize: '0.8rem', fontWeight: '700', padding: '8px', background: '#f0fdf4', borderRadius: '8px' };
const msgContainer = { textAlign: 'center', padding: '100px' };
const emptyState = { textAlign: 'center', padding: '60px 20px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' };

export default MisPedidosCliente;