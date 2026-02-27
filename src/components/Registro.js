import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCheck, ArrowRight, Loader2 } from 'lucide-react';

// URL CORREGIDA PARA EL CLOUD
const API_URL = "https://ofertas-app-fullstack.onrender.com";

const Registro = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'cliente'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      // Usamos la URL de Render en lugar de localhost
      const response = await fetch(`${API_URL}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Error en el registro");
      }

      alert("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
      navigate('/login');
    } catch (error) {
      alert(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', marginBottom: '8px' }}>Crear una cuenta</h2>
          <p style={{ color: '#64748b' }}>Únete a la comunidad de ofertas más grande</p>
        </div>

        <form onSubmit={handleRegistro}>
          <div style={inputGroup}>
            <label style={labelStyle}>Nombre Completo</label>
            <div style={inputWrapper}>
              <User size={18} color="#94a3b8" />
              <input 
                name="nombre" 
                style={rawInput} 
                required 
                onChange={handleChange} 
                placeholder="Ej: Juan Pérez" 
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Correo Electrónico</label>
            <div style={inputWrapper}>
              <Mail size={18} color="#94a3b8" />
              <input 
                name="correo" 
                type="email" 
                style={rawInput} 
                required 
                onChange={handleChange} 
                placeholder="email@ejemplo.com" 
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <div style={inputWrapper}>
              <Lock size={18} color="#94a3b8" />
              <input 
                name="password" 
                type="password" 
                style={rawInput} 
                required 
                onChange={handleChange} 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>¿Cómo usarás la plataforma?</label>
            <div style={inputWrapper}>
              <UserCheck size={18} color="#94a3b8" />
              <select 
                name="rol" 
                style={rawInput} 
                value={formData.rol} 
                onChange={handleChange}
              >
                <option value="cliente">Quiero buscar ofertas (Cliente)</option>
                <option value="vendedor">Quiero publicar mis ofertas (Vendedor)</option>
              </select>
            </div>
          </div>

          <button type="submit" style={btnSubmit} disabled={cargando}>
            {cargando ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <>Registrarme <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p style={footerText}>
          ¿Ya tienes cuenta? <Link to="/login" style={linkStyle}>Inicia sesión</Link>
        </p>
      </div>
      
      <style>{`
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

// --- Estilos ---
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: '#f8fafc', padding: '20px' };
const cardStyle = { background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '500px' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '6px' };
const inputWrapper = { display: 'flex', alignItems: 'center', gap: '10px', background: '#f1f5f9', padding: '0 15px', borderRadius: '12px', border: '1px solid #e2e8f0' };
const rawInput = { width: '100%', padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: '0.95rem', color: '#1e293b' };
const btnSubmit = { width: '100%', padding: '14px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' };
const footerText = { textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.9rem' };
const linkStyle = { color: '#e67e22', fontWeight: 'bold', textDecoration: 'none' };

export default Registro;