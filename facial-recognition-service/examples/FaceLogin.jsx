import React, { useState, useRef } from 'react';
import axios from 'axios';

/**
 * Componente de Login Facial para TravelBrain
 * 
 * Este componente permite a los usuarios autenticarse usando reconocimiento facial.
 * Incluye funcionalidades para:
 * - Capturar foto desde la cámara web
 * - Subir una imagen desde el dispositivo
 * - Hacer login usando reconocimiento facial
 * - Registrar un nuevo rostro
 */
const FaceLogin = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://travelbrain.ddns.net';

  /**
   * Iniciar cámara web
   */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setUseCamera(true);
        setError('');
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      console.error('Error accessing camera:', err);
    }
  };

  /**
   * Detener cámara web
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setUseCamera(false);
    }
  };

  /**
   * Capturar foto desde la cámara
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
      setImage(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  /**
   * Manejar selección de archivo
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  /**
   * Limpiar imagen seleccionada
   */
  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setMessage('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Login facial
   */
  const handleFaceLogin = async () => {
    if (!image) {
      setError('Por favor selecciona o captura una imagen primero');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await axios.post(
        `${API_URL}/api/face/login`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { success, token, user, message: msg } = response.data;

      if (success && token) {
        // Guardar token en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setMessage(msg || 'Login exitoso!');
        
        // Redirigir al dashboard después de 1 segundo
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setError(msg || 'No se pudo autenticar. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Face login error:', err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.message || 
                       'Error al procesar el login facial';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar nuevo rostro
   * (Requiere que el usuario ya esté autenticado con otro método)
   */
  const handleRegisterFace = async () => {
    if (!image) {
      setError('Por favor selecciona o captura una imagen primero');
      return;
    }

    // Obtener datos del usuario actual (debe estar autenticado)
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Debes iniciar sesión primero para registrar tu rostro');
      return;
    }

    const user = JSON.parse(userStr);

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('user_id', user.id || user._id);
      formData.append('username', user.username);
      formData.append('email', user.email);

      const response = await axios.post(
        `${API_URL}/api/face/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setMessage('Rostro registrado exitosamente! Ahora puedes usar login facial.');
        clearImage();
      }
    } catch (err) {
      console.error('Face registration error:', err);
      const errorMsg = err.response?.data?.detail || 
                       err.response?.data?.message || 
                       'Error al registrar el rostro';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verificar si el usuario tiene rostro registrado
   */
  const checkFaceStatus = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/face/status/${userId}`);
      return response.data.has_face_registered;
    } catch (err) {
      console.error('Error checking face status:', err);
      return false;
    }
  };

  return (
    <div className="face-login-container" style={styles.container}>
      <div className="face-login-card" style={styles.card}>
        <h2 style={styles.title}>🔐 Login Facial</h2>
        <p style={styles.subtitle}>Autentícate de forma segura con reconocimiento facial</p>

        {/* Área de captura de imagen */}
        <div className="image-capture-area" style={styles.captureArea}>
          {!preview && !useCamera && (
            <div style={styles.placeholder}>
              <span style={styles.placeholderIcon}>📷</span>
              <p>Captura o sube una foto de tu rostro</p>
            </div>
          )}

          {useCamera && (
            <div style={styles.videoContainer}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={styles.video}
              />
              <button 
                onClick={capturePhoto}
                style={styles.captureButton}
              >
                📸 Capturar Foto
              </button>
            </div>
          )}

          {preview && (
            <div style={styles.previewContainer}>
              <img 
                src={preview} 
                alt="Preview" 
                style={styles.preview}
              />
              <button 
                onClick={clearImage}
                style={styles.clearButton}
              >
                ❌ Limpiar
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Controles */}
        <div className="controls" style={styles.controls}>
          {!useCamera && !preview && (
            <>
              <button 
                onClick={startCamera}
                style={styles.button}
                disabled={loading}
              >
                📹 Usar Cámara
              </button>
              
              <label style={styles.uploadLabel}>
                📁 Subir Imagen
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
              </label>
            </>
          )}

          {useCamera && (
            <button 
              onClick={stopCamera}
              style={{ ...styles.button, ...styles.cancelButton }}
            >
              ⛔ Cancelar
            </button>
          )}

          {preview && (
            <>
              <button 
                onClick={handleFaceLogin}
                style={{ ...styles.button, ...styles.loginButton }}
                disabled={loading}
              >
                {loading ? '🔄 Procesando...' : '✅ Iniciar Sesión'}
              </button>

              <button 
                onClick={handleRegisterFace}
                style={{ ...styles.button, ...styles.registerButton }}
                disabled={loading}
              >
                {loading ? '🔄 Procesando...' : '➕ Registrar Rostro'}
              </button>
            </>
          )}
        </div>

        {/* Mensajes */}
        {message && (
          <div style={styles.successMessage}>
            ✓ {message}
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            ⚠ {error}
          </div>
        )}

        {/* Información */}
        <div style={styles.info}>
          <h4>💡 Consejos:</h4>
          <ul style={styles.tipsList}>
            <li>Asegúrate de tener buena iluminación</li>
            <li>Mira directamente a la cámara</li>
            <li>Solo debe aparecer tu rostro en la foto</li>
            <li>Evita usar lentes de sol o accesorios que cubran tu cara</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Estilos inline (puedes moverlos a un archivo CSS)
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '30px',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
  },
  captureArea: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    minHeight: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    textAlign: 'center',
    color: '#999',
  },
  placeholderIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '10px',
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    borderRadius: '8px',
  },
  captureButton: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  previewContainer: {
    width: '100%',
    position: 'relative',
  },
  preview: {
    width: '100%',
    borderRadius: '8px',
  },
  clearButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    minWidth: '150px',
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  uploadLabel: {
    flex: 1,
    minWidth: '150px',
    padding: '12px 24px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    transition: 'background-color 0.3s',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
  },
  registerButton: {
    backgroundColor: '#9C27B0',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  successMessage: {
    padding: '12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  errorMessage: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  info: {
    backgroundColor: '#e3f2fd',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '20px',
  },
  tipsList: {
    margin: '10px 0',
    paddingLeft: '20px',
    color: '#555',
  },
};

export default FaceLogin;
