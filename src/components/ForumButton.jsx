import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForumButton = () => {
  const navigate = useNavigate();
  // Estado para controlar se o mouse está em cima
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={() => navigate('/forum')}
      title="Abrir Fórum Geral"
      
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: hover ? '#1d4ed8' : '#2563EB', // Muda cor levemente no hover
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        
        padding: hover ? '12px 24px' : '14px', 
        minWidth: hover ? 'auto' : '52px', 
        height: '52px', 
        
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
        cursor: 'pointer',
        zIndex: 9999,
        fontWeight: 'bold',
        fontSize: '1rem',
        
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        overflow: 'hidden' 
      }}
    >
      {/* Ícone de Chat (Balão) */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }} 
      >
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      {/* Texto com Animação de Revelação */}
      <span style={{
        maxWidth: hover ? '150px' : '0px', 
        opacity: hover ? 1 : 0,
        
        marginLeft: hover ? '10px' : '0px',
        
        whiteSpace: 'nowrap', 
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out', 
      }}>
        Fórum Geral
      </span>
    </button>
  );
};

export default ForumButton;