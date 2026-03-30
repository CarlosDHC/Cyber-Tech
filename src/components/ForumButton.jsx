// src/components/FloatingForumButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForumButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/forum')}
      title="Abrir Fórum Geral"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#2563EB',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        padding: '12px 24px',
        boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        zIndex: 9999, // Garante que fique acima de tudo
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'transform 0.2s ease, background 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.backgroundColor = '#1d4ed8';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = '#2563EB';
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Fórum Geral
    </button>
  );
};

export default ForumButton;