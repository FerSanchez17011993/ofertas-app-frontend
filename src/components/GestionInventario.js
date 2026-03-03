import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Loader2, FileSpreadsheet, Send, ArrowLeft, 
    ImageIcon, PlusCircle, ShoppingBag
} from 'lucide-react';
import { api } from '../services/api';

const GestionInventario = () => {
    const { id: localId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [vigencia, setVigencia] = useState({ inicio: '', fin: '' });
    
    const crearFilasVacias = (cant) => Array(cant).fill().map(() => ({
        producto: '', marca: '', precioNuevo: '', precioViejo: '', stock: '', categoria: 'Almacén'
    }));

    const [filas, setFilas] = useState(crearFilasVacias(15));

    const handleInputChange = (index, field, value) => {
        const nuevas = [...filas];
        nuevas[index][field] = value;
        setFilas(nuevas);
    };

    const handlePaste = (e, filaIndex, colIndex) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        const rows = pasteData.split(/\r\n|\n|\r/).filter(r => r.trim());
        const nuevasFilas = [...filas];

        rows.forEach((rowText, i) => {
            const targetFilaIndex = filaIndex + i;
            if (!nuevasFilas[targetFilaIndex]) {
                nuevasFilas[targetFilaIndex] = { producto: '', marca: '', precioNuevo: '', precioViejo: '', stock: '', categoria: 'Almacén' };
            }
            const cells = rowText.split('\t');
            const fieldNames = ['producto', 'marca', 'precioNuevo', 'precioViejo', 'stock', 'categoria'];
            cells.forEach((cellText, j) => {
                const targetColIndex = colIndex + j;
                const fieldName = fieldNames[targetColIndex];
                if (fieldName) nuevasFilas[targetFilaIndex][fieldName] = cellText.trim();
            });
        });
        setFilas(nuevasFilas);
    };

    const handlePublicarLote = async () => {
        const validos = filas.filter(f => f.producto && f.precioNuevo);
        if (validos.length === 0) return alert("Completa al menos un producto con precio.");
        if (!vigencia.inicio || !vigencia.fin) return alert("Define las fechas de oferta.");

        setLoading(true);
        try {
            const productosProcesados = validos.map(p => ({
                producto: p.producto,
                marca: p.marca,
                precioNuevo: Number(p.precioNuevo),
                precioViejo: Number(p.precioViejo) || Number(p.precioNuevo),
                stock: Number(p.stock) || 0,
                categoria: p.categoria,
                fechaInicioOferta: vigencia.inicio,
                fechaFinOferta: vigencia.fin,
                publicado: true
            }));

            await api.publicarLoteOfertas(localId, productosProcesados);
            alert("¡Éxito! Productos con marca publicados.");
            navigate('/dashboard');
        } catch (err) {
            alert("Error al publicar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={container}>
            <div style={topNav}>
                <button onClick={() => navigate('/dashboard')} style={btnBack}>
                    <ArrowLeft size={18}/> Volver
                </button>
                <div style={badgeLocal}>ID Local: {localId?.slice(-6).toUpperCase()}</div>
            </div>

            <div style={mainCard}>
                <div style={panelControl}>
                    <div style={brandSection}>
                        <FileSpreadsheet size={28} color="#107c41" />
                        <div>
                            <h2 style={panelTitle}>Carga Masiva</h2>
                            <p style={panelSubtitle}>Campos: Producto, Marca, P.Nuevo, P.Viejo, Stock y Categoría</p>
                        </div>
                    </div>

                    <div style={dateSection}>
                        <div style={dateGroup}>
                            <label style={labelDate}>Inicio</label>
                            <input type="date" style={dateInput} value={vigencia.inicio} onChange={e => setVigencia({...vigencia, inicio: e.target.value})} />
                        </div>
                        <div style={dateGroup}>
                            <label style={labelDate}>Fin</label>
                            <input type="date" style={dateInput} value={vigencia.fin} onChange={e => setVigencia({...vigencia, fin: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div style={toolbar}>
                    <div style={toolbarGroup}>
                        <button style={btnToolbarGray}><ImageIcon size={18} /> Ver Biblioteca</button>
                        <button style={btnToolbarGray}><PlusCircle size={18} /> Cargar Imágenes</button>
                        <button onClick={() => navigate('/ventas')} style={btnToolbarVentas}><ShoppingBag size={18} /> Historial Ventas</button>
                    </div>
                    <div style={infoText}>Podés copiar y pegar desde Excel respetando las columnas</div>
                </div>

                <div style={tableWrapper}>
                    <table style={table}>
                        <thead>
                            <tr style={thr}>
                                <th style={th}>PRODUCTO</th>
                                <th style={th}>MARCA</th>
                                <th style={th}>P. NUEVO</th>
                                <th style={th}>P. VIEJO</th>
                                <th style={th}>STOCK</th>
                                <th style={th}>CATEGORÍA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map((f, i) => (
                                <tr key={i} style={tr}>
                                    {['producto', 'marca', 'precioNuevo', 'precioViejo', 'stock', 'categoria'].map((field, j) => (
                                        <td key={j} style={td}>
                                            <input
                                                style={inputTable}
                                                value={f[field]}
                                                onChange={(e) => handleInputChange(i, field, e.target.value)}
                                                onPaste={(e) => handlePaste(e, i, j)}
                                                placeholder="..."
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <button onClick={handlePublicarLote} style={btnPub} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20}/>}
                PUBLICAR LOTE EN LA NUBE
            </button>
        </div>
    );
};

const container = { padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' };
const topNav = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const btnBack = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600', display:'flex', alignItems:'center', gap:5 };
const badgeLocal = { fontSize: '0.7rem', background: '#f1f5f9', padding: '5px 12px', borderRadius: '20px', color: '#64748b', fontWeight:'700' };
const mainCard = { background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' };
const panelControl = { padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' };
const brandSection = { display: 'flex', alignItems: 'center', gap: '15px' };
const panelTitle = { margin: 0, fontSize: '1.3rem', fontWeight: '800' };
const panelSubtitle = { margin: 0, fontSize: '0.8rem', color: '#94a3b8' };
const dateSection = { display: 'flex', gap: '15px' };
const dateGroup = { display: 'flex', flexDirection: 'column', gap: '4px' };
const labelDate = { fontSize: '0.65rem', fontWeight: 'bold', color: '#94a3b8' };
const dateInput = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' };
const toolbar = { padding: '15px 25px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' };
const toolbarGroup = { display: 'flex', gap: '10px' };
const btnToolbarGray = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight:'600' };
const btnToolbarVentas = { display: 'flex', alignItems: 'center', gap: '8px', background: '#4f46e5', border: 'none', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', color: 'white', fontWeight:'600' };
const infoText = { fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' };
const tableWrapper = { overflowX: 'auto' };
const table = { width: '100%', borderCollapse: 'collapse' };
const thr = { background: '#fff' };
const th = { padding: '15px', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' };
const tr = { borderBottom: '1px solid #f8fafc' };
const td = { padding: '0 10px' };
const inputTable = { width: '100%', border: 'none', padding: '12px 5px', outline: 'none', fontSize: '0.9rem', color: '#334155' };
const btnPub = { width: '100%', marginTop: '20px', padding: '18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' };

export default GestionInventario;