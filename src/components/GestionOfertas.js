import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../services/api';
import {
  Plus, Loader2, ImageIcon, Trash, ArrowLeft,
  Eye, X, ShoppingBasket, Edit2, Package, ShoppingBag
} from 'lucide-react';
import SubirImagenes from './SubirImagenes';

const API_URL = "https://ofertas-app-fullstack.onrender.com";
const CLOUD_NAME = "dwpgncjgn";

const GestionOfertas = () => {
  const { id: localId } = useParams();
  const navigate = useNavigate();

  const filaInicial = () => ({
    id: Math.random(),
    producto: '',
    precioNuevo: '',
    precioViejo: '',
    stock: '',
    categoria: 'Almacén',
    fotoSugerida: null
  });
  
  const [filas, setFilas] = useState([filaInicial()]);
  const [publicados, setPublicados] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({});

  const cargarDatos = useCallback(async () => {
    try {
      const resGaleria = await axios.get(`${API_URL}/api/galeria`);
      const ofertasData = await api.getOfertasLocal(localId);
      
      setPublicados(Array.isArray(ofertasData) ? ofertasData : []);
      setGaleria(resGaleria.data || []);
    } catch (e) {
      console.error("Error al sincronizar con el servidor:", e);
    }
  }, [localId]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const vaciarBiblioteca = async () => {
    if (window.confirm("¿Borrar todos los registros de la biblioteca?")) {
      try {
        await axios.delete(`${API_URL}/api/galeria/all`);
        cargarDatos();
      } catch (e) { alert("Error al vaciar"); }
    }
  };

  const buscarMatch = useCallback((texto) => {
    if (!texto || texto.length < 3) return null;
    const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    const textoLimpio = norm(texto);
    return galeria.find(f => {
      const refLimpia = norm(f.nombreReferencia.split('.')[0]);
      return refLimpia.includes(textoLimpio) || textoLimpio.includes(refLimpia);
    });
  }, [galeria]);

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    if (pasteData.includes('\t') || pasteData.includes('\n')) {
      e.preventDefault();
      const lineas = pasteData.split(/\r?\n/).filter(l => l.trim() !== '');
      const nuevasFilas = lineas.map(line => {
        const columnas = line.split('\t');
        const nombre = columnas[0]?.trim() || '';
        const match = buscarMatch(nombre);
        return {
          id: Math.random(),
          producto: nombre,
          precioNuevo: columnas[1]?.replace(/[^0-9.]/g, '') || '',
          precioViejo: columnas[2]?.replace(/[^0-9.]/g, '') || '',
          stock: columnas[3]?.replace(/[^0-9]/g, '') || '0',
          categoria: columnas[4]?.trim() || 'Almacén',
          fotoSugerida: match ? match.publicId : null
        };
      });
      setFilas(nuevasFilas);
    }
  };

  const handleInputChange = (id, campo, valor) => {
    setFilas(filas.map(f => {
      if (f.id === id) {
        const act = { ...f, [campo]: valor };
        if (campo === 'producto') {
          const m = buscarMatch(valor);
          act.fotoSugerida = m ? m.publicId : null;
        }
        return act;
      }
      return f;
    }));
  };

  const guardarEdicion = async (id) => {
    try {
      await axios.put(`${API_URL}/api/ofertas/${id}`, formEdit);
      setEditandoId(null);
      cargarDatos();
    } catch (e) { alert("Error al actualizar"); }
  };

  const publicarTodo = async () => {
    const validas = filas.filter(f => f.producto && f.precioNuevo);
    if (validas.length === 0) return alert("No hay productos válidos.");
    
    setCargando(true);
    try {
      const productosParaEnviar = validas.map(f => ({
        producto: f.producto,
        precioNuevo: parseFloat(f.precioNuevo),
        precioViejo: parseFloat(f.precioViejo || 0),
        stock: parseInt(f.stock || 0),
        categoria: f.categoria,
        publicId: f.fotoSugerida || 'placeholder_id',
        publicado: true
      }));

      await api.publicarLoteOfertas(localId, productosParaEnviar);
      
      setFilas([filaInicial()]);
      cargarDatos();
      alert("¡Publicación exitosa!");
    } catch (e) {
      alert("Error al subir los productos: " + e.message);
    } finally { setCargando(false); }
  };

  const renderFoto = (pid, size = "w_150,h_150") => {
    if (!pid || pid === 'placeholder_id') return <div style={thumbPlaceholder}><ImageIcon color="#cbd5e1" size={20}/></div>;
    const fotoEnGaleria = galeria.find(g => g.publicId === pid);
    const urlBase = fotoEnGaleria?.url || `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${pid}`;
    const urlFinal = urlBase.replace('/upload/', `/upload/${size},c_fill,f_auto,q_auto/`);
    return (
      <div style={thumbWrap}>
        <img src={urlFinal} style={imgStyle} alt="Img" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'} />
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={navStyle}>
        <button onClick={() => navigate(-1)} style={btnBack}><ArrowLeft size={18}/> Volver</button>
        <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/ventas')} style={btnVentas}>
              <ShoppingBag size={18} /> Historial de Ventas
            </button>
            <button onClick={() => setMostrarGaleria(!mostrarGaleria)} style={btnVerGaleria}>
              <Eye size={18}/> {mostrarGaleria ? "Cerrar Biblioteca" : "Ver Biblioteca"}
            </button>
            <SubirImagenes onFinished={cargarDatos} />
        </div>
      </div>

      {mostrarGaleria && (
        <div style={panelGaleria}>
            <div style={panelHeader}>
                <h3 style={{ margin: 0 }}>Biblioteca de Imágenes ({galeria.length})</h3>
                <button onClick={vaciarBiblioteca} style={btnVaciar}><Trash size={14}/> Vaciar</button>
            </div>
            <div style={gridGaleria}>
                {galeria.map(foto => (
                    <div key={foto._id} style={thumbContainer}>
                        {renderFoto(foto.publicId, "w_100,h_100")}
                        <span style={labelThumb}>{foto.nombreReferencia}</span>
                    </div>
                ))}
            </div>
        </div>
      )}

      <header style={{ marginBottom: '30px' }}>
        <h1 style={titleStyle}><ShoppingBasket color="#e67e22" size={32}/> Gestión de Inventario</h1>
        <p style={{color: '#64748b'}}>Campos: Producto, Precio Nuevo, Precio Viejo, Stock y Categoría.</p>
      </header>

      <section style={cardContainer}>
        <div style={cardHeader}>
          <div style={{ color: '#e67e22', fontWeight: 'bold' }}>Carga de Productos</div>
          <button onClick={() => setFilas([...filas, filaInicial()])} style={btnAddRow}><Plus size={16}/> Nueva Fila</button>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHead}>
                <th style={thStyle}>Foto</th>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>$ Nuevo</th>
                <th style={thStyle}>$ Viejo</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Categoría</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filas.map(f => (
                <tr key={f.id} style={trStyle}>
                  <td style={tdStyle}>{renderFoto(f.fotoSugerida, "w_60,h_60")}</td>
                  <td style={tdStyle}><input style={inputTable} value={f.producto} onPaste={handlePaste} onChange={e => handleInputChange(f.id, 'producto', e.target.value)} placeholder="Pegar o escribir..."/></td>
                  <td style={tdStyle}><input style={inputNum} type="number" value={f.precioNuevo} onChange={e => handleInputChange(f.id, 'precioNuevo', e.target.value)}/></td>
                  <td style={tdStyle}><input style={inputNum} type="number" value={f.precioViejo} onChange={e => handleInputChange(f.id, 'precioViejo', e.target.value)}/></td>
                  <td style={tdStyle}><input style={inputNum} type="number" value={f.stock} onChange={e => handleInputChange(f.id, 'stock', e.target.value)}/></td>
                  <td style={tdStyle}><input style={inputTable} value={f.categoria} onChange={e => handleInputChange(f.id, 'categoria', e.target.value)}/></td>
                  <td style={tdStyle}><button onClick={() => setFilas(filas.filter(x => x.id !== f.id))} style={btnX}><X size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={cardFooter}>
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Los productos se publicarán sin fecha límite.
          </div>
          <button onClick={publicarTodo} style={btnPublish} disabled={cargando}>
            {cargando ? <Loader2 className="spinner" size={20}/> : 'PUBLICAR PRODUCTOS'}
          </button>
        </div>
      </section>

      <div style={{ marginBottom: '50px' }}>
        <div style={tandaHeader}>Productos en Inventario</div>
        <div style={gridStyle}>
          {publicados.map(p => (
            <div key={p._id} style={itemCard}>
              {editandoId === p._id ? (
                <div style={editForm}>
                  <input style={inputEdit} value={formEdit.producto} onChange={e => setFormEdit({...formEdit, producto: e.target.value})}/>
                  <div style={{display:'flex', gap:5}}>
                    <input style={inputEdit} type="number" value={formEdit.precioNuevo} onChange={e => setFormEdit({...formEdit, precioNuevo: e.target.value})}/>
                    <input style={inputEdit} type="number" value={formEdit.stock} onChange={e => setFormEdit({...formEdit, stock: e.target.value})}/>
                  </div>
                  <button onClick={() => guardarEdicion(p._id)} style={btnSave}>Guardar</button>
                  <button onClick={() => setEditandoId(null)} style={btnCancel}>Cancelar</button>
                </div>
              ) : (
                <>
                  <div style={itemActions}>
                    <button onClick={() => { setEditandoId(p._id); setFormEdit(p); }} style={btnEdit}><Edit2 size={14}/></button>
                    <button onClick={async () => { if(window.confirm("¿Eliminar?")){ await api.eliminarOferta(p._id); cargarDatos(); }}} style={btnDel}><Trash size={14}/></button>
                  </div>
                  <div style={itemPreview}>{renderFoto(p.publicId, "w_200,h_200")}</div>
                  <h4 style={itemTitle}>{p.producto}</h4>
                  <div style={priceContainer}>
                    <span style={oldPrice}>${p.precioViejo}</span>
                    <span style={newPrice}>${p.precioNuevo}</span>
                  </div>
                  <div style={stockBadge}><Package size={14}/> Stock: {p.stock}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ESTILOS (Sin cambios significativos, solo limpieza visual de fechas)
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const navStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const btnBack = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontWeight:'600' };
const btnVerGaleria = { background: 'white', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display:'flex', gap:8, alignItems:'center', fontWeight:'500' };
const btnVentas = { background: '#4f46e5', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };
const panelGaleria = { background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' };
const panelHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems:'center' };
const gridGaleria = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px', maxHeight: '300px', overflowY: 'auto', padding:'5px' };
const thumbContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 };
const labelThumb = { fontSize: '0.65rem', color: '#64748b', textAlign: 'center', width: '90px', overflow: 'hidden', textOverflow: 'ellipsis' };
const btnVaciar = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight:'600' };
const titleStyle = { margin: 0, display: 'flex', alignItems: 'center', gap: 12, color: '#1e293b', fontSize: '1.8rem' };
const cardContainer = { background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const cardHeader = { padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems:'center', background:'#fff' };
const btnAddRow = { background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display:'flex', alignItems:'center', gap:5, fontWeight:'600', color:'#475569' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHead = { background: '#f8fafc' };
const thStyle = { padding: '15px', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing:'0.05em' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '12px 15px' };
const inputTable = { width: '100%', border: 'none', outline: 'none', padding: '10px', background:'transparent', fontSize: '0.9rem' };
const inputNum = { width: '80px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline:'none' };
const cardFooter = { padding: '20px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', alignItems:'center', borderTop:'1px solid #e2e8f0' };
const btnPublish = { background: '#e67e22', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', boxShadow:'0 4px 12px rgba(230, 126, 34, 0.3)' };
const tandaHeader = { background: '#1e293b', color: 'white', padding: '8px 20px', borderRadius: '12px', marginBottom: '25px', display: 'inline-flex', alignItems:'center', fontSize: '0.9rem', fontWeight:'600', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '25px' };
const itemCard = { background: 'white', padding: '20px', borderRadius: '28px', border: '1px solid #e2e8f0', position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const itemActions = { position: 'absolute', top: 15, right: 15, display: 'flex', gap: 8 };
const btnEdit = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems:'center', justifyContent:'center', color:'#64748b' };
const btnDel = { background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems:'center', justifyContent:'center' };
const itemPreview = { height: '150px', display: 'flex', justifyContent: 'center', alignItems:'center', marginBottom: '15px' };
const itemTitle = { margin: '0 0 10px 0', textAlign: 'center', fontSize: '1.1rem', color:'#1e293b', fontWeight:'700' };
const priceContainer = { display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center', marginBottom: '18px' };
const oldPrice = { textDecoration: 'line-through', color: '#cbd5e1', fontSize: '0.95rem' };
const newPrice = { color: '#e67e22', fontWeight: '900', fontSize: '1.5rem' };
const stockBadge = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '8px', borderRadius: '12px', fontWeight:'600' };
const thumbWrap = { width: 55, height: 55, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: 'white' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'contain' };
const thumbPlaceholder = { width: 55, height: 55, background: '#f1f5f9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const btnX = { border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer' };
const editForm = { display: 'flex', flexDirection: 'column', gap: 10 };
const inputEdit = { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize:'0.9rem' };
const btnSave = { background: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight:'700' };
const btnCancel = { background: '#f1f5f9', color:'#64748b', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer' };

export default GestionOfertas;