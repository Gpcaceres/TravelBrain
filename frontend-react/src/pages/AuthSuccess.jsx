import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STORAGE_KEYS } from '../config';
import './AuthSuccess.css';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Error de autenticación:', error);
        setStatus('error');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (token) {
        try {
          // Guardar token en localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          
          // Obtener datos del usuario
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
              setStatus('success');
              
              // Redirigir al dashboard después de 1 segundo
              setTimeout(() => {
                navigate('/dashboard');
              }, 1000);
            } else {
              throw new Error('Respuesta inválida del servidor');
            }
          } else {
            throw new Error('Token inválido');
          }
        } catch (error) {
          console.error('Error al procesar autenticación:', error);
          setStatus('error');
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setStatus('error');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <div className="auth-success-container">
      <div className="auth-success-card">
        {status === 'processing' && (
          <>
            <div className="spinner"></div>
            <h2>Procesando autenticación...</h2>
            <p>Por favor espera un momento</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>¡Autenticación exitosa!</h2>
            <p>Redirigiendo al dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Error de autenticación</h2>
            <p>Redirigiendo a la página de inicio de sesión...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthSuccess;
