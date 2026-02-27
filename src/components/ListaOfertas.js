import React from 'react';
import { Box, Users, Trash2, Clock, AlertTriangle } from 'lucide-react';

const ListaOfertas = ({ ofertas, onDelete }) => {
  if (ofertas.length === 0) return <div style={emptyStateStyle}><p>No tienes ofertas activas en esta sucursal.</p></div>;

  return (
    <div style={gridStyle}>
      {ofertas.map((o) => (
        <div key={o.id} style={cardStyle}>
          <div style={imageWrapper}>
            <img src={o.imagen} alt={o.producto} style={imgStyle} />
            <div style={ahorroBadge}>-{Math.round(((o.precioViejo - o.precioNuevo) / o.precioViejo) * 100)}%</div>
          </div>

          <div style={{ padding: '15px' }}>
            <h3 style={productTitle}>{o.producto}</h3>
            
            <div style={priceContainer}>
              <span style={priceNew}>${o.precioNuevo}</span>
              <span style={priceOld}>${o.precioViejo}</span>
            </div>

            <div style={stockIndicator(o.stock <= 5)}>
              <Box size={14} />
              <span>Stock disponible: <strong>{o.stock} un.</strong></span>
            </div>

            <div style={divider} />

            <button onClick={() => onDelete(o.id)} style={btnDelete}>
              <Trash2 size={16} /> Finalizar Oferta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' };
const cardStyle = { background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const imageWrapper = { height: '140px', position: 'relative' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const ahorroBadge = { position: 'absolute', top: '10px', right: '10px', background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' };
const productTitle = { margin: '0 0 10px 0', fontSize: '1rem', color: '#1e293b', fontWeight: '700' };
const priceContainer = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' };
const priceNew = { fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' };
const priceOld = { fontSize: '0.9rem', textDecoration: 'line-through', color: '#94a3b8' };
const stockIndicator = (critico) => ({ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: critico ? '#e11d48' : '#64748b', marginBottom: '15px' });
const divider = { height: '1px', background: '#f1f5f9', margin: '12px 0' };
const btnDelete = { width: '100%', padding: '10px', background: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' };
const emptyStateStyle = { textAlign: 'center', padding: '60px', color: '#94a3b8', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' };

export default ListaOfertas;