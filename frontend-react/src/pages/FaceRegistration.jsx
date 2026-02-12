import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import '../styles/FaceRegistration.css'

export default function FaceRegistration() {
  const [step, setStep] = useState('camera') // camera, preview, processing, success
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [stream, setStream] = useState(null)
  const [livenessCheck, setLivenessCheck] = useState({
    status: 'idle', // idle, checking, passed, failed
    message: ''
  })
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { getUser, saveAuth } = useAuth()

  // Obtener datos del usuario y token desde el estado de navegación
  const userData = location.state?.userData || getUser()
  const authToken = location.state?.token
  const isNewRegistration = location.state?.isNewRegistration || false

  useEffect(() => {
    // Si no hay usuario, redirigir al registro
    if (!userData) {
      navigate('/register')
      return
    }

    // Limpiar stream al desmontar
    return () => {
      stopCamera()
    }
  }, [userData, navigate])

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
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setError('')
        setStep('camera')
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
      console.error('Error accessing camera:', err)
    }
  }

  /**
   * Detener cámara web
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  /**
   * Capturar foto desde la cámara
   */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'face-photo.jpg', { type: 'image/jpeg' })
      setImage(file)
      setPreview(URL.createObjectURL(blob))
      stopCamera()
      setStep('preview')
      
      // Ejecutar verificación de liveness
      await checkLiveness(file)
    }, 'image/jpeg', 0.95)
  }

  /**
   * Verificar que es una persona real (liveness detection)
   */
  const checkLiveness = async (imageFile) => {
    setLivenessCheck({ status: 'checking', message: 'Verificando que eres una persona real...' })
    
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await api.post('/api/face/verify-liveness', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.is_live) {
        setLivenessCheck({ 
          status: 'passed', 
          message: '✓ Verificación exitosa: Persona detectada'
        })
      } else {
        setLivenessCheck({ 
          status: 'failed', 
          message: '⚠ No se detectó una persona real. Por favor, intenta de nuevo.'
        })
        setError('La imagen no pasó la verificación de seguridad. Asegúrate de que sea una foto en vivo.')
      }
    } catch (err) {
      console.error('Liveness check error:', err)
      setLivenessCheck({ 
        status: 'failed', 
        message: '⚠ Error en la verificación'
      })
      setError('Error al verificar la imagen. Por favor, intenta de nuevo.')
    }
  }

  /**
   * Registrar rostro en el sistema
   */
  const handleRegisterFace = async () => {
    if (!image || livenessCheck.status !== 'passed') {
      setError('Por favor, captura una foto válida que pase la verificación de seguridad.')
      return
    }

    setLoading(true)
    setError('')
    setStep('processing')

    try {
      const formData = new FormData()
      formData.append('file', image)
      formData.append('user_id', userData._id || userData.userId)
      formData.append('username', userData.username)
      formData.append('email', userData.email)

      const response = await api.post('/api/face/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setMessage('¡Registro facial completado con éxito!')
        setStep('success')
        
        // Ahora SÍ guardar la autenticación (solo si es registro nuevo)
        if (isNewRegistration && authToken) {
          saveAuth(authToken, userData)
        }
        
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { message: 'Cuenta creada exitosamente con reconocimiento facial' }
          })
        }, 2000)
      }
    } catch (err) {
      console.error('Error en registro facial:', err)
      
      // Verificar si es un error de rostro duplicado
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || ''
      const isDuplicateFace = errorMessage.includes('ya está registrado en el sistema') || 
                              errorMessage.includes('Usuario existente')
      
      if (isDuplicateFace) {
        // ERROR DE ROSTRO DUPLICADO: NO eliminar usuario, mostrar mensaje específico
        setError(`⚠️ Rostro Duplicado\n\n${errorMessage}\n\nPor favor, utiliza un rostro diferente o inicia sesión con tu cuenta existente.`)
        setStep('preview')
        setLoading(false)
        
        // Si es registro nuevo, eliminar el usuario porque no puede completar el registro
        if (isNewRegistration && userData?._id && authToken) {
          try {
            await api.delete(`/api/users/${userData._id}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            })
          } catch (deleteErr) {
            console.error('Error al eliminar usuario duplicado:', deleteErr)
          }
        }
        return
      }
      
      // Si es un registro nuevo y falla CON OTRO ERROR, eliminar el usuario de la base de datos
      if (isNewRegistration && userData?._id && authToken) {
        try {
          await api.delete(`/api/users/${userData._id}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
          
          // Redirigir al registro porque el usuario fue eliminado
          navigate('/register', {
            state: { 
              error: 'Error en el registro facial. Tu cuenta fue eliminada. Por favor, intenta registrarte nuevamente.',
              previousData: {
                fullName: userData.fullName,
                email: userData.email,
                username: userData.username
              }
            }
          })
          return
        } catch (deleteErr) {
          console.error('Error al eliminar usuario:', deleteErr)
          // Si no se puede eliminar, mostrar mensaje crítico
          setError('Error crítico: No se pudo completar el registro y no se pudo limpiar los datos. Por favor, contacta al soporte.')
          setLoading(false)
          return
        }
      }
      
      // Si no es registro nuevo, solo mostrar error
      setError(err.response?.data?.message || 'Error al registrar el rostro. Por favor, intenta de nuevo.')
      setStep('preview')
      setLoading(false)
    }
  }

  /**
   * Cancelar registro facial
   */
  const handleCancel = async () => {
    stopCamera()
    
    // Si es un registro nuevo, eliminar el usuario creado
    if (isNewRegistration && userData?._id && authToken) {
      try {
        // Usar el token para eliminar el usuario
        await api.delete(`/api/users/${userData._id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      } catch (err) {
        console.error('Error al eliminar usuario:', err)
        // Continuar con la redirección aunque falle
      }
      
      navigate('/login', {
        state: { 
          message: 'Registro cancelado. El registro facial es obligatorio para completar tu cuenta.' 
        }
      })
    } else {
      // Si es una actualización desde perfil, permitir omitir
      navigate('/dashboard', {
        state: { message: 'Registro facial omitido. Puedes configurarlo más tarde desde tu perfil.' }
      })
    }
  }

  /**
   * Retomar captura
   */
  const handleRetake = () => {
    setImage(null)
    setPreview(null)
    setError('')
    setLivenessCheck({ status: 'idle', message: '' })
    setStep('camera')
    startCamera()
  }

  return (
    <div className="face-registration-page">
      <div className="face-registration-container">
        {/* Header */}
        <div className="face-registration-header">
          <img src="/assets/images/logo.png" alt="TravelBrain" className="face-logo" />
          <h1 className="face-title">Registro Facial</h1>
          <p className="face-subtitle">
            {step === 'camera' && 'Captura tu rostro para una autenticación segura'}
            {step === 'preview' && 'Revisa tu foto antes de continuar'}
            {step === 'processing' && 'Procesando tu información...'}
            {step === 'success' && '¡Registro completado!'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
            {isNewRegistration && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Si continúas teniendo problemas, puedes cancelar el registro. 
                Tu cuenta será eliminada y podrás intentar registrarte nuevamente más tarde.
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {/* Camera Step */}
        {step === 'camera' && (
          <div className="face-capture-section">
            <div className="video-container">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                className="face-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              {/* Guía de posicionamiento */}
              <div className="face-guide">
                <div className="face-guide-oval"></div>
                <p className="face-guide-text">Centra tu rostro en el óvalo</p>
              </div>
            </div>

            <div className="face-instructions">
              <h3>Instrucciones:</h3>
              <ul>
                <li>✓ Asegúrate de tener buena iluminación</li>
                <li>✓ Mira directamente a la cámara</li>
                <li>✓ Mantén tu rostro dentro del óvalo</li>
                <li>✓ No uses lentes oscuros o accesorios que cubran tu rostro</li>
              </ul>
            </div>

            <div className="face-actions">
              {!stream ? (
                <button 
                  onClick={startCamera} 
                  className="btn btn-primary btn-large"
                >
                  📷 Iniciar Cámara
                </button>
              ) : (
                <>
                  <button 
                    onClick={capturePhoto} 
                    className="btn btn-primary btn-large"
                  >
                    📸 Capturar Foto
                  </button>
                  <button 
                    onClick={handleCancel} 
                    className="btn btn-secondary"
                  >
                    Omitir (Configurar después)
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && preview && (
          <div className="face-preview-section">
            <div className="preview-container">
              <img src={preview} alt="Preview" className="face-preview-image" />
              
              {/* Liveness Check Status */}
              {livenessCheck.status !== 'idle' && (
                <div className={`liveness-badge liveness-${livenessCheck.status}`}>
                  {livenessCheck.message}
                </div>
              )}
            </div>

            <div className="preview-info">
              <h3>Revisa tu foto</h3>
              <p>
                {livenessCheck.status === 'checking' && 'Verificando seguridad...'}
                {livenessCheck.status === 'passed' && '¿La foto se ve bien? Confirma para continuar.'}
                {livenessCheck.status === 'failed' && 'Esta foto no pasó la verificación. Intenta de nuevo.'}
              </p>
            </div>

            <div className="face-actions">
              <button 
                onClick={handleRegisterFace} 
                className="btn btn-primary btn-large"
                disabled={loading || livenessCheck.status !== 'passed'}
              >
                {loading ? 'Registrando...' : '✓ Confirmar y Registrar'}
              </button>
              <button 
                onClick={handleRetake} 
                className="btn btn-secondary"
                disabled={loading}
              >
                🔄 Tomar otra foto
              </button>
              <button 
                onClick={handleCancel} 
                className="btn btn-text"
                disabled={loading}
              >
                Cancelar registro
              </button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="face-processing-section">
            <div className="spinner-large"></div>
            <h3>Procesando tu registro facial...</h3>
            <p>Por favor espera un momento</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="face-success-section">
            <div className="success-icon">✓</div>
            <h2>¡Registro Completado!</h2>
            <p>Tu rostro ha sido registrado exitosamente</p>
            <p className="success-redirect">Redirigiendo al dashboard...</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="face-security-notice">
          <p>
            🔒 Tu información biométrica está encriptada y protegida. 
            Solo se utiliza para autenticación y nunca se comparte con terceros.
          </p>
        </div>
      </div>
    </div>
  )
}
