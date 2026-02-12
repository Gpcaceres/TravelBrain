import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import { API_CONFIG } from '../config'
import '../styles/FaceRegistration.css'

export default function FaceLogin() {
  // Authentication States
  const [step, setStep] = useState('validating') // validating, camera, capture, processing, success
  const [authData, setAuthData] = useState(null) // Datos temporales del usuario autenticado
  
  // Camera & Capture States
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  
  // UI States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  
  // Refs
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  
  const { saveAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Validar credenciales al montar el componente
  useEffect(() => {
    const validateCredentials = async () => {
      // Verificar que vengan las credenciales desde /login
      const credentials = location.state
      
      if (!credentials?.email || !credentials?.password) {
        setError('No se recibieron credenciales. Redirigiendo al login...')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      setLoading(true)
      setError('')

      try {
        const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, {
          email: credentials.email,
          password: credentials.password
        })
        
        if (response.data.success && response.data.token) {
          // Guardar datos temporales (NO autenticar todavía)
          setAuthData({
            token: response.data.token,
            user: response.data.user
          })
          
          // Avanzar a reconocimiento facial
          setMessage('✅ Credenciales validadas. Preparando verificación facial...')
          setTimeout(() => {
            setStep('camera')
          }, 1000)
        } else {
          setError('Credenciales incorrectas. Redirigiendo...')
          setTimeout(() => navigate('/login'), 2000)
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al validar credenciales. Redirigiendo...')
        setTimeout(() => navigate('/login'), 2000)
      } finally {
        setLoading(false)
      }
    }

    validateCredentials()
  }, [])

  /**
   * Step 2: Start camera for facial recognition
   */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCameraError(null)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setCameraError('No se pudo acceder a la cámara. Por favor, permite el acceso.')
      setError('No se pudo acceder a la cámara')
    }
  }

  /**
   * Stop camera
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  /**
   * Step 3: Capture photo from webcam
   */
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Set canvas dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to blob
    canvas.toBlob((blob) => {
      setCapturedImage(blob)
      setStep('capture')
      stopCamera()
    }, 'image/jpeg', 0.95)
  }

  /**
   * Step 4: Verify facial recognition and complete login
   */
  const handleFaceVerification = async () => {
    if (!capturedImage || !authData) return

    setLoading(true)
    setStep('processing')
    setError('')

    try {
      const userId = authData.user._id || authData.user.userId
      
      // Verificar reconocimiento facial
      const formDataFace = new FormData()
      formDataFace.append('file', capturedImage, 'face.jpg')

      const response = await api.post(`/api/face/verify?user_id=${userId}`, formDataFace, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.verified) {
        setMessage('✅ ¡Reconocimiento facial exitoso!')
        setStep('success')
        
        // AHORA SÍ autenticar al usuario
        saveAuth(authData.token, authData.user)
        
        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/dashboard', {
            state: { message: '¡Bienvenido de vuelta!' }
          })
        }, 1500)
      } else {
        throw new Error('El rostro no coincide con el usuario registrado')
      }
    } catch (err) {
      console.error('Error en verificación facial:', err)
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Error en el reconocimiento facial. Por favor, intenta de nuevo.'
      )
      setStep('capture')
      setLoading(false)
    }
  }

  /**
   * Retake photo
   */
  const retakePhoto = () => {
    setCapturedImage(null)
    setStep('camera')
    startCamera()
  }

  /**
   * Cancel login and return
   */
  const handleCancel = () => {
    stopCamera()
    setCapturedImage(null)
    setAuthData(null)
    setError('')
    setMessage('')
    navigate('/login')
  }

  // Auto-start camera when entering camera step
  useEffect(() => {
    if (step === 'camera' && !stream) {
      startCamera()
    }
  }, [step])

  return (
    <div className="face-registration-page">
      <Link to="/login" className="face-back-link">
        ← Volver al Login
      </Link>

      <div className="face-registration-container">
        {/* Header */}
        <div className="face-registration-header">
          <img src="/assets/images/logo.png" alt="TravelBrain" className="face-logo" />
          <h1 className="face-title">
            {step === 'validating' && 'Validando Credenciales'}
            {step === 'camera' && 'Verificación Facial'}
            {step === 'capture' && 'Confirmar Foto'}
            {step === 'processing' && 'Verificando...'}
            {step === 'success' && '¡Bienvenido!'}
          </h1>
          <p className="face-subtitle">
            {step === 'validating' && 'Verificando tu identidad...'}
            {step === 'camera' && 'Posiciona tu rostro en el centro de la cámara'}
            {step === 'capture' && '¿Esta foto se ve bien?'}
            {step === 'processing' && 'Estamos verificando tu identidad biométrica...'}
            {step === 'success' && 'Reconocimiento facial exitoso'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="face-error">
            <div className="face-error-icon">⚠️</div>
            <div className="face-error-text">{error}</div>
          </div>
        )}

        {message && !error && (
          <div className="face-success">
            <div className="face-success-icon">✓</div>
            <div className="face-success-text">{message}</div>
          </div>
        )}

        {/* Step 1: Validating Credentials */}
        {step === 'validating' && (
          <div className="face-step-content">
            <div className="face-loading-container">
              <div className="face-spinner"></div>
              <p className="face-loading-text">Verificando credenciales...</p>
              <p className="face-loading-subtext">Por favor espera un momento</p>
            </div>
          </div>
        )}

        {/* Step 2: Camera View */}
        {step === 'camera' && (
          <div className="face-step-content">
            <div className="face-camera-container">
              <div className="face-guide-overlay">
                <div className="face-guide-circle"></div>
                <p className="face-guide-text">Alinea tu rostro en el círculo</p>
              </div>
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="face-video"
              />

              {cameraError && (
                <div className="face-camera-error">
                  <p>{cameraError}</p>
                  <button onClick={startCamera} className="face-btn face-btn-secondary">
                    Reintentar
                  </button>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="face-button-group">
              <button
                onClick={capturePhoto}
                className="face-btn face-btn-primary"
                disabled={!stream || cameraError}
              >
                📸 Capturar Foto
              </button>
              <button
                onClick={handleCancel}
                className="face-btn face-btn-cancel"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview Captured Image */}
        {step === 'capture' && capturedImage && (
          <div className="face-step-content">
            <div className="face-preview-container">
              <img
                src={URL.createObjectURL(capturedImage)}
                alt="Face Preview"
                className="face-preview-image"
              />
            </div>

            <div className="face-button-group">
              <button
                onClick={handleFaceVerification}
                className="face-btn face-btn-primary"
                disabled={loading}
              >
                {loading ? 'Verificando...' : '✓ Confirmar y Verificar'}
              </button>
              <button
                onClick={retakePhoto}
                className="face-btn face-btn-secondary"
                disabled={loading}
              >
                🔄 Tomar otra foto
              </button>
              <button
                onClick={handleCancel}
                className="face-btn face-btn-cancel"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Processing */}
        {step === 'processing' && (
          <div className="face-step-content">
            <div className="face-loading">
              <div className="face-spinner"></div>
              <p className="face-loading-text">Verificando tu identidad...</p>
              <p className="face-loading-subtext">Por favor espera un momento</p>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <div className="face-step-content">
            <div className="face-success-animation">
              <div className="face-success-checkmark">✓</div>
              <h2 className="face-success-title">¡Verificación Exitosa!</h2>
              <p className="face-success-message">Redirigiendo al dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
