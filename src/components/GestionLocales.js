import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, Trash2, MapPin, BarChart3, PackagePlus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const GestionLocales = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [locales, setLocales] = useState([]);
    const [nuevoLocal, setNuevoLocal] = useState({
        nombre: '', direccion: '', ciudad: '', lat: -26.8083, lng: -65.2176
    });

    const cargarLocales = useCallback(async () => {
        try {
            const idVendedor = user?.id || user?._id;
            if (idVendedor) {
                const data = await api.getLocalesVendedor(idVendedor);
                setLocales(data);
            }
        } catch (error) {
            console.error("Error cargando locales:", error);
        }
    }, [user]);

    useEffect(() => { cargarLocales(); }, [cargarLocales]);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setNuevoLocal(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
            },
        });
        return <Marker position={[nuevoLocal.lat, nuevoLocal.lng]} />;
    };

    const handleCrearLocal = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...nuevoLocal, vendedorId: user.id || user._id };
            await api.crearLocal(payload);
            alert("¡Sucursal sincronizada en la nube!");
            setNuevoLocal({ nombre: '', direccion: '', ciudad: '', lat: -26.8083, lng: -65.2176 });
            cargarLocales();
        } catch (error) {
            alert("Error al crear local");
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar sucursal e inventario asociado?")) {
            await api.eliminarLocal(id);
            cargarLocales();
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontSize: '1.8rem' }}>
                <Store color="#2563eb" size={32} /> Panel de Mis Sucursales
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '25px' }}>
                <form onSubmit={handleCrearLocal} style={formStyle}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Registrar Nueva Ubicación</h3>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Nombre del Comercio</label>
                        <input required placeholder="Ej: Mini Service Alem" value={nuevoLocal.nombre}
                            onChange={e => setNuevoLocal({...nuevoLocal, nombre: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Dirección y Altura</label>
                        <input required placeholder="Ej: Av. Alem 230" value={nuevoLocal.direccion}
                            onChange={e => setNuevoLocal({...nuevoLocal, direccion: e.target.value})} style={inputStyle} />
                    </div>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>📍 Ubicación seleccionada:</p>
                        <code style={{ fontSize: '0.8rem', color: '#2563eb' }}>{nuevoLocal.lat.toFixed(4)}, {nuevoLocal.lng.toFixed(4)}</code>
                    </div>
                    <button type="submit" style={btnCrear}><Plus size={20} /> Guardar en la Nube</button>
                </form>

                <div style={{ height: '400px', borderRadius: '24px', overflow: 'hidden', border: '4px solid white', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <MapContainer center={[nuevoLocal.lat, nuevoLocal.lng]} zoom={14} style={{ height: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                    </MapContainer>
                </div>
            </div>

            <div style={listaLocales}>
                <h3 style={{ color: '#64748b', fontSize: '1rem', marginBottom: '10px' }}>Tus Sucursales Activas</h3>
                {locales.map(l => (
                    <div key={l._id} style={cardLocal}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={iconBox}><MapPin size={24} color="#2563eb" /></div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{l.nombre}</h4>
                                <p style={subText}>{l.direccion} • ID: {l._id.substring(18)}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => navigate(`/gestion-inventario/${l._id}`)} style={btnGestion}>
                                <PackagePlus size={18} /> Cargar Productos
                            </button>
                            <button onClick={() => navigate(`/graficos/${l._id}`)} style={btnGraficos}>
                                <BarChart3 size={18} /> Reportes
                            </button>
                            <button onClick={() => handleEliminar(l._id)} style={btnDelete}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ESTILOS
const formStyle = { background: 'white', padding: '25px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px' };
const labelStyle = { fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginLeft: '5px' };
const inputStyle = { padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' };
const btnCrear = { width: '100%', padding: '14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' };
const listaLocales = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px' };
const cardLocal = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const iconBox = { padding: '12px', background: '#eff6ff', borderRadius: '15px' };
const subText = { fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' };
const btnGestion = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const btnGraficos = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const btnDelete = { padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer' };

export default GestionLocales;