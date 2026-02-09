import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { tripService } from '../services/tripService'
import CurrencySelector from '../components/CurrencySelector'
import Navbar from '../components/Navbar'
import '../styles/Trips.css'

export default function Trips() {
  const { getUser } = useAuth()
  const user = getUser()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const [destinationInput, setDestinationInput] = useState('')
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [searchingDestination, setSearchingDestination] = useState(false)
  const destinationTimeoutRef = useRef(null)
  
  const [originCountryInput, setOriginCountryInput] = useState('')
  const [originCountrySuggestions, setOriginCountrySuggestions] = useState([])
  const originCountryTimeoutRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    originCountry: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: '',
    currency: 'USD',
    destinationCurrency: 'USD',
    exchangeRate: 1
  })

  const [currencyData, setCurrencyData] = useState({
    sourceCurrency: 'USD',
    targetCurrency: 'USD',
    exchangeRate: 1,
    convertedAmount: 0
  })

  const loadTrips = async () => {
    try {
      setLoading(true)
      // Backend already filters by authenticated user
      const userTrips = await tripService.getAllTrips()
      setTrips(userTrips)
    } catch (error) {
      console.error('Error loading trips:', error)
      setMessage({ type: 'error', text: 'Failed to load trips' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const openModal = (trip = null) => {
    if (trip) {
      setEditingTrip(trip)
      setFormData({
        title: trip.title,
        destination: trip.destination,
        originCountry: trip.originCountry || '',
        startDate: trip.startDate?.split('T')[0] || '',
        endDate: trip.endDate?.split('T')[0] || '',
        budget: trip.budget || '',
        description: trip.description || '',
        currency: trip.currency || 'USD',
        destinationCurrency: trip.destinationCurrency || 'USD',
        exchangeRate: trip.exchangeRate || 1
      })
      setDestinationInput(trip.destination || '')
      setOriginCountryInput(trip.originCountry || '')
      setCurrencyData({
        sourceCurrency: trip.currency || 'USD',
        targetCurrency: trip.destinationCurrency || 'USD',
        exchangeRate: trip.exchangeRate || 1,
        convertedAmount: trip.budget ? trip.budget * (trip.exchangeRate || 1) : 0
      })
    } else {
      setEditingTrip(null)
      setFormData({
        title: '',
        destination: '',
        originCountry: '',
        startDate: '',
        endDate: '',
        budget: '',
        description: '',
        currency: 'USD',
        destinationCurrency: 'USD',
        exchangeRate: 1
      })
      setDestinationInput('')
      setOriginCountryInput('')
      setCurrencyData({
        sourceCurrency: 'USD',
        targetCurrency: 'USD',
        exchangeRate: 1,
        convertedAmount: 0
      })
    }
    setDestinationSuggestions([])
    setOriginCountrySuggestions([])
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTrip(null)
    setDestinationInput('')
    setOriginCountryInput('')
    setDestinationSuggestions([])
    setOriginCountrySuggestions([])
    setFormData({
      title: '',
      destination: '',
      originCountry: '',
      startDate: '',
      endDate: '',
      budget: '',
      description: '',
      currency: 'USD',
      destinationCurrency: 'USD',
      exchangeRate: 1
    })
    setCurrencyData({
      sourceCurrency: 'USD',
      targetCurrency: 'USD',
      exchangeRate: 1,
      convertedAmount: 0
    })
  }

  const handleCurrencyChange = (data) => {
    console.log('💰 Trips: Received currency data from selector:', data);
    setCurrencyData(data)
    setFormData({
      ...formData,
      currency: data.sourceCurrency,
      destinationCurrency: data.targetCurrency,
      exchangeRate: data.exchangeRate
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const tripData = {
        ...formData,
        userId: user._id,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        currency: currencyData.sourceCurrency,
        destinationCurrency: currencyData.targetCurrency,
        exchangeRate: currencyData.exchangeRate
      }

      console.log('💾 Trips: Submitting trip with data:', {
        currency: tripData.currency,
        destinationCurrency: tripData.destinationCurrency,
        exchangeRate: tripData.exchangeRate
      });

      if (editingTrip) {
        await tripService.updateTrip(editingTrip._id, tripData)
        setMessage({ type: 'success', text: 'Trip updated successfully!' })
      } else {
        await tripService.createTrip(tripData)
        setMessage({ type: 'success', text: 'Trip created successfully!' })
      }

      closeModal()
      loadTrips()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save trip' 
      })
    }
  }

  const handleDelete = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return

    try {
      await tripService.deleteTrip(tripId)
      setMessage({ type: 'success', text: 'Trip deleted successfully!' })
      loadTrips()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete trip' 
      })
    }
  }

  // Destination Autocomplete Functions
  const searchDestinationSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setDestinationSuggestions([])
      return
    }

    setSearchingDestination(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'TravelBrain App'
          }
        }
      )
      
      if (!response.ok) throw new Error('Failed to search places')
      
      const data = await response.json()
      const results = data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        place_id: item.place_id
      }))
      setDestinationSuggestions(results)
    } catch (error) {
      console.error('Error searching destination:', error)
    } finally {
      setSearchingDestination(false)
    }
  }

  const handleDestinationInputChange = (e) => {
    const value = e.target.value
    setDestinationInput(value)
    setFormData({ ...formData, destination: value })
    
    // Clear previous timeout
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current)
    }
    
    // Set new timeout for debouncing
    destinationTimeoutRef.current = setTimeout(() => {
      searchDestinationSuggestions(value)
    }, 500)
  }

  const selectDestination = (place) => {
    // Use the full name for better description
    setDestinationInput(place.name)
    setFormData({ ...formData, destination: place.name })
    setDestinationSuggestions([])
  }

  // Lista de países comunes
  const countries = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 
    'Costa Rica', 'Ecuador', 'El Salvador', 'España', 
    'Estados Unidos', 'Guatemala', 'Honduras', 'México', 
    'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 
    'República Dominicana', 'Uruguay', 'Venezuela'
  ]

  const searchOriginCountrySuggestions = (query) => {
    if (!query || query.length < 1) {
      setOriginCountrySuggestions([])
      return
    }

    const filtered = countries.filter(country =>
      country.toLowerCase().includes(query.toLowerCase())
    )
    setOriginCountrySuggestions(filtered)
  }

  const handleOriginCountryInputChange = (e) => {
    const value = e.target.value
    setOriginCountryInput(value)
    setFormData({ ...formData, originCountry: value })
    
    // Clear previous timeout
    if (originCountryTimeoutRef.current) {
      clearTimeout(originCountryTimeoutRef.current)
    }
    
    // Set new timeout for search
    if (value.trim()) {
      originCountryTimeoutRef.current = setTimeout(() => {
        searchOriginCountrySuggestions(value)
      }, 300)
    } else {
      setOriginCountrySuggestions([])
    }
  }

  const selectOriginCountry = (country) => {
    setOriginCountryInput(country)
    setFormData({ ...formData, originCountry: country })
    setOriginCountrySuggestions([])
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return ''
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''
  }

  return (
    <div className="trips-page">
      <Navbar />
      
      <div className="container trips-container">
        {/* Header */}
        <div className="trips-header">
          <div>
            <h1 className="trips-title">My Trips</h1>
            <p className="trips-subtitle">Plan and manage your travel adventures</p>
          </div>
          <button className="btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            Create Trip
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Trips Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            <h3>No trips yet</h3>
            <p>Start planning your first adventure!</p>
            <button className="btn-primary" onClick={() => openModal()}>
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <div key={trip._id} className="trip-card">
                <div className="trip-header">
                  <h3 className="trip-title">{trip.title}</h3>
                  <div className="trip-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => openModal(trip)}
                      title="Edit trip"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.293-6.293z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(trip._id)}
                      title="Delete trip"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="trip-destination">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                  </svg>
                  {trip.destination}
                </div>

                <div className="trip-dates">
                  <div className="date-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/>
                    </svg>
                    <span>{formatDate(trip.startDate)}</span>
                  </div>
                  <span className="date-separator">→</span>
                  <div className="date-item">
                    <span>{formatDate(trip.endDate)}</span>
                  </div>
                </div>

                {calculateDuration(trip.startDate, trip.endDate) && (
                  <div className="trip-duration">
                    {calculateDuration(trip.startDate, trip.endDate)}
                  </div>
                )}

                {trip.budget > 0 && (
                  <div className="trip-budget">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                    </svg>
                    ${trip.budget.toLocaleString()}
                  </div>
                )}

                {trip.description && (
                  <p className="trip-description">{trip.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTrip ? 'Edit Trip' : 'Create New Trip'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Trip Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Vacation 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="destination">Destination *</label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={destinationInput}
                    onChange={handleDestinationInputChange}
                    placeholder="Start typing a destination (e.g., Paris, France)..."
                    required
                    className="autocomplete-input"
                  />
                  {searchingDestination && (
                    <div className="autocomplete-loading">Searching...</div>
                  )}
                  {destinationSuggestions.length > 0 && (
                    <ul className="autocomplete-suggestions">
                      {destinationSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.place_id}
                          onClick={() => selectDestination(suggestion)}
                          className="autocomplete-item"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                          </svg>
                          {suggestion.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="originCountry">País de Origen</label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    id="originCountry"
                    name="originCountry"
                    value={originCountryInput}
                    onChange={handleOriginCountryInputChange}
                    placeholder="Empieza a escribir un país (e.g., Perú, Colombia)..."
                    className="autocomplete-input"
                  />
                  {originCountrySuggestions.length > 0 && (
                    <ul className="autocomplete-suggestions">
                      {originCountrySuggestions.map((country) => (
                        <li
                          key={country}
                          onClick={() => selectOriginCountry(country)}
                          className="autocomplete-item"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M0 8a8 8 0 1116 0A8 8 0 010 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855-.143.268-.276.56-.395.872.705.157 1.472.257 2.282.287V1.077zM4.249 3.539c.142-.384.304-.744.481-1.078a6.7 6.7 0 011.597.654 3.5 3.5 0 01-.597.932 8.9 8.9 0 00-1.481-.508zM3.509 7.5c.036-1.07.188-2.087.436-3.008a9.124 9.124 0 011.565.667c-.12.253-.23.51-.329.772-.165.442-.293.905-.376 1.388-.943.07-1.865.267-2.704.582.08-.452.171-.9.272-1.347a.5.5 0 01.136-.054zm-.61 2.5c.263.072.533.135.809.187a9.001 9.001 0 01.375-1.512c-.669.105-1.32.272-1.947.507.26.294.533.57.818.818-.018.002-.036.004-.055.006zM8.5 1.077v2.114c.81-.03 1.577-.13 2.282-.287-.12-.312-.252-.604-.395-.872C9.835 1.897 9.17 1.282 8.5 1.077zM10.249 3.539c.142.384.304.744.481 1.078a6.7 6.7 0 001.597-.654 3.5 3.5 0 00-.597-.932 8.9 8.9 0 01-1.481.508zm1.242 1.961c.233.377.45.772.644 1.184.165.348.313.713.441 1.093a9.001 9.001 0 011.565-.667c-.12-.253-.23-.51-.329-.772a8.964 8.964 0 00-.376-1.388 9.124 9.124 0 00-1.945-.45zm.943 4.5c-.263-.072-.533-.135-.809-.187a9.001 9.001 0 00-.375 1.512c.669-.105 1.32-.272 1.947-.507a8.538 8.538 0 01-.818-.818l.055-.006zM8.5 8.5v6.923c.67-.204 1.335-.82 1.887-1.855.143-.268.276-.56.395-.872A12.63 12.63 0 018.5 11.91V8.5zm3.753-.93c-.142.384-.304.744-.481 1.078a6.7 6.7 0 00-1.597-.654c.196-.332.371-.676.525-1.032.165-.375.293-.77.376-1.176.943-.07 1.865-.267 2.704-.582-.08.452-.171.9-.272 1.347a.5.5 0 00-.136.054c.018.006.036.01.055.015-.245.297-.497.576-.763.832-.027.024-.053.047-.08.071a8.9 8.9 0 01-1.331.047z"/>
                          </svg>
                          {country}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget (USD)</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Currency Converter */}
              <CurrencySelector 
                sourceCurrency={currencyData.sourceCurrency}
                targetCurrency={currencyData.targetCurrency}
                budget={formData.budget}
                destination={formData.destination}
                onCurrencyChange={handleCurrencyChange}
              />

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add notes about your trip..."
                  rows="4"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTrip ? 'Update Trip' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
