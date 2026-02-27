import React, { useState, useEffect } from 'react';
import { Radar, BellRing, MapPin } from 'lucide-react';
import { revisarOfertasCercanas } from '../utils/radarService';

const RadarOfertas = ({ ofertas, favoritos }) => {
  const [userPos, setUserPos] = useState(null);
  const [cercanas, setCercanas] = useState([]);
  const [radarActivo, setRadarActivo] = useState(false);

  useEffect(() => {
    if (!radarActivo) return;

    // Monitorea la posición del usuario en tiempo real
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });

        const encontradas = revisarOfertasCercanas(latitude, longitude, ofertas, favoritos);
        setCercanas(encontradas);
        
        // Simulación de notificación push
        if (encontradas.length > 0) {
          console.log("¡NOTIFICACIÓN!: Ofertas detectadas a la redonda");
        }
      },
      (err) => console.error("Error GPS:", err),
      { enableHighAccuracy: true, distanceFilter: 10 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [radarActivo, ofertas, favoritos]);

  return (
    <div style={radarContainer(radarActivo)}>
      <div style={headerStyle}>
        <div style={pulseIcon(radarActivo)}>
          <Radar size={20} color={radarActivo ? "#fff" : "#64748b"} />
        </div>
        <div style={{flex: 1}}>
          <h4 style={{margin: 0, fontSize: '0.9rem'}}>Radar de Ahorro Inteligente</h4>
          <p style={{margin: 0, fontSize: '0.7rem', color: radarActivo ? '#eee' : '#94a3b8'}}>
            {radarActivo ? 'Escaneando ofertas a 500m...' : 'El radar está apagado'}
          </p>
        </div>
        <button 
          onClick={() => setRadarActivo(!radarActivo)} 
          style={btnToggle(radarActivo)}
        >
          {radarActivo ? 'DESACTIVAR' : 'ACTIVAR'}
        </button>
      </div>

      {radarActivo && cercanas.length > 0 && (
        <div style={notifList}>
          {cercanas.map(o => (
            <div key={o.id} style={notifItem}>
              <BellRing size={16} color="#e67e22" />
              <div style={{flex: 1}}>
                <div style={{fontWeight: 'bold', fontSize: '0.8rem'}}>¡Oferta a la vuelta!</div>
                <div style={{fontSize: '0.75rem'}}>{o.producto} a ${o.precioNuevo} en <strong>{o.nombreLocal}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Estilos
const radarContainer = (activo) => ({
  background: activo ? '#1e293b' : '#f8fafc',
  color: activo ? 'white' : '#1e293b',
  padding: '15px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  marginBottom: '20px',
  transition: 'all 0.3s ease'
});

const headerStyle = { display: 'flex', alignItems: 'center', gap: '12px' };

const pulseIcon = (activo) => ({
  width: '40px',
  height: '40px',
  background: activo ? '#e67e22' : '#e2e8f0',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: activo ? 'pulse 2s infinite' : 'none'
});

const btnToggle = (activo) => ({
  background: activo ? '#ef4444' : '#e67e22',
  color: 'white',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '10px',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  cursor: 'pointer'
});

const notifList = { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' };
const notifItem = { background: 'white', color: '#1e293b', padding: '10px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center', borderLeft: '4px solid #e67e22' };

export default RadarOfertas;