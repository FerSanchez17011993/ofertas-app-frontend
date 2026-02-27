import React, { useState, useEffect } from 'react';
import { Check, truck, XCircle } from 'lucide-react';

const GestionPedidosVendedor = ({ localId }) => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const res = await fetch(`http://localhost:5000/api/pedidos/local/${localId}`);
      if (res.ok) setPedidos(await res.json());
    };
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000); // Poll cada 10s
    return () => clearInterval(interval);
  }, [localId]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`http://localhost:5000/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setPedidos(pedidos.map(p => p._id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (e) { alert("Error al actualizar"); }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Pedidos Entrantes</h3>
      {pedidos.map(p => (
        <div key={p._id} style={pCard}>
          <div>
            <strong>Pedido #{p._id.slice(-4)}</strong>
            <p>{p.items.map(i => `${i.cantidad}x ${i.producto}`).join(', ')}</p>
            <small>Total: ${p.total}</small>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {p.estado === 'proceso' && (
              <button onClick={() => actualizarEstado(p._id, 'camino')} style={btnShip}><truck size={18}/> Enviar</button>
            )}
            {p.estado === 'camino' && (
              <button onClick={() => actualizarEstado(p._id, 'completado')} style={btnDone}><Check size={18}/> Entregado</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const pCard = { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'white', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0' };
const btnShip = { background: '#3182ce', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display:'flex', gap:'5px' };
const btnDone = { background: '#38a169', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display:'flex', gap:'5px' };

export default GestionPedidosVendedor;