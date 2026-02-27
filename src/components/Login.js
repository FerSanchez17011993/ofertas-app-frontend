import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // URL de la imagen de fondo
  const imagenFondo = "https://res.cloudinary.com/dwpgncjgn/image/upload/v1772202456/Home_kwrrd2.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      login(data); 
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...pageWrapper, backgroundImage: `url(${imagenFondo})` }}>
      <div style={overlay}>
        <div style={loginCard}>
          <div style={headerStyle}>
            <div style={iconCircle}><LogIn size={28} color="#e67e22" /></div>
            <h2 style={titleStyle}>¡Bienvenido!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Ingresa a tu cuenta para continuar</p>
          </div>

          {error && <div style={errorBadge}>{error}</div>}

          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroup}>
              <label style={labelStyle}>Email</label>
              <div style={inputWrapper}>
                <Mail size={18} color="#94a3b8" style={inputIcon} />
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Contraseña</label>
              <div style={inputWrapper}>
                <Lock size={18} color="#94a3b8" style={inputIcon} />
                <input
                  type="password"
                  style={inputStyle}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" style={btnSubmit} disabled={loading}>
              {loading ? <Loader2 size={20} className="spinner" /> : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={footerStyle}>
            ¿No tienes cuenta? <Link to="/registro" style={linkStyle}>Regístrate</Link>
          </div>
        </div>
      </div>
      <style>{`.spinner { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// --- ESTILOS ACTUALIZADOS ---
const pageWrapper = { 
  width: '100%', 
  height: '100vh', 
  backgroundSize: 'cover', 
  backgroundPosition: 'center', 
  backgroundRepeat: 'no-repeat' 
};

const overlay = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100%', 
  width: '100%',
  backgroundColor: 'rgba(15, 23, 42, 0.7)' // Oscurece el fondo para que resalte la tarjeta
};

const loginCard = { 
  background: 'white', 
  padding: '40px', 
  borderRadius: '28px', 
  width: '90%', 
  maxWidth: '400px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' 
};

const headerStyle = { marginBottom: '25px', textAlign: 'center' };
const iconCircle = { width: '50px', height: '50px', background: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' };
const titleStyle = { color: '#1e293b', fontSize: '1.6rem', fontWeight: '800', margin: 0 };
const formStyle = { textAlign: 'left' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#475569' };
const inputWrapper = { position: 'relative', display: 'flex', alignItems: 'center' };
const inputIcon = { position: 'absolute', left: '15px' };

const inputStyle = { 
  width: '100%', 
  padding: '12px 12px 12px 45px', 
  borderRadius: '12px', 
  border: '1px solid #e2e8f0', 
  outline: 'none',
  fontSize: '1rem',
  transition: 'border-color 0.2s'
};

const btnSubmit = { 
  width: '100%', 
  padding: '14px', 
  background: '#e67e22', 
  color: 'white', 
  border: 'none', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  fontWeight: '800', 
  fontSize: '1rem',
  display: 'flex', 
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(230, 126, 34, 0.3)'
};

const errorBadge = { 
  background: '#fee2e2', 
  color: '#dc2626', 
  padding: '12px', 
  borderRadius: '12px', 
  marginBottom: '20px', 
  fontSize: '0.85rem', 
  textAlign: 'center',
  fontWeight: '500'
};

const footerStyle = { marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' };
const linkStyle = { color: '#e67e22', fontWeight: '800', textDecoration: 'none' };

export default Login;