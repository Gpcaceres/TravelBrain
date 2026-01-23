import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { destinationService } from '../services/destinationService'
import { API_KEYS, API_ENDPOINTS } from '../config/apiKeys'
import '../styles/Destinations.css'

export default function Destinations() {
  const { getUser, logout } = useAuth()
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser())
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [placeSearchQuery, setPlaceSearchQuery] = useState('')
  const [placeSearchResults, setPlaceSearchResults] = useState([])
  const [searchingPlaces, setSearchingPlaces] = useState(false)
  const [selectedOrigin, setSelectedOrigin] = useState(null)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [distanceInfo, setDistanceInfo] = useState(null)
  const [calculatingDistance, setCalculatingDistance] = useState(false)
  const [routeOptions, setRouteOptions] = useState([]) // Multiple route options
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0) // Currently selected route
  const [originInput, setOriginInput] = useState('')
  const [destinationInput, setDestinationInput] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [searchingOrigin, setSearchingOrigin] = useState(false)
  const [searchingDestination, setSearchingDestination] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const routeLineRef = useRef(null)
  const originTimeoutRef = useRef(null)
  const destinationTimeoutRef = useRef(null)
  const modalSearchTimeoutRef = useRef(null)
  
  const [modalPlaceInput, setModalPlaceInput] = useState('')
  const [modalPlaceSuggestions, setModalPlaceSuggestions] = useState([])
  const [searchingModalPlaces, setSearchingModalPlaces] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    lat: '',
    lng: '',
    img: '',
    rating: 0,
    review: ''
  })

  useEffect(() => {
    loadDestinations()
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.user-menu')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      if (typeof window.L !== 'undefined') return
      
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        // Leaflet is now loaded
        if (mapRef.current && !mapInstanceRef.current) {
          initializeMap()
        }
      }
      document.head.appendChild(script)
    }
    
    loadLeaflet()
    
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenu])
  
  const initializeMap = () => {
    if (mapInstanceRef.current) return
    
    const L = window.L
    if (!L || !mapRef.current) return
    
    // Wait for container to be visible
    setTimeout(() => {
      try {
        const map = L.map(mapRef.current).setView([20, 0], 2)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map)
        
        mapInstanceRef.current = map
        
        // Force resize
        setTimeout(() => {
          if (map) map.invalidateSize()
        }, 100)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }, 100)
  }
  
  useEffect(() => {
    // Only update map if we have all required data with valid coordinates
    if (
      distanceInfo && 
      selectedOrigin && 
      selectedDestination && 
      selectedOrigin.lat !== undefined && 
      selectedOrigin.lng !== undefined &&
      selectedDestination.lat !== undefined &&
      selectedDestination.lng !== undefined
    ) {
      // Wait for Leaflet to be loaded
      if (typeof window.L !== 'undefined') {
        // Wait a bit to ensure the container is rendered
        setTimeout(() => {
          if (mapRef.current) {
            if (!mapInstanceRef.current) {
              initializeMap()
              // Wait for map initialization
              setTimeout(() => updateMapRoute(), 600)
            } else {
              updateMapRoute()
            }
          }
        }, 200)
      }
    }
  }, [distanceInfo, selectedOrigin, selectedDestination])
  
  const updateMapRoute = () => {
    const L = window.L
    if (!L) {
      console.warn('Leaflet not loaded yet')
      return
    }
    
    // Validate we have the map instance
    const map = mapInstanceRef.current
    if (!map) {
      console.warn('Map instance not available')
      return
    }
    
    // Validate we have valid coordinates
    if (!selectedOrigin || !selectedDestination || 
        selectedOrigin.lat === undefined || selectedOrigin.lng === undefined ||
        selectedDestination.lat === undefined || selectedDestination.lng === undefined) {
      console.warn('Invalid coordinates for origin or destination')
      return
    }
    
    try {
      // Force resize to ensure map is visible
      map.invalidateSize()
      
      // Clear previous markers and route
      markersRef.current.forEach(marker => {
        try {
          map.removeLayer(marker)
        } catch (e) {
          console.warn('Error removing marker:', e)
        }
      })
      if (routeLineRef.current) {
        try {
          // Handle both single route and array of routes
          if (Array.isArray(routeLineRef.current)) {
            routeLineRef.current.forEach(route => map.removeLayer(route))
          } else {
            map.removeLayer(routeLineRef.current)
          }
        } catch (e) {
          console.warn('Error removing route:', e)
        }
      }
      markersRef.current = []
      
      // Validate coordinates are numbers
      const originLat = Number(selectedOrigin.lat)
      const originLng = Number(selectedOrigin.lng)
      const destLat = Number(selectedDestination.lat)
      const destLng = Number(selectedDestination.lng)
      
      if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
        console.error('Invalid coordinate values')
        return
      }
      
      // Add origin marker (green)
      const originMarker = L.marker([originLat, originLng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: #47F59A; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="color: #1a1a1a; font-weight: bold; font-size: 18px;">A</span></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map).bindPopup(`<b>Origin:</b> ${selectedOrigin.name}`)
      
      // Add destination marker (pink)
      const destMarker = L.marker([destLat, destLng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: #F547A7; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="color: white; font-weight: bold; font-size: 18px;">B</span></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
      }).addTo(map).bindPopup(`<b>Destination:</b> ${selectedDestination.name}`)
      
      markersRef.current.push(originMarker, destMarker)
      
      // Draw route segments with different styles
      const segments = distanceInfo?.segments || []
      
      if (segments.length === 0) {
        // Fallback to simple line
        const routeLine = L.polyline(
          [[originLat, originLng], [destLat, destLng]],
          {
            color: '#34D399',
            weight: 5,
            opacity: 0.8
          }
        ).addTo(map)
        routeLineRef.current = [routeLine]
      } else {
        // Draw each segment with appropriate style
        const routeLines = []
        
        segments.forEach((segment, index) => {
          let routeStyle = {}
          let segmentIcon = ''
          
          switch(segment.type) {
            case 'air':
              routeStyle = {
                color: '#4285F4',
                weight: 4,
                opacity: 0.7,
                dashArray: '1, 10',
                className: 'air-route'
              }
              segmentIcon = '✈️'
              break
            case 'sea':
              routeStyle = {
                color: '#0D9488',
                weight: 5,
                opacity: 0.7,
                dashArray: '5, 5, 1, 5',
                className: 'sea-route'
              }
              segmentIcon = '🚢'
              break
            default: // ground
              routeStyle = {
                color: '#34D399',
                weight: 5,
                opacity: 0.8,
                dashArray: '',
                className: 'ground-route'
              }
              segmentIcon = '🚗'
          }
          
          // Draw segment line
          const segmentLine = L.polyline(
            segment.coordinates,
            routeStyle
          ).addTo(map)
          
          // Add popup to segment
          if (segment.label) {
            const midIndex = Math.floor(segment.coordinates.length / 2)
            const midPoint = segment.coordinates[midIndex]
            
            const segmentMarker = L.marker(midPoint, {
              icon: L.divIcon({
                className: 'segment-icon',
                html: `<div style="background: white; padding: 4px 8px; border-radius: 12px; border: 2px solid ${routeStyle.color}; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 16px; white-space: nowrap;">${segmentIcon} ${segment.label}</div>`,
                iconSize: [80, 30],
                iconAnchor: [40, 15]
              })
            }).addTo(map)
            
            markersRef.current.push(segmentMarker)
          }
          
          routeLines.push(segmentLine)
        })
        
        routeLineRef.current = routeLines
        
        // Add overall transport icon at midpoint
        const allCoords = segments.flatMap(s => s.coordinates)
        const midIndex = Math.floor(allCoords.length / 2)
        const midPoint = allCoords[midIndex]
        
        let mainIcon = '🚗'
        if (distanceInfo.transportType === 'air') mainIcon = '✈️'
        else if (distanceInfo.transportType === 'sea') mainIcon = '🚢'
        else if (distanceInfo.transportType === 'mixed') mainIcon = '🌐'
        
        const transportMarker = L.marker(midPoint, {
          icon: L.divIcon({
            className: 'transport-icon',
            html: `<div style="background: white; padding: 8px 12px; border-radius: 20px; border: 3px solid #47F59A; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 24px;">${mainIcon}</div>`,
            iconSize: [50, 50],
            iconAnchor: [25, 25]
          })
        }).addTo(map).bindPopup(`
          <div style="text-align: center;">
            <b>${mainIcon} ${distanceInfo.transportType.charAt(0).toUpperCase() + distanceInfo.transportType.slice(1)} Route</b><br/>
            <span style="color: #666;">Total Distance: ${distanceInfo.distance}</span><br/>
            <span style="color: #666;">Total Duration: ${distanceInfo.duration}</span><br/>
            <span style="color: #999; font-size: 12px;">${segments.length} segment(s)</span>
          </div>
        `)
        
        markersRef.current.push(transportMarker)
      }
      
      // Fit map to show entire route
      if (segments.length > 0) {
        // Create bounds from all segment coordinates
        const allCoords = segments.flatMap(s => s.coordinates)
        const bounds = L.latLngBounds(allCoords)
        map.fitBounds(bounds, { padding: [50, 50] })
      } else {
        // Fallback to origin and destination
        const bounds = L.latLngBounds(
          [originLat, originLng],
          [destLat, destLng]
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
      
      console.log('Map route updated successfully')
    } catch (error) {
      console.error('Error updating map route:', error)
    }
  }

  const loadDestinations = async () => {
    try {
      setLoading(true)
      const data = await destinationService.getAllDestinations()
      setDestinations(data)
    } catch (error) {
      console.error('Error loading destinations:', error)
      setMessage({ type: 'error', text: 'Failed to load destinations' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const searchPlaces = async () => {
    if (!placeSearchQuery.trim()) return

    setSearchingPlaces(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004'
      const response = await fetch(
        `${API_URL}/api/routing/geocode?q=${encodeURIComponent(placeSearchQuery)}&limit=5`
      )
      
      if (!response.ok) throw new Error('Failed to search places')
      
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      
      const results = result.data.map(item => ({
        name: item.display_name,
        formatted_address: item.display_name,
        geometry: {
          location: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          }
        },
        place_id: item.place_id
      }))
      setPlaceSearchResults(results)
    } catch (error) {
      console.error('Error searching places:', error)
      setMessage({ type: 'error', text: 'Failed to search places. Please try again.' })
    } finally {
      setSearchingPlaces(false)
    }
  }

  const handleLogout = () => {
    setShowMenu(false)
    logout()
    navigate('/login')
  }

  const searchOriginSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setOriginSuggestions([])
      return
    }

    setSearchingOrigin(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004'
      const response = await fetch(
        `${API_URL}/api/routing/geocode?q=${encodeURIComponent(query)}&limit=5`
      )
      
      if (!response.ok) throw new Error('Failed to search places')
      
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      
      const results = result.data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        place_id: item.place_id
      }))
      setOriginSuggestions(results)
    } catch (error) {
      console.error('Error searching origin:', error)
    } finally {
      setSearchingOrigin(false)
    }
  }

  const searchDestinationSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setDestinationSuggestions([])
      return
    }

    setSearchingDestination(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004'
      const response = await fetch(
        `${API_URL}/api/routing/geocode?q=${encodeURIComponent(query)}&limit=5`
      )
      
      if (!response.ok) throw new Error('Failed to search places')
      
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      
      const results = result.data.map(item => ({
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

  const handleOriginInputChange = (e) => {
    const value = e.target.value
    setOriginInput(value)
    
    // Clear previous timeout
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current)
    }
    
    // Set new timeout for debouncing
    originTimeoutRef.current = setTimeout(() => {
      searchOriginSuggestions(value)
    }, 500)
  }

  const handleDestinationInputChange = (e) => {
    const value = e.target.value
    setDestinationInput(value)
    
    // Clear previous timeout
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current)
    }
    
    // Set new timeout for debouncing
    destinationTimeoutRef.current = setTimeout(() => {
      searchDestinationSuggestions(value)
    }, 500)
  }

  const selectOrigin = (suggestion) => {
    setSelectedOrigin({
      id: suggestion.place_id,
      name: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng
    })
    setOriginInput(suggestion.name)
    setOriginSuggestions([])
  }

  const selectDestinationPlace = (suggestion) => {
    setSelectedDestination({
      id: suggestion.place_id,
      name: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng
    })
    setDestinationInput(suggestion.name)
    setDestinationSuggestions([])
  }

  const selectPlace = (place) => {
    setFormData({
      ...formData,
      name: place.name || place.formatted_address.split(',')[0],
      country: place.formatted_address.split(',').slice(-1)[0].trim(),
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng
    })
    setPlaceSearchResults([])
    setPlaceSearchQuery('')
  }

  const calculateDistance = async () => {
    if (!selectedOrigin || !selectedDestination) {
      setMessage({ type: 'error', text: 'Please select both origin and destination' })
      return
    }

    setCalculatingDistance(true)
    setRouteOptions([])
    setSelectedRouteIndex(0)
    
    try {
      // Calculate straight-line distance first
      const R = 6371 // Earth radius in km
      const dLat = (selectedDestination.lat - selectedOrigin.lat) * Math.PI / 180
      const dLon = (selectedDestination.lng - selectedOrigin.lng) * Math.PI / 180
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(selectedOrigin.lat * Math.PI / 180) * Math.cos(selectedDestination.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      const straightDistance = R * c

      const options = []

      // Detect if route crosses ocean
      const needsSeaRoute = detectOceanCrossing(selectedOrigin, selectedDestination, straightDistance)
      
      if (needsSeaRoute) {
        // Option 1: Multimodal (land + sea + land)
        const multimodalRoute = await calculateMultimodalRoute(selectedOrigin, selectedDestination, straightDistance)
        options.push({
          ...multimodalRoute,
          name: '🌐 Multimodal (Land + Sea)',
          description: 'Combination of ground and sea travel'
        })
        
        // Option 2: Air (always available)
        const curvedAirPath = generateCurvedPath(
          [selectedOrigin.lat, selectedOrigin.lng],
          [selectedDestination.lat, selectedDestination.lng],
          50
        )
        options.push({
          distance: straightDistance,
          duration: straightDistance / 800,
          transportType: 'air',
          segments: [{
            type: 'air',
            coordinates: curvedAirPath,
            distance: straightDistance,
            label: 'Direct Flight'
          }],
          name: '✈️ Air Travel',
          description: 'Fastest option'
        })
      } else {
        // Option 1: Ground route (ALWAYS calculate, regardless of distance)
        const drivingRoute = await calculateDrivingRoute(selectedOrigin, selectedDestination)
        if (drivingRoute) {
          options.push({
            ...drivingRoute,
            name: '🚗 Ground Travel',
            description: `By road (${Math.ceil(drivingRoute.duration * 24)} hours)`
          })
        } else {
          // Fallback to curved ground path
          const curvedPath = generateCurvedPath(
            [selectedOrigin.lat, selectedOrigin.lng],
            [selectedDestination.lat, selectedDestination.lng],
            Math.min(straightDistance * 2, 80)
          )
          const roadDistance = straightDistance * 1.4 // Add 40% for winding roads
          options.push({
            distance: roadDistance,
            duration: roadDistance / 80,
            transportType: 'ground',
            segments: [{
              type: 'ground',
              coordinates: curvedPath,
              distance: roadDistance,
              label: 'Estimated Road Route'
            }],
            name: '🚗 Ground Travel',
            description: `By road (approx. ${Math.ceil((roadDistance / 80) * 24)} hours)`
          })
        }
        
        // Option 2: Air route (for distances > 300 km)
        if (straightDistance > 300) {
          const curvedAirPath = generateCurvedPath(
            [selectedOrigin.lat, selectedOrigin.lng],
            [selectedDestination.lat, selectedDestination.lng],
            50
          )
          options.push({
            distance: straightDistance,
            duration: straightDistance / 800,
            transportType: 'air',
            segments: [{
              type: 'air',
              coordinates: curvedAirPath,
              distance: straightDistance,
              label: 'Flight Route'
            }],
            name: '✈️ Air Travel',
            description: `Direct flight (${Math.ceil((straightDistance / 800) * 60)} min)`
          })
        }
      }

      setRouteOptions(options)
      
      // Set first option as default
      if (options.length > 0) {
        const firstRoute = options[0]
        const hours = Math.floor(firstRoute.duration)
        const minutes = Math.round((firstRoute.duration - hours) * 60)

        setDistanceInfo({
          distance: `${firstRoute.distance.toFixed(2)} km`,
          duration: `${hours}h ${minutes}m`,
          origin: selectedOrigin.name,
          destination: selectedDestination.name,
          transportType: firstRoute.transportType,
          distanceKm: firstRoute.distance,
          segments: firstRoute.segments
        })
      }
      
      if (mapRef.current && !mapInstanceRef.current && typeof window.L !== 'undefined') {
        initializeMap()
      }
    } catch (error) {
      console.error('Error calculating distance:', error)
      setMessage({ type: 'error', text: 'Failed to calculate route. Please try again.' })
    } finally {
      setCalculatingDistance(false)
    }
  }
  
  // Switch between route options
  const selectRouteOption = (index) => {
    if (index < 0 || index >= routeOptions.length) return
    
    setSelectedRouteIndex(index)
    const route = routeOptions[index]
    
    const hours = Math.floor(route.duration)
    const minutes = Math.round((route.duration - hours) * 60)

    setDistanceInfo({
      distance: `${route.distance.toFixed(2)} km`,
      duration: `${hours}h ${minutes}m`,
      origin: selectedOrigin.name,
      destination: selectedDestination.name,
      transportType: route.transportType,
      distanceKm: route.distance,
      segments: route.segments
    })
  }
  
  // Detect if route crosses a major ocean
  const detectOceanCrossing = (origin, dest, distance) => {
    const latDiff = Math.abs(dest.lat - origin.lat)
    const lonDiff = Math.abs(dest.lng - origin.lng)
    
    // Check for transoceanic routes
    // Atlantic: Europe <-> Americas
    if ((origin.lng < -30 && dest.lng > 0) || (dest.lng < -30 && origin.lng > 0)) {
      if (Math.abs(origin.lng - dest.lng) > 50 && distance > 4000) {
        return true // Atlantic crossing
      }
    }
    
    // Pacific: Americas <-> Asia/Oceania
    if ((origin.lng < -100 && dest.lng > 100) || (dest.lng < -100 && origin.lng > 100)) {
      return true // Pacific crossing
    }
    
    // Check if both points are on different continents with large distance
    if (distance > 3000 && lonDiff > 40) {
      return true
    }
    
    return false
  }
  
  // Calculate driving route using backend proxy (avoids CORS)
  const calculateDrivingRoute = async (origin, dest) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004'
      const response = await fetch(
        `${API_URL}/api/routing/directions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            start: `${origin.lng},${origin.lat}`,
            end: `${dest.lng},${dest.lat}`,
            profile: 'driving-car'
          })
        }
      )
      
      const result = await response.json()
      
      if (!result.success || result.fallback) {
        console.warn('Routing API failed or unavailable, using fallback')
        return null
      }
      
      const data = result.data
      const route = data.features[0]
      const distanceKm = route.properties.summary.distance / 1000
      const durationHours = route.properties.summary.duration / 3600
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]) // Swap to [lat, lng]
      
      return {
        distance: distanceKm,
        duration: durationHours,
        transportType: 'ground',
        segments: [{
          type: 'ground',
          coordinates: coordinates,
          distance: distanceKm
        }]
      }
    } catch (error) {
      console.error('Error fetching driving route:', error)
      return null
    }
  }
  
  // Calculate multimodal route (ground + sea + ground)
  const calculateMultimodalRoute = async (origin, dest, straightDistance) => {
    // Major port coordinates (simplified database)
    const ports = {
      // European ports
      'rotterdam': { lat: 51.9225, lng: 4.47917, name: 'Rotterdam' },
      'barcelona': { lat: 41.3851, lng: 2.1734, name: 'Barcelona' },
      'hamburg': { lat: 53.5511, lng: 9.9937, name: 'Hamburg' },
      
      // American ports (East)
      'new_york': { lat: 40.7128, lng: -74.0060, name: 'New York' },
      'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami' },
      'halifax': { lat: 44.6488, lng: -63.5752, name: 'Halifax' },
      
      // American ports (West)
      'los_angeles': { lat: 33.7405, lng: -118.2669, name: 'Los Angeles' },
      'san_francisco': { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
      'vancouver': { lat: 49.2827, lng: -123.1207, name: 'Vancouver' },
      
      // South American ports
      'guayaquil': { lat: -2.1961, lng: -79.8862, name: 'Guayaquil' },
      'cartagena': { lat: 10.3997, lng: -75.5144, name: 'Cartagena' },
      'buenos_aires': { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires' },
      
      // Asian ports
      'singapore': { lat: 1.2897, lng: 103.8501, name: 'Singapore' },
      'shanghai': { lat: 31.2304, lng: 121.4737, name: 'Shanghai' },
      'tokyo': { lat: 35.6762, lng: 139.6503, name: 'Tokyo' }
    }
    
    // Find nearest ports to origin and destination
    const originPort = findNearestPort(origin, Object.values(ports))
    const destPort = findNearestPort(dest, Object.values(ports))
    
    const segments = []
    let totalDistance = 0
    let totalDuration = 0
    
    // Segment 1: Ground route to origin port
    const toPortRoute = await calculateDrivingRoute(origin, originPort)
    if (toPortRoute && toPortRoute.segments && toPortRoute.segments[0]) {
      segments.push({
        type: 'ground',
        coordinates: toPortRoute.segments[0].coordinates,
        distance: toPortRoute.distance,
        label: `Drive to ${originPort.name} Port`
      })
      totalDistance += toPortRoute.distance
      totalDuration += toPortRoute.duration
    } else {
      // Fallback to curved approximation
      const dist = calculateHaversine(origin, originPort)
      const curvedPath = generateCurvedPath([origin.lat, origin.lng], [originPort.lat, originPort.lng], 20)
      segments.push({
        type: 'ground',
        coordinates: curvedPath,
        distance: dist,
        label: `Drive to ${originPort.name} Port`
      })
      totalDistance += dist
      totalDuration += dist / 80
    }
    
    // Segment 2: Sea route between ports
    const seaDistance = calculateHaversine(originPort, destPort)
    const seaPath = generateCurvedPath([originPort.lat, originPort.lng], [destPort.lat, destPort.lng], 50)
    segments.push({
      type: 'sea',
      coordinates: seaPath,
      distance: seaDistance,
      label: `${originPort.name} to ${destPort.name} (Sea)`
    })
    totalDistance += seaDistance
    totalDuration += seaDistance / 40 // Ship speed ~40 km/h
    
    // Segment 3: Ground route from destination port
    const fromPortRoute = await calculateDrivingRoute(destPort, dest)
    if (fromPortRoute && fromPortRoute.segments && fromPortRoute.segments[0]) {
      segments.push({
        type: 'ground',
        coordinates: fromPortRoute.segments[0].coordinates,
        distance: fromPortRoute.distance,
        label: `Drive from ${destPort.name} Port`
      })
      totalDistance += fromPortRoute.distance
      totalDuration += fromPortRoute.duration
    } else {
      const dist = calculateHaversine(destPort, dest)
      const curvedPath = generateCurvedPath([destPort.lat, destPort.lng], [dest.lat, dest.lng], 20)
      segments.push({
        type: 'ground',
        coordinates: curvedPath,
        distance: dist,
        label: `Drive from ${destPort.name} Port`
      })
      totalDistance += dist
      totalDuration += dist / 80
    }
    
    return {
      distance: totalDistance,
      duration: totalDuration,
      transportType: 'mixed',
      segments: segments
    }
  }
  
  // Helper: Find nearest port
  const findNearestPort = (location, ports) => {
    let nearest = ports[0]
    let minDist = calculateHaversine(location, ports[0])
    
    for (let port of ports) {
      const dist = calculateHaversine(location, port)
      if (dist < minDist) {
        minDist = dist
        nearest = port
      }
    }
    
    return nearest
  }
  
  // Helper: Haversine distance calculation
  const calculateHaversine = (point1, point2) => {
    const R = 6371
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLon = (point2.lng - point1.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  // Helper: Generate curved path between two points (more realistic than straight line)
  const generateCurvedPath = (start, end, numPoints = 30) => {
    const path = []
    const [startLat, startLng] = start
    const [endLat, endLng] = end
    
    // Calculate control point for bezier curve (offset perpendicular to line)
    const midLat = (startLat + endLat) / 2
    const midLng = (startLng + endLng) / 2
    const dx = endLng - startLng
    const dy = endLat - startLat
    const distance = Math.sqrt(dx * dx + dy * dy)
    const curvature = distance * 0.15 // 15% curvature
    
    // Perpendicular offset
    const offsetLat = -dx / distance * curvature
    const offsetLng = dy / distance * curvature
    const controlLat = midLat + offsetLat
    const controlLng = midLng + offsetLng
    
    // Generate points along quadratic bezier curve
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const t2 = t * t
      const mt = 1 - t
      const mt2 = mt * mt
      
      const lat = mt2 * startLat + 2 * mt * t * controlLat + t2 * endLat
      const lng = mt2 * startLng + 2 * mt * t * controlLng + t2 * endLng
      
      path.push([lat, lng])
    }
    
    return path
  }
  
  // OLD FUNCTION REMOVED
  const determineTransportType = (distance, origin, dest) => {
    if (distance > 500) {
      const latDiff = Math.abs(dest.lat - origin.lat)
      const lonDiff = Math.abs(dest.lng - origin.lng)
      
      if (distance > 2000 && (latDiff > 20 || lonDiff > 30)) {
        if (Math.abs(lonDiff) > 40) {
          return 'mixed'
        }
        return 'air'
      }
      return 'air'
    } else if (distance > 200 && distance <= 500) {
      return 'ground'
    } else {
      return 'ground'
    }
  }

  const openModal = (destination = null) => {
    if (destination) {
      setEditingDestination(destination)
      setFormData({
        name: destination.name,
        country: destination.country,
        description: destination.description || '',
        lat: destination.lat || '',
        lng: destination.lng || '',
        img: destination.img || '',
        rating: destination.rating || 0,
        review: destination.review || ''
      })
    } else {
      setEditingDestination(null)
      setFormData({
        name: '',
        country: '',
        description: '',
        lat: '',
        lng: '',
        img: '',
        rating: 0,
        review: ''
      })
    }
    setModalPlaceInput('')
    setModalPlaceSuggestions([])
    setPlaceSearchResults([])
    setShowModal(true)
    setMessage({ type: '', text: '' })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDestination(null)
    setModalPlaceInput('')
    setModalPlaceSuggestions([])
    setPlaceSearchResults([])
    setFormData({
      name: '',
      country: '',
      description: '',
      lat: '',
      lng: '',
      img: '',
      rating: 0,
      review: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const destinationData = {
        ...formData,
        userId: user._id,
        lat: formData.lat ? parseFloat(formData.lat) : 0,
        lng: formData.lng ? parseFloat(formData.lng) : 0,
        rating: formData.rating ? parseFloat(formData.rating) : 0
      }

      if (editingDestination) {
        await destinationService.updateDestination(editingDestination._id, destinationData)
        setMessage({ type: 'success', text: 'Destination updated successfully!' })
      } else {
        await destinationService.createDestination(destinationData)
        setMessage({ type: 'success', text: 'Destination added successfully!' })
      }

      closeModal()
      loadDestinations()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save destination' 
      })
    }
  }

  const handleDelete = async (destinationId) => {
    if (!window.confirm('Are you sure you want to delete this destination?')) return

    try {
      await destinationService.deleteDestination(destinationId)
      setMessage({ type: 'success', text: 'Destination deleted successfully!' })
      loadDestinations()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to delete destination' 
      })
    }
  }

  // Modal Place Autocomplete Functions
  const searchModalPlaceSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setModalPlaceSuggestions([])
      return
    }

    setSearchingModalPlaces(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004'
      const response = await fetch(
        `${API_URL}/api/routing/geocode?q=${encodeURIComponent(query)}&limit=5`
      )
      
      if (!response.ok) throw new Error('Failed to search places')
      
      const result = await response.json()
      if (!result.success) throw new Error(result.message)
      
      const results = result.data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        place_id: item.place_id
      }))
      setModalPlaceSuggestions(results)
    } catch (error) {
      console.error('Error searching modal places:', error)
    } finally {
      setSearchingModalPlaces(false)
    }
  }

  const handleModalPlaceInputChange = (e) => {
    const value = e.target.value
    setModalPlaceInput(value)
    
    // Clear previous timeout
    if (modalSearchTimeoutRef.current) {
      clearTimeout(modalSearchTimeoutRef.current)
    }
    
    // Set new timeout for debouncing
    modalSearchTimeoutRef.current = setTimeout(() => {
      searchModalPlaceSuggestions(value)
    }, 500)
  }

  const selectModalPlace = (place) => {
    // Extract location name and country from the display name
    const parts = place.name.split(',').map(p => p.trim())
    const locationName = parts[0]
    const country = parts.length > 1 ? parts[parts.length - 1] : ''

    setFormData({
      ...formData,
      name: locationName,
      country: country,
      lat: place.lat,
      lng: place.lng
    })
    setModalPlaceInput(place.name)
    setModalPlaceSuggestions([])
  }

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="destinations-page">
      {/* Navbar */}
      <nav className="destinations-navbar">
        <div className="container navbar-content">
          <div className="navbar-left">
            <img src="/assets/images/logo.png" alt="Logo" className="navbar-logo" />
            <span className="navbar-brand">TravelBrain</span>
          </div>
          
          <div className="navbar-center">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/trips" className="nav-link">My Trips</Link>
            <Link to="/itineraries" className="nav-link">Itineraries</Link>
            <Link to="/destinations" className="nav-link active">Destinations</Link>
            <Link to="/weather" className="nav-link">Weather</Link>
          </div>

          <div className="navbar-right">
            <div className="user-menu">
              <button 
                className="user-menu-btn"
                onClick={() => setShowMenu(!showMenu)}
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

      {/* Main Content */}
      <div className="container destinations-container">
        {/* Header */}
        <div className="destinations-header">
          <div>
            <h1 className="destinations-title">Explore Destinations</h1>
            <p className="destinations-subtitle">Discover amazing places around the world</p>
          </div>
          <button className="btn-primary" onClick={() => openModal()}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z"/>
            </svg>
            Add Destination
          </button>
        </div>

        {/* Distance Calculator */}
        <section className="distance-calculator">
          <h2 className="calculator-title">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0z"/>
              <path d="M8 3.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H6a.5.5 0 010-1h1.5V4a.5.5 0 01.5-.5z"/>
            </svg>
            Calculate Distance Between Destinations
          </h2>
          
          <div className="calculator-grid">
            <div className="calculator-select">
              <label>Origin</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  value={originInput}
                  onChange={handleOriginInputChange}
                  placeholder="Type a city or place..."
                  className="autocomplete-input"
                />
                {searchingOrigin && (
                  <div className="autocomplete-loading">Searching...</div>
                )}
                {originSuggestions.length > 0 && (
                  <ul className="autocomplete-suggestions">
                    {originSuggestions.map((suggestion) => (
                      <li
                        key={suggestion.place_id}
                        onClick={() => selectOrigin(suggestion)}
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

            <div className="calculator-icon">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/>
              </svg>
            </div>

            <div className="calculator-select">
              <label>Destination</label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  value={destinationInput}
                  onChange={handleDestinationInputChange}
                  placeholder="Type a city or place..."
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
                        onClick={() => selectDestinationPlace(suggestion)}
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

            <button
              className="btn-calculate"
              onClick={calculateDistance}
              disabled={!selectedOrigin || !selectedDestination || calculatingDistance}
            >
              {calculatingDistance ? (
                <>
                  <div className="spinner-small"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
                    <path d="M5.255 5.786a.237.237 0 00.241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 00.25.246h.811a.25.25 0 00.25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  Calculate Distance
                </>
              )}
            </button>
          </div>

          {distanceInfo && (
            <div className="distance-result">
              {/* Route Options Selector */}
              {routeOptions.length > 1 && (
                <div className="route-options">
                  <h3 className="options-title">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M15.817.113A.5.5 0 0116 .5v14a.5.5 0 01-.402.49l-5 1a.502.502 0 01-.196 0L5.5 15.01l-4.902.98A.5.5 0 010 15.5v-14a.5.5 0 01.402-.49l5-1a.5.5 0 01.196 0L10.5.99l4.902-.98a.5.5 0 01.415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98l4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
                    </svg>
                    Choose Your Route
                  </h3>
                  <div className="route-options-grid">
                    {routeOptions.map((option, index) => (
                      <button
                        key={index}
                        className={`route-option-card ${selectedRouteIndex === index ? 'active' : ''}`}
                        onClick={() => selectRouteOption(index)}
                      >
                        <div className="option-header">
                          <span className="option-name">{option.name}</span>
                          {selectedRouteIndex === index && (
                            <span className="option-badge">Selected</span>
                          )}
                        </div>
                        <p className="option-description">{option.description}</p>
                        <div className="option-stats">
                          <span className="option-distance">{option.distance.toFixed(0)} km</span>
                          <span className="option-duration">
                            {Math.floor(option.duration)}h {Math.round((option.duration - Math.floor(option.duration)) * 60)}m
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="result-content">
                <div className="result-route">
                  <span className="route-point">{distanceInfo.origin}</span>
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/>
                  </svg>
                  <span className="route-point">{distanceInfo.destination}</span>
                </div>
                <div className="result-stats">
                  <div className="result-stat">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                    </svg>
                    <div>
                      <p className="stat-label">Distance</p>
                      <p className="stat-value">{distanceInfo.distance}</p>
                    </div>
                  </div>
                  <div className="result-stat">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 3.5a.5.5 0 01.5.5v4a.5.5 0 01-.5.5H6a.5.5 0 010-1h1.5V4a.5.5 0 01.5-.5z"/>
                      <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm0-1A7 7 0 108 1a7 7 0 000 14z"/>
                    </svg>
                    <div>
                      <p className="stat-label">Travel Time</p>
                      <p className="stat-value">{distanceInfo.duration}</p>
                    </div>
                  </div>
                  <div className="result-stat">
                    {distanceInfo.transportType === 'air' && (
                      <span style={{fontSize: '24px'}}>✈️</span>
                    )}
                    {distanceInfo.transportType === 'sea' && (
                      <span style={{fontSize: '24px'}}>🚢</span>
                    )}
                    {distanceInfo.transportType === 'ground' && (
                      <span style={{fontSize: '24px'}}>🚗</span>
                    )}
                    {distanceInfo.transportType === 'mixed' && (
                      <span style={{fontSize: '24px'}}>🌐</span>
                    )}
                    <div>
                      <p className="stat-label">Transport</p>
                      <p className="stat-value" style={{textTransform: 'capitalize'}}>
                        {distanceInfo.transportType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Route Map */}
              <div className="route-map-container">
                <div className="route-map-header">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M15.817.113A.5.5 0 0116 .5v14a.5.5 0 01-.402.49l-5 1a.502.502 0 01-.196 0L5.5 15.01l-4.902.98A.5.5 0 010 15.5v-14a.5.5 0 01.402-.49l5-1a.5.5 0 01.196 0L10.5.99l4.902-.98a.5.5 0 01.415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98l4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
                  </svg>
                  <h3>Route Visualization</h3>
                </div>
                <div ref={mapRef} className="route-map"></div>
                <div className="map-legend">
                  <div className="legend-item">
                    <span className="legend-marker" style={{background: '#47F59A'}}>A</span>
                    <span>Origin</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-marker" style={{background: '#F547A7'}}>B</span>
                    <span>Destination</span>
                  </div>
                </div>
                
                {/* Transport Type Legend */}
                <div className="route-legend">
                  <h4>🗺️ Transport Types</h4>
                  <div className="route-legend-item">
                    <div className="route-legend-line ground"></div>
                    <span>🚗 Ground ({distanceInfo.transportType === 'ground' ? '✓' : ''})</span>
                  </div>
                  <div className="route-legend-item">
                    <div className="route-legend-line air"></div>
                    <span>✈️ Air Travel ({distanceInfo.transportType === 'air' ? '✓' : ''})</span>
                  </div>
                  <div className="route-legend-item">
                    <div className="route-legend-line sea"></div>
                    <span>🚢 Sea Travel ({distanceInfo.transportType === 'sea' ? '✓' : ''})</span>
                  </div>
                  <div className="route-legend-item">
                    <div className="route-legend-line mixed"></div>
                    <span>🌐 Mixed ({distanceInfo.transportType === 'mixed' ? '✓' : ''})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Search Bar */}
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search destinations by name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Message */}
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Destinations Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading destinations...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
            </svg>
            <h3>{searchTerm ? 'No destinations found' : 'No destinations yet'}</h3>
            <p>{searchTerm ? 'Try adjusting your search' : 'Start exploring the world!'}</p>
            {!searchTerm && (
              <button className="btn-primary" onClick={() => openModal()}>
                Add Your First Destination
              </button>
            )}
          </div>
        ) : (
          <div className="destinations-grid">
            {filteredDestinations.map((destination) => (
              <div key={destination._id} className="destination-card">
                <div className="destination-image">
                  {destination.img ? (
                    <img src={destination.img} alt={destination.name} />
                  ) : (
                    <div className="destination-placeholder">
                      <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                      </svg>
                    </div>
                  )}
                  <div className="destination-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => openModal(destination)}
                      title="Edit destination"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.293-6.293z"/>
                      </svg>
                    </button>
                    <button 
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDelete(destination._id)}
                      title="Delete destination"
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="destination-content">
                  <h3 className="destination-name">{destination.name}</h3>
                  <div className="destination-country">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16s6-5.686 6-10A6 6 0 002 6c0 4.314 6 10 6 10zm0-7a3 3 0 110-6 3 3 0 010 6z"/>
                    </svg>
                    {destination.country}
                  </div>
                  
                  {/* Rating Display */}
                  {destination.rating > 0 && (
                    <div className="destination-rating">
                      <div className="rating-stars-display">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star}
                            className={`star ${destination.rating >= star ? 'filled' : destination.rating >= star - 0.5 ? 'half-filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="rating-value">{destination.rating.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {destination.description && (
                    <p className="destination-description">{destination.description}</p>
                  )}
                  
                  {/* Review Display */}
                  {destination.review && (
                    <div className="destination-review">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.678 11.894a1 1 0 01.287.801 10.97 10.97 0 01-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 01.71-.074A8.06 8.06 0 008 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 01-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 00.244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 01-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                      </svg>
                      <p className="review-text">{destination.review}</p>
                    </div>
                  )}
                </div>
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
              <h2>{editingDestination ? 'Edit Destination' : 'Add New Destination'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Place Search with Autocomplete */}
              <div className="place-search-section">
                <label>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/>
                  </svg>
                  Search Places (Start typing for suggestions)
                </label>
                <div className="autocomplete-wrapper">
                  <input
                    type="text"
                    value={modalPlaceInput}
                    onChange={handleModalPlaceInputChange}
                    placeholder="Type a place name (e.g., Eiffel Tower, Tokyo)..."
                    className="autocomplete-input"
                  />
                  {searchingModalPlaces && (
                    <div className="autocomplete-loading">Searching...</div>
                  )}
                  {modalPlaceSuggestions.length > 0 && (
                    <ul className="autocomplete-suggestions">
                      {modalPlaceSuggestions.map((suggestion) => (
                        <li
                          key={suggestion.place_id}
                          onClick={() => selectModalPlace(suggestion)}
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

              <div className="form-divider">
                <span>Or enter manually</span>
              </div>

              <div className="form-group">
                <label htmlFor="name">Destination Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Eiffel Tower"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="e.g., France"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lat">Latitude *</label>
                  <input
                    type="number"
                    id="lat"
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="48.8584"
                    step="any"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lng">Longitude *</label>
                  <input
                    type="number"
                    id="lng"
                    name="lng"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="2.2945"
                    step="any"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="img">Image URL</label>
                <input
                  type="url"
                  id="img"
                  name="img"
                  value={formData.img}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this destination..."
                  rows="4"
                />
              </div>

              {/* Rating */}
              <div className="form-group">
                <label htmlFor="rating">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '5px' }}>
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                  Rating (0-5 stars)
                </label>
                <div className="rating-input-container">
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star}
                        className={`star ${formData.rating >= star ? 'filled' : ''}`}
                        onClick={() => setFormData({...formData, rating: star})}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review */}
              <div className="form-group">
                <label htmlFor="review">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '5px' }}>
                    <path d="M2.678 11.894a1 1 0 01.287.801 10.97 10.97 0 01-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 01.71-.074A8.06 8.06 0 008 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 01-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 00.244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 01-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                  </svg>
                  Your Review
                </label>
                <textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleInputChange}
                  placeholder="Share your experience about this destination..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingDestination ? 'Update Destination' : 'Add Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
