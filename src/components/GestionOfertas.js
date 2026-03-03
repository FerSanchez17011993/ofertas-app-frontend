import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../services/api';
import * as XLSX from 'xlsx'; // Importamos la librería de Excel
import {
  Plus, Loader2, ImageIcon, Trash, ArrowLeft,
  Eye, X, ShoppingBasket, Edit2, Package, ShoppingBag, Tag, FileSpreadsheet
} from 'lucide-react';
import SubirImagenes from './SubirImagenes';

const API_URL = "https://ofertas-app-fullstack.onrender.com";
const CLOUD_NAME = "dwpgncjgn";

const GestionOfertas = () => {
  const { id: localId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Referencia para el input de archivo oculto

  const filaInicial = () => ({
    id: Math.random(),
    producto: '',
    marca: '', 
    contenido: '',
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
      console.error("Error al sincronizar:", e);
    }
  }, [localId]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const buscarMatch = useCallback((prod, marc = '', cant = '') => {
    if (!prod || prod.length < 2) return null;
    const getTokens = (t) => String(t).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 0);

    const palabrasUsuario = getTokens(`${prod} ${marc} ${cant}`);
    let mejorMatch = null;
    let maxCoincidencias = 0;

    galeria.forEach(foto => {
      const palabrasImagen = getTokens(foto.nombreReferencia.split('.')[0]);
      const coincidencias = palabrasUsuario.filter(pal => 
        palabrasImagen.some(palImg => palImg.includes(pal) || pal.includes(palImg))
      ).length;
      if (coincidencias > maxCoincidencias) {
        maxCoincidencias = coincidencias;
        mejorMatch = foto;
      }
    });
    return mejorMatch;
  }, [galeria]);

  // --- LÓGICA PARA CARGAR EXCEL ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Convertimos a JSON (header: 1 crea un array de arrays)
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Quitamos la primera fila si son encabezados
      const filasExcel = data.slice(1).filter(row => row.length > 0);

      const nuevasFilas = filasExcel.map(col => {
        const nombre = String(col[0] || '').trim();
        const marca = String(col[1] || '').trim();
        const cant = String(col[2] || '').trim();
        const match = buscarMatch(nombre, marca, cant);

        return {
          id: Math.random(),
          producto: nombre,
          marca: marca,
          contenido: cant,
          precioNuevo: String(col[3] || '').replace(/[^0-9.]/g, ''),
          precioViejo: String(col[4] || col[3] || '').replace(/[^0-9.]/g, ''),
          stock: String(col[5] || '0').replace(/[^0-9]/g, ''),
          categoria: String(col[6] || 'Almacén').trim(),
          fotoSugerida: match ? match.publicId : null
        };
      });

      if (nuevasFilas.length > 0) setFilas(nuevasFilas);
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset para poder cargar el mismo archivo
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData('text');
    if (pasteData.includes('\t') || pasteData.includes('\n')) {
      e.preventDefault();
      const lineas = pasteData.split(/\r?\n/).filter(l => l.trim() !== '');
      const nuevasFilas = lineas.map(line => {
        const columnas = line.split('\t');
        const nombre = columnas[0]?.trim() || '';
        const marca = columnas[1]?.trim() || '';
        const cant = columnas[2]?.trim() || '';
        const match = buscarMatch(nombre, marca, cant);
        
        return {
          id: Math.random(),
          producto: nombre,
          marca: marca,
          contenido: cant,
          precioNuevo: columnas[3]?.replace(/[^0-9.]/g, '') || '',
          precioViejo: columnas[4]?.replace(/[^0-9.]/g, '') || '',
          stock: columnas[5]?.replace(/[^0-9]/g, '') || '0',
          categoria: columnas[6]?.trim() || 'Almacén',
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
        if (['producto', 'marca', 'contenido'].includes(campo)) {
          const m = buscarMatch(act.producto, act.marca, act.contenido);
          act.fotoSugerida = m ? m.publicId : null;
        }
        return act;
      }
      return f;
    }));
  };

  const publicarTodo = async () => {
    const validas = filas.filter(f => f.producto && f.precioNuevo);
    if (validas.length === 0) return alert("No hay productos válidos.");
    setCargando(true);
    try {
      const productosParaEnviar = validas.map(f => ({
        producto: f.producto,
        marca: f.marca, 
        contenido: f.contenido,
        precioNuevo: parseFloat(f.precioNuevo),
        precioViejo: parseFloat(f.precioViejo || f.precioNuevo),
        stock: parseInt(f.stock || 0),
        categoria: f.categoria,
        publicId: f.fotoSugerida || 'placeholder_id',
        publicado: true
      }));
      await api.publicarLoteOfertas(localId, productosParaEnviar);
      setFilas([filaInicial()]);
      cargarDatos();
      alert("¡Inventario actualizado!");
    } catch (e) {
      alert("Error: " + e.message);
    } finally { setCargando(false); }
  };

  const renderFoto = (pid, size = "w_150,h_150") => {
    if (!pid || pid === 'placeholder_id') return <div style={thumbPlaceholder}><ImageIcon color="#cbd5e1" size={20}/></div>;
    const urlBase = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${pid}`;
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
              <ShoppingBag size={18} /> Historial Ventas
            </button>
            <button onClick={() => setMostrarGaleria(!mostrarGaleria)} style={btnVerGaleria}>
              <Eye size={18}/> {mostrarGaleria ? "Cerrar" : "Biblioteca"}
            </button>
            <SubirImagenes onFinished={cargarDatos} />
        </div>
      </div>

      {mostrarGaleria && (
        <div style={panelGaleria}>
            <div style={panelHeader}>
                <h3 style={{ margin: 0 }}>Imágenes Disponibles ({galeria.length})</h3>
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
        <p style={{color: '#64748b'}}>Orden Excel: Producto | Marca | Cantidad | $ Nuevo | $ Viejo | Stock | Categoría</p>
      </header>

      <section style={cardContainer}>
        <div style={cardHeader}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ color: '#e67e22', fontWeight: 'bold' }}>Carga de Productos</div>
            
            {/* INPUT DE EXCEL OCULTO */}
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
            />
            
            <button 
              onClick={() => fileInputRef.current.click()} 
              style={btnExcel}
            >
              <FileSpreadsheet size={16}/> Cargar Excel
            </button>
          </div>
          <button onClick={() => setFilas([...filas, filaInicial()])} style={btnAddRow}><Plus size={16}/> Fila</button>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHead}>
                <th style={thStyle}>Foto</th>
                <th style={thStyle}>Producto</th>
                <th style={thStyle}>Marca</th>
                <th style={thStyle}>Cant.</th>
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
                  <td style={tdStyle}><input style={inputTable} value={f.producto} onPaste={handlePaste} onChange={e => handleInputChange(f.id, 'producto', e.target.value)} placeholder="Ej: Arroz..."/></td>
                  <td style={tdStyle}><input style={inputTable} value={f.marca} onChange={e => handleInputChange(f.id, 'marca', e.target.value)} placeholder="Marca"/></td>
                  <td style={tdStyle}><input style={inputTable} value={f.contenido} onChange={e => handleInputChange(f.id, 'contenido', e.target.value)} placeholder="500g"/></td>
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
          <button onClick={publicarTodo} style={btnPublish} disabled={cargando}>
            {cargando ? <Loader2 className="spinner" size={20}/> : 'SINCRONIZAR TODO'}
          </button>
        </div>
      </section>

      <div>
        <div style={tandaHeader}>Productos en la Nube</div>
        <div style={gridStyle}>
          {publicados.map(p => (
            <div key={p._id} style={itemCard}>
              {editandoId === p._id ? (
                <div style={editForm}>
                  <input style={inputEdit} value={formEdit.producto} onChange={e => setFormEdit({...formEdit, producto: e.target.value})}/>
                  <input style={inputEdit} value={formEdit.marca} onChange={e => setFormEdit({...formEdit, marca: e.target.value})} placeholder="Marca"/>
                  <button onClick={() => { axios.put(`${API_URL}/api/ofertas/${p._id}`, formEdit).then(() => {setEditandoId(null); cargarDatos();}) }} style={btnSave}>Guardar</button>
                  <button onClick={() => setEditandoId(null)} style={btnCancel}>X</button>
                </div>
              ) : (
                <>
                  <div style={itemActions}>
                    <button onClick={() => { setEditandoId(p._id); setFormEdit(p); }} style={btnEdit}><Edit2 size={14}/></button>
                    <button onClick={async () => { if(window.confirm("¿Eliminar?")){ await api.eliminarOferta(p._id); cargarDatos(); }}} style={btnDel}><Trash size={14}/></button>
                  </div>
                  <div style={itemPreview}>{renderFoto(p.publicId, "w_200,h_200")}</div>
                  <h4 style={itemTitle}>{p.producto} {p.contenido}{p.unidad !== 'u' ? p.unidad : ''}</h4>
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <Tag size={12} color="#94a3b8" /> <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.marca || 'Genérico'}</span>
                  </div>
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

// ESTILOS ADICIONALES Y ACTUALIZADOS
const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' };
const navStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const btnBack = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#64748b', fontWeight:'600' };
const btnVerGaleria = { background: 'white', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display:'flex', gap:8, alignItems:'center', fontWeight:'500' };
const btnVentas = { background: '#4f46e5', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' };
const btnExcel = { background: '#107c41', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', display:'flex', gap:8, alignItems:'center', fontWeight:'600', fontSize:'0.85rem' };
const panelGaleria = { background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' };
const panelHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems:'center' };
const gridGaleria = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px', maxHeight: '250px', overflowY: 'auto' };
const thumbContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 };
const labelThumb = { fontSize: '0.6rem', color: '#64748b', textAlign: 'center' };
const titleStyle = { margin: 0, display: 'flex', alignItems: 'center', gap: 12, color: '#1e293b', fontSize: '1.6rem' };
const cardContainer = { background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '40px' };
const cardHeader = { padding: '15px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems:'center' };
const btnAddRow = { background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight:'600' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHead = { background: '#f8fafc' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' };
const trStyle = { borderBottom: '1px solid #f1f5f9' };
const tdStyle = { padding: '10px' };
const inputTable = { width: '100%', border: 'none', outline: 'none', padding: '5px', fontSize: '0.85rem' };
const inputNum = { width: '70px', padding: '5px', border: '1px solid #e2e8f0', borderRadius: '5px' };
const cardFooter = { padding: '15px', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' };
const btnPublish = { background: '#e67e22', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' };
const tandaHeader = { background: '#1e293b', color: 'white', padding: '6px 15px', borderRadius: '10px', marginBottom: '20px', display: 'inline-block', fontSize: '0.8rem' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' };
const itemCard = { background: 'white', padding: '15px', borderRadius: '20px', border: '1px solid #e2e8f0', position: 'relative' };
const itemActions = { position: 'absolute', top: 10, right: 10, display: 'flex', gap: 5 };
const btnEdit = { background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' };
const btnDel = { background: '#fee2e2', border: 'none', borderRadius: '8px', width: '30px', height: '30px', cursor: 'pointer' };
const itemPreview = { height: '120px', display: 'flex', justifyContent: 'center', alignItems:'center' };
const itemTitle = { margin: '10px 0', textAlign: 'center', fontSize: '1rem', color:'#1e293b', fontWeight:'700' };
const priceContainer = { display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center' };
const oldPrice = { textDecoration: 'line-through', color: '#cbd5e1', fontSize: '0.8rem' };
const newPrice = { color: '#e67e22', fontWeight: '900', fontSize: '1.3rem' };
const stockBadge = { textAlign:'center', fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '5px', borderRadius: '8px', marginTop:'10px' };
const thumbWrap = { width: 50, height: 50, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'contain' };
const thumbPlaceholder = { width: 50, height: 50, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems:'center', justifyContent:'center' };
const btnX = { border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer' };
const editForm = { display: 'flex', flexDirection: 'column', gap: 5 };
const inputEdit = { padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const btnSave = { background: '#22c55e', color: 'white', border: 'none', padding: '8px', borderRadius: '8px' };
const btnCancel = { background: '#f1f5f9', padding: '8px', borderRadius: '8px' };

export default GestionOfertas;