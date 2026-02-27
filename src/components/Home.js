import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = ({ isLoggedIn, userRole }) => {
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  const imagenHome = "https://res.cloudinary.com/dwpgncjgn/image/upload/v1772202456/Home_kwrrd2.png";

  const ejecutarBusqueda = () => {
    if (!busqueda.trim()) return;
    localStorage.setItem('termino-busqueda-home', busqueda);

    if (isLoggedIn) {
      if (userRole === 'cliente') {
        navigate('/panel-cliente');
      } else {
        alert("Como vendedor, gestiona tus ofertas desde el Dashboard.");
        navigate('/dashboard');
      }
    } else {
      // Si no está logueado, lo mandamos a loguearse primero
      navigate('/login');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') ejecutarBusqueda();
  };

  // Vista especial para Vendedor logueado
  if (isLoggedIn && userRole === 'vendedor') {
    return (
      <div style={containerVendedor}>
        <div style={cardBienvenida}>
          <h1 style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '15px' }}>Panel de Negocios</h1>
          <p style={{ color: '#64748b', fontSize: '1.2rem', maxWidth: '500px' }}>
            Bienvenido. Tu sesión está activa como vendedor. Gestiona tus locales y productos desde tu panel central.
          </p>
          <button style={btnGestion} onClick={() => navigate('/dashboard')}>
            Ir a Mis Locales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={homeWrapper}>
      <div style={{ ...heroBackground, backgroundImage: `url(${imagenHome})` }}>
        <div style={overlay}>
          <div style={contentCenter}>
            <h1 style={mainTitle}>
              Encontrá las mejores ofertas <br/> 
              <span style={{ color: '#e67e22' }}>en un solo lugar</span>
            </h1>
            
            <div style={searchWrapper}>
              <div style={searchBar}>
                <Search size={22} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="¿Qué producto estás buscando hoy?" 
                  style={inputStyle}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button style={btnSearch} onClick={ejecutarBusqueda}>Buscar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Estilos Originales Preservados ---
const homeWrapper = { width: '100%', height: 'calc(100vh - 75px)', overflow: 'hidden' };
const heroBackground = { width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', backgroundRepeat: 'no-repeat' };
const overlay = { position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const contentCenter = { textAlign: 'center', width: '100%', maxWidth: '800px', padding: '0 20px' };
const mainTitle = { color: 'white', fontSize: '4rem', fontWeight: '900', marginBottom: '40px', lineHeight: '1.1', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' };
const searchWrapper = { display: 'flex', justifyContent: 'center', width: '100%' };
const searchBar = { display: 'flex', alignItems: 'center', background: 'white', width: '100%', maxWidth: '700px', padding: '10px 10px 10px 25px', borderRadius: '50px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' };
const inputStyle = { flex: 1, border: 'none', outline: 'none', fontSize: '1.2rem', padding: '15px', color: '#334155', background: 'transparent' };
const btnSearch = { background: '#e67e22', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '40px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s' };
const containerVendedor = { height: 'calc(100vh - 75px)', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' };
const cardBienvenida = { background: 'white', padding: '60px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const btnGestion = { marginTop: '25px', padding: '15px 40px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' };

export default Home;