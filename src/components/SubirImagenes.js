import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Loader2 } from 'lucide-react';

// URL CORREGIDA PARA APUNTAR AL BACKEND EN RENDER
const API_URL = "https://ofertas-app-fullstack.onrender.com";
const CLOUD_NAME = "dwpgncjgn";
const UPLOAD_PRESET = "productos"; 

const SubirImagenes = ({ onFinished }) => {
    const [loading, setLoading] = useState(false);

    // Función para que el nombre sea compatible con Cloudinary y fácil de buscar
    const limpiarNombre = (nombre) => {
        return nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quita acentos
            .replace(/[^a-z0-9]/g, '-')      // Cambia todo lo raro por guiones
            .replace(/-+/g, '-')             // Quita guiones dobles
            .replace(/^-|-$/g, '');          // Quita guiones al inicio o final
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setLoading(true);
        try {
            for (const file of files) {
                const nombreLimpio = limpiarNombre(file.name.split('.')[0]);
                
                // 1. Subir a Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                formData.append('public_id', nombreLimpio); 

                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    formData
                );

                // 2. Guardar en la base de datos de MongoDB (vía Render)
                await axios.post(`${API_URL}/api/galeria`, {
                    nombreReferencia: nombreLimpio, 
                    publicId: res.data.public_id,
                    url: res.data.secure_url,
                    formato: res.data.format
                });
            }
            alert("¡Imágenes subidas y guardadas en la nube!");
            if (onFinished) onFinished();
        } catch (err) {
            console.error("Error al cargar:", err.response?.data || err.message);
            alert("Error al cargar. Verifica que el servidor en Render esté activo.");
        } finally {
            setLoading(false);
            // Limpiar el input para poder subir las mismas fotos si se desea
            if (e.target) e.target.value = null;
        }
    };

    return (
        <div>
            <input 
                type="file" 
                id="file-input" 
                multiple 
                onChange={handleUpload} 
                style={{ display: 'none' }} 
                accept="image/*" 
            />
            <label htmlFor="file-input" style={btnStyle}>
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Sincronizando...</span>
                    </>
                ) : (
                    <>
                        <Upload size={18} />
                        <span>Cargar Imágenes</span>
                    </>
                )}
            </label>
            <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const btnStyle = { 
    background: '#1e293b', 
    color: 'white', 
    padding: '10px 20px', 
    borderRadius: '12px', 
    fontWeight: 'bold', 
     Película: 'flex', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
};

export default SubirImagenes;