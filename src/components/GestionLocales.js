import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, Trash2, MapPin, BarChart3, PackagePlus, Loader2, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Country, State, City } from 'country-state-city';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] !== 0) {
            map.setView(center, 17);
        }
    }, [center, map]);
    return null;
};

const GestionLocales = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const sugerenciasRef = useRef(null);

    const [locales, setLocales] = useState([]);
    const [buscandoMapa, setBuscandoMapa] = useState(false);
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    
    const [paises] = useState(Country.getAllCountries());
    const [provincias, setProvincias] = useState([]);
    const [ciudades, setCiudades] = useState([]);

    const [calle, setCalle] = useState('');
    const [altura, setAltura] = useState('');

    const [nuevoLocal, setNuevoLocal] = useState({
        nombre: '',
        paisCode: '',
        paisNombre: '',
        provinciaCode: '',
        provinciaNombre: '',
        ciudad: '',
        lat: -26.8083,
        lng: -65.2176
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

    useEffect(() => {
        const handleClickFuera = (event) => {
            if (sugerenciasRef.current && !sugerenciasRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        };
        document.addEventListener("mousedown", handleClickFuera);
        return () => document.removeEventListener("mousedown", handleClickFuera);
    }, []);

    // 1. BUSCAR CALLES
    useEffect(() => {
        const buscarCalles = async () => {
            if (calle.length > 3 && nuevoLocal.ciudad) {
                setBuscandoMapa(true);
                const query = `${calle}, ${nuevoLocal.ciudad}, ${nuevoLocal.provinciaNombre}`;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=${nuevoLocal.paisCode?.toLowerCase()}`
                    );
                    const data = await response.json();
                    setSugerencias(data);
                    setMostrarSugerencias(true);
                } catch (error) {
                    console.error(error);
                } finally {
                    setBuscandoMapa(false);
                }
            }
        };
        const timer = setTimeout(buscarCalles, 500);
        return () => clearTimeout(timer);
    }, [calle, nuevoLocal.ciudad, nuevoLocal.provinciaNombre, nuevoLocal.paisCode]);

    // 2. REFINAR CON ALTURA (Lógica estricta por componentes)
    const refinarConAltura = useCallback(async () => {
        if (!calle || !altura || !nuevoLocal.ciudad) return;

        setBuscandoMapa(true);
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&street=${encodeURIComponent(calle + ' ' + altura)}&city=${encodeURIComponent(nuevoLocal.ciudad)}&state=${encodeURIComponent(nuevoLocal.provinciaNombre)}&country=${encodeURIComponent(nuevoLocal.paisNombre)}&limit=1`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data && data.length > 0) {
                setNuevoLocal(prev => ({
                    ...prev,
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                }));
            }
        } catch (error) {
            console.error("Error altura:", error);
        } finally {
            setBuscandoMapa(false);
        }
    }, [calle, altura, nuevoLocal.ciudad, nuevoLocal.provinciaNombre, nuevoLocal.paisNombre]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (altura.length > 0) refinarConAltura();
        }, 1200);
        return () => clearTimeout(timer);
    }, [altura, refinarConAltura]);

    useEffect(() => {
        if (nuevoLocal.paisCode) {
            setProvincias(State.getStatesOfCountry(nuevoLocal.paisCode));
        }
    }, [nuevoLocal.paisCode]);

    useEffect(() => {
        if (nuevoLocal.provinciaCode) {
            setCiudades(City.getCitiesOfState(nuevoLocal.paisCode, nuevoLocal.provinciaCode));
        }
    }, [nuevoLocal.provinciaCode, nuevoLocal.paisCode]);

    const seleccionarSugerencia = (sug) => {
        const nombreVia = sug.address.road || sug.display_name.split(',')[0];
        setCalle(nombreVia);
        setNuevoLocal(prev => ({
            ...prev,
            lat: parseFloat(sug.lat),
            lng: parseFloat(sug.lon)
        }));
        setMostrarSugerencias(false);
    };

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
            const payload = {
                nombre: nuevoLocal.nombre,
                pais: nuevoLocal.paisNombre,
                provincia: nuevoLocal.provinciaNombre,
                ciudad: nuevoLocal.ciudad,
                direccion: `${calle} ${altura}`.trim(),
                lat: nuevoLocal.lat,
                lng: nuevoLocal.lng,
                vendedorId: user.id || user._id
            };
            await api.crearLocal(payload);
            alert("¡Sucursal sincronizada en la nube!");
            setNuevoLocal({ ...nuevoLocal, nombre: '', lat: -26.8083, lng: -65.2176 });
            setCalle('');
            setAltura('');
            cargarLocales();
        } catch (error) {
            alert("Error al crear local");
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm("¿Eliminar sucursal?")) {
            await api.eliminarLocal(id);
            cargarLocales();
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>
                <Store color="#2563eb" size={32} /> Panel de Mis Sucursales
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '25px' }}>
                <form onSubmit={handleCrearLocal} style={formStyle}>
                    <div style={inputGroup}>
                        <label style={labelStyle}>Nombre del Comercio</label>
                        <input required placeholder="Ej: Mini Service Alem" value={nuevoLocal.nombre}
                            onChange={e => setNuevoLocal({...nuevoLocal, nombre: e.target.value})} style={inputStyle} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={inputGroup}>
                            <label style={labelStyle}>País</label>
                            <select required style={inputStyle} value={nuevoLocal.paisCode} onChange={(e) => {
                                const selected = paises.find(p => p.isoCode === e.target.value);
                                setNuevoLocal({...nuevoLocal, paisCode: e.target.value, paisNombre: selected.name});
                            }}>
                                <option value="">Seleccionar...</option>
                                {paises.map(p => <option key={p.isoCode} value={p.isoCode}>{p.name}</option>)}
                            </select>
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Provincia</label>
                            <select required style={inputStyle} value={nuevoLocal.provinciaCode} disabled={!provincias.length} onChange={(e) => {
                                const selected = provincias.find(s => s.isoCode === e.target.value);
                                setNuevoLocal({...nuevoLocal, provinciaCode: e.target.value, provinciaNombre: selected.name});
                            }}>
                                <option value="">Seleccionar...</option>
                                {provincias.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={inputGroup}>
                        <label style={labelStyle}>Ciudad</label>
                        <select required style={inputStyle} value={nuevoLocal.ciudad} disabled={!ciudades.length} onChange={(e) => setNuevoLocal({...nuevoLocal, ciudad: e.target.value})}>
                            <option value="">Seleccionar...</option>
                            {ciudades.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                        <div style={{...inputGroup, position: 'relative'}} ref={sugerenciasRef}>
                            <label style={labelStyle}>Calle</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input required placeholder="Escribe la calle..." value={calle}
                                    onChange={e => setCalle(e.target.value)} 
                                    onFocus={() => calle.length > 3 && setMostrarSugerencias(true)}
                                    style={{...inputStyle, paddingLeft: '35px'}} />
                                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                            </div>
                            {mostrarSugerencias && sugerencias.length > 0 && (
                                <div style={dropdownStyle}>
                                    {sugerencias.map((sug, i) => (
                                        <div key={i} onClick={() => seleccionarSugerencia(sug)} style={itemSugerenciaStyle}>
                                            <MapPin size={14} color="#64748b" />
                                            <span style={{fontSize: '0.8rem'}}>{sug.display_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={inputGroup}>
                            <label style={labelStyle}>Altura</label>
                            <input required type="text" placeholder="Núm" value={altura}
                                onChange={e => setAltura(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={buscandoMapa} style={btnCrear}>
                        {buscandoMapa ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />} Guardar Local
                    </button>
                </form>

                <div style={{ height: '480px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <MapContainer center={[nuevoLocal.lat, nuevoLocal.lng]} zoom={15} style={{ height: '100%' }}>
                        <ChangeView center={[nuevoLocal.lat, nuevoLocal.lng]} />
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                    </MapContainer>
                </div>
            </div>

            <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: '#64748b', fontSize: '1rem', marginBottom: '15px' }}>Mis Sucursales</h3>
                {locales.map(l => (
                    <div key={l._id} style={cardLocal}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={iconBox}><MapPin size={24} color="#2563eb" /></div>
                            <div>
                                <h4 style={{ margin: 0, color: '#1e293b' }}>{l.nombre}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>{l.direccion}, {l.ciudad}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => navigate(`/gestion-inventario/${l._id}`)} style={btnGestion}><PackagePlus size={18} /> Inventario</button>
                            <button onClick={() => navigate(`/graficos/${l._id}`)} style={btnGraficos}><BarChart3 size={18} /></button>
                            <button onClick={() => handleEliminar(l._id)} style={btnDelete}><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Estilos
const formStyle = { background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' };
const labelStyle = { fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b' };
const inputStyle = { padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '100%', boxSizing: 'border-box' };
const btnCrear = { width: '100%', padding: '14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' };
const dropdownStyle = { position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', maxHeight: '150px', overflowY: 'auto' };
const itemSugerenciaStyle = { padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9' };
const cardLocal = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '10px' };
const iconBox = { padding: '12px', background: '#eff6ff', borderRadius: '15px' };
const btnGestion = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' };
const btnGraficos = { padding: '10px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' };
const btnDelete = { padding: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '10px', cursor: 'pointer' };

export default GestionLocales;