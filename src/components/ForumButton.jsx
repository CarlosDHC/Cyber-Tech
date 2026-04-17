// src/components/FloatingForumButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForumButton = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => navigate('/forum')}
      title="Abrir Fórum Geral"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: isHovered ? '#1d4ed8' : '#2563EB',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        height: '48px',
        // Transita a largura de um círculo (48px) para o tamanho total (aprox. 165px)
        width: isHovered ? '165px' : '48px', 
        padding: '0 12px',
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 9999,
        fontWeight: 'bold',
        fontSize: '1rem',
        overflow: 'hidden', // Esconde o texto que ultrapassa a largura
        whiteSpace: 'nowrap', // Impede que o texto quebre de linha
        boxSizing: 'border-box',
        transition: 'width 0.3s ease, background-color 0.2s ease',
      }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }} // Impede que o ícone seja esmagado durante a animação
      >
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span
        style={{
          marginLeft: '10px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          transitionDelay: isHovered ? '0.1s' : '0s' // Dá um leve atraso para o texto aparecer
        }}
      >
        Fórum Geral
      </span>
    </button>
  );
};

export default ForumButton;