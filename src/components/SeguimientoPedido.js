import React from 'react';
import { MapPin, Package, Truck, CheckCircle, Clock } from 'lucide-react';

const SeguimientoPedido = ({ pedido }) => {
  // Definimos las etapas del pedido
  const etapas = [
    { id: 'proceso', label: 'Preparando', icon: <Package size={20} /> },
    { id: 'camino', label: 'En camino', icon: <Truck size={20} /> },
    { id: 'completado', label: 'Entregado', icon: <CheckCircle size={20} /> }
  ];

  const getIndex = (estado) => etapas.findIndex(e => e.id === estado);
  const pasoActual = getIndex(pedido.estado);

  return (
    <div style={card}>
      <div style={header}>
        <div style={statusBadge}>{pedido.estado.toUpperCase()}</div>
        <span style={date}>
          Pedido el {new Date(pedido.createdAt).toLocaleDateString()} a las {new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div style={stepper}>
        {/* Línea de fondo del stepper */}
        <div style={lineBackground} />
        
        {etapas.map((etapa, index) => (
          <div key={etapa.id} style={stepWrapper}>
            <div style={index <= pasoActual ? circleActive : circleInactive}>
              {etapa.icon}
            </div>
            <span style={index <= pasoActual ? labelActive : labelInactive}>{etapa.label}</span>
          </div>
        ))}
      </div>

      <div style={details}>
        <div style={row}>
          <MapPin size={16} color="#e67e22" /> 
          <span style={{fontWeight: '600'}}>{pedido.local?.nombre || 'Local'}</span>
        </div>
        <div style={row}>
          <Clock size={16} color="#94a3b8" /> 
          <span>Llegada estimada: 15-20 min</span>
        </div>
      </div>
      
      <div style={itemsList}>
        <p style={{margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '0.8rem'}}>RESUMEN DEL PEDIDO:</p>
        {pedido.items.map((item, idx) => (
          <div key={idx} style={itemRow}>
            <span>{item.cantidad}x {item.producto}</span>
            <span>${item.precio * item.cantidad}</span>
          </div>
        ))}
        <div style={totalMini}>
            <span>Total Pagado:</span>
            <span>${pedido.total}</span>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS ---
const card = { background: 'white', padding: '24px', borderRadius: '24px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const statusBadge = { background: '#fff3e0', color: '#e67e22', padding: '6px 14px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.5px' };
const date = { color: '#94a3b8', fontSize: '0.8rem' };
const stepper = { display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '30px' };
const lineBackground = { position: 'absolute', top: '20px', left: '15%', right: '15%', height: '2px', background: '#edf2f7', zIndex: 1 };
const stepWrapper = { display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 };
const circleActive = { width: '40px', height: '40px', borderRadius: '50%', background: '#e67e22', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(230, 126, 34, 0.3)' };
const circleInactive = { width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const labelActive = { fontSize: '0.75rem', marginTop: '10px', color: '#1e293b', fontWeight: 'bold' };
const labelInactive = { fontSize: '0.75rem', marginTop: '10px', color: '#94a3b8' };
const details = { borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '15px 0', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '15px' };
const row = { display: 'flex', alignItems: 'center', gap: '8px' };
const itemsList = { background: '#f8fafc', padding: '15px', borderRadius: '15px' };
const itemRow = { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '5px' };
const totalMini = { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#1e293b', fontWeight: 'bold', marginTop: '8px', paddingTop: '8px', borderTop: '1px dotted #cbd5e1' };

export default SeguimientoPedido;