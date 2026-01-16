import { useState, useEffect } from 'react';
import { tripService } from '../services/tripService';
import { generateItinerary, getItineraryByTripId } from '../services/itineraryService';
import '../styles/Itineraries.css';

const Itineraries = () => {
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
      if (response.success) {
        setTrips(response.data);
      }
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
