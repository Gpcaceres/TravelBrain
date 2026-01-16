import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { tripService } from '../services/tripService';
import { generateItinerary, getItineraryByTripId } from '../services/itineraryService';
import '../styles/Itineraries.css';

const Itineraries = () => {
  const { getUser, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [showMenu, setShowMenu] = useState(false);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [interestType, setInterestType] = useState('');
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');

  const interestTypes = [
    'Cultura e Historia',
    'Naturaleza y Aventura',
    'Gastronomía',
    'Deportes y Aventura'
  ];

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await tripService.getAllTrips();
      console.log('Response from tripService:', response);
      console.log('Current user:', user);
      
      // Handle different response formats
      let allTrips = [];
      if (response.success && response.data) {
        allTrips = response.data;
      } else if (Array.isArray(response)) {
        allTrips = response;
      }
      
      // Filter trips by current user
      const userTrips = allTrips.filter(trip => {
        console.log(`Comparing trip.userId (${trip.userId}) with user._id (${user._id})`);
        return String(trip.userId) === String(user._id);
      });
      
      console.log(`Found ${userTrips.length} trips for user ${user._id} out of ${allTrips.length} total trips`);
      setTrips(userTrips);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Error al cargar los viajes');
    }
  };

  const handleTripChange = async (e) => {
    const tripId = e.target.value;
    const trip = trips.find(t => t._id === tripId);
    setSelectedTrip(trip);
    setItinerary(null);
    setError('');

    // Check if itinerary already exists for this trip
    if (tripId) {
      try {
        const response = await getItineraryByTripId(tripId);
        if (response.success) {
          setItinerary(response.data);
          setInterestType(response.data.interestType);
        }
      } catch (err) {
        // No itinerary exists yet, that's ok
        console.log('No existing itinerary found');
      }
    }
  };

  const handleGenerateItinerary = async () => {
    if (!selectedTrip) {
      setError('Por favor selecciona un viaje');
      return;
    }
    if (!interestType) {
      setError('Por favor selecciona un tipo de interés');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await generateItinerary(selectedTrip._id, interestType);
      if (response.success) {
        setItinerary(response.data);
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError(err.message || 'Error al generar el itinerario');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!itinerary) return;

    // Using html2pdf library
    const element = document.getElementById('itinerary-content');
    const opt = {
      margin: 1,
      filename: `itinerario-${selectedTrip?.destination || 'viaje'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Check if html2pdf is available
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      alert('Por favor instala html2pdf para descargar el PDF');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="itineraries-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-left">
            <img src="/assets/images/logo.png" alt="Logo" className="navbar-logo" />
            <span className="navbar-brand">TravelBrain</span>
          </div>

          <div className="navbar-center">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/trips" className="nav-link">My Trips</Link>
            <Link to="/destinations" className="nav-link">Destinations</Link>
            <Link to="/weather" className="nav-link">Weather</Link>
            <Link to="/itineraries" className="nav-link active">Itineraries</Link>
          </div>

          <div className="navbar-right">
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
              >
                <div className="user-avatar">
                  {(user?.name || user?.username || 'U').substring(0, 2).toUpperCase()}
                </div>
                <span className="user-name">{user?.name || user?.username || 'User'}</span>
                <span className={`dropdown-arrow ${showMenu ? 'rotated' : ''}`}>▼</span>
              </button>

              {showMenu && (
                <div className="user-menu-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {(user?.name || user?.username || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="dropdown-name">{user?.name || user?.username || 'User'}</p>
                        <p className="dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2.5 1h-5A2.5 2.5 0 003 11.5V13a1 1 0 001 1h8a1 1 0 001-1v-1.5A2.5 2.5 0 0010.5 9z"/>
                    </svg>
                    Profile Settings
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="dropdown-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M1.5 1.5A.5.5 0 012 1h12a.5.5 0 01.5.5v2a.5.5 0 01-.128.334L10 8.692V13.5a.5.5 0 01-.342.474l-3 1A.5.5 0 016 14.5V8.692L1.628 3.834A.5.5 0 011.5 3.5v-2z"/>
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="itineraries-header">
        <h1>Generador de Itinerarios</h1>
        <p>Crea itinerarios personalizados para tus viajes</p>
      </div>

      <div className="itinerary-form">
        <div className="form-group">
          <label htmlFor="trip-select">Seleccionar Viaje</label>
          <select
            id="trip-select"
            value={selectedTrip?._id || ''}
            onChange={handleTripChange}
            className="form-control"
          >
            <option value="">-- Selecciona un viaje --</option>
            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.destination} - {formatDate(trip.startDate)} a {formatDate(trip.endDate)}
              </option>
            ))}
          </select>
        </div>

        {selectedTrip && (
          <>
            <div className="trip-details">
              <h3>Detalles del Viaje</h3>
              <div className="trip-info">
                <p><strong>Destino:</strong> {selectedTrip.destination}</p>
                <p><strong>Fecha de inicio:</strong> {formatDate(selectedTrip.startDate)}</p>
                <p><strong>Fecha de fin:</strong> {formatDate(selectedTrip.endDate)}</p>
                <p><strong>Presupuesto:</strong> {formatCurrency(selectedTrip.budget || 0)}</p>
                <p><strong>Descripción:</strong> {selectedTrip.description || 'Sin descripción'}</p>
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Interés</label>
              <div className="interest-types">
                {interestTypes.map((type) => (
                  <button
                    key={type}
                    className={`interest-btn ${interestType === type ? 'active' : ''}`}
                    onClick={() => setInterestType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="generate-btn"
              onClick={handleGenerateItinerary}
              disabled={loading || !interestType}
            >
              {loading ? 'Generando...' : 'Generar Itinerario'}
            </button>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>

      {itinerary && (
        <div className="itinerary-result" id="itinerary-content">
          <div className="itinerary-header-section">
            <h2>Itinerario generado</h2>
            <h3>Plan de Viaje: {selectedTrip?.destination}</h3>
            <div className="itinerary-meta">
              <span className="badge badge-interest">{itinerary.interestType}</span>
              <span className="badge badge-budget">{itinerary.budgetType}</span>
            </div>
          </div>

          <div className="itinerary-details">
            <h4>Itinerario Detallado</h4>
            {itinerary.dailyActivities.map((day) => (
              <div key={day.day} className="day-section">
                <h5>Día {day.day} - {formatDate(day.date)}</h5>
                <div className="activities-list">
                  {day.activities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-time">{activity.time}</div>
                      <div className="activity-details">
                        <div className="activity-title">{activity.title}</div>
                        <div className="activity-cost">${activity.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {itinerary.weatherInfo && (
            <div className="weather-section">
              <h4>Información del Clima</h4>
              <div className="weather-summary">
                <p><strong>Temperatura promedio:</strong> {itinerary.weatherInfo.averageTemp}°C</p>
                <p><strong>Condiciones:</strong> {itinerary.weatherInfo.conditions}</p>
              </div>
              {itinerary.weatherInfo.dailyForecasts && itinerary.weatherInfo.dailyForecasts.length > 0 && (
                <div className="daily-forecasts">
                  {itinerary.weatherInfo.dailyForecasts.map((forecast, index) => (
                    <div key={index} className="forecast-item">
                      <p className="forecast-date">{formatDate(forecast.date)}</p>
                      <p className="forecast-temp">{forecast.temp}°C</p>
                      <p className="forecast-condition">{forecast.condition}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {itinerary.budgetBreakdown && (
            <div className="budget-section">
              <h4>Presupuesto Estimado</h4>
              <div className="budget-breakdown">
                <div className="budget-item">
                  <span>Hospedaje</span>
                  <span>{formatCurrency(itinerary.budgetBreakdown.accommodation)}</span>
                </div>
                <div className="budget-item">
                  <span>Alimentación</span>
                  <span>{formatCurrency(itinerary.budgetBreakdown.food)}</span>
                </div>
                <div className="budget-item">
                  <span>Actividades y Tours</span>
                  <span>{formatCurrency(itinerary.budgetBreakdown.activities)}</span>
                </div>
                <div className="budget-item">
                  <span>Transporte Local</span>
                  <span>{formatCurrency(itinerary.budgetBreakdown.transport)}</span>
                </div>
                <div className="budget-item">
                  <span>Extras - Compras</span>
                  <span>{formatCurrency(itinerary.budgetBreakdown.extras)}</span>
                </div>
                <div className="budget-item budget-total">
                  <span><strong>Total Estimado</strong></span>
                  <span><strong>{formatCurrency(itinerary.budgetBreakdown.total)}</strong></span>
                </div>
              </div>
            </div>
          )}

          <div className="itinerary-actions">
            <button className="download-btn" onClick={handleDownloadPDF}>
              📄 Guardar como PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itineraries;
