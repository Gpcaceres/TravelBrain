const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');
const config = require('../config/env');

/**
 * Activity templates based on interest type and budget
 */
const activityTemplates = {
  'Cultura e Historia': {
    'Económico': [
      { title: 'Visita a museo local', cost: 15, type: 'morning' },
      { title: 'Tour por centro histórico', cost: 20, type: 'morning' },
      { title: 'Visita a iglesia histórica', cost: 5, type: 'morning' },
      { title: 'Mercado artesanal', cost: 10, type: 'afternoon' },
      { title: 'Galería de arte local', cost: 12, type: 'afternoon' },
      { title: 'Teatro comunitario', cost: 25, type: 'evening' }
    ],
    'Medio': [
      { title: 'Visita a biblioteca histórica', cost: 38, type: 'morning' },
      { title: 'Tour guiado por monumentos', cost: 45, type: 'morning' },
      { title: 'Museo de arte moderno', cost: 50, type: 'afternoon' },
      { title: 'Restaurante con vista panorámica', cost: 60, type: 'afternoon' },
      { title: 'Show cultural nocturno', cost: 55, type: 'evening' }
    ],
    'Alto': [
      { title: 'Tour privado museo nacional', cost: 150, type: 'morning' },
      { title: 'Visita a palacio histórico', cost: 180, type: 'morning' },
      { title: 'Almuerzo en restaurante histórico', cost: 120, type: 'afternoon' },
      { title: 'Experiencia gastronómica premium', cost: 200, type: 'afternoon' },
      { title: 'Ópera o concierto privado', cost: 250, type: 'evening' }
    ]
  },
  'Naturaleza y Aventura': {
    'Económico': [
      { title: 'Senderismo en parque natural', cost: 10, type: 'morning' },
      { title: 'Visita a mirador', cost: 8, type: 'morning' },
      { title: 'Picnic en área verde', cost: 15, type: 'afternoon' },
      { title: 'Observación de fauna local', cost: 20, type: 'afternoon' },
      { title: 'Caminata nocturna guiada', cost: 25, type: 'evening' }
    ],
    'Medio': [
      { title: 'Rafting en río', cost: 65, type: 'morning' },
      { title: 'Tour en bicicleta de montaña', cost: 55, type: 'morning' },
      { title: 'Canopy o tirolesa', cost: 70, type: 'afternoon' },
      { title: 'Kayak en lago', cost: 50, type: 'afternoon' },
      { title: 'Camping con fogata', cost: 45, type: 'evening' }
    ],
    'Alto': [
      { title: 'Vuelo en parapente', cost: 200, type: 'morning' },
      { title: 'Safari fotográfico privado', cost: 280, type: 'morning' },
      { title: 'Buceo o snorkel premium', cost: 220, type: 'afternoon' },
      { title: 'Tour en helicóptero', cost: 350, type: 'afternoon' },
      { title: 'Cena bajo las estrellas en naturaleza', cost: 180, type: 'evening' }
    ]
  },
  'Gastronomía': {
    'Económico': [
      { title: 'Tour por mercado gastronómico', cost: 15, type: 'morning' },
      { title: 'Clase de cocina local', cost: 30, type: 'morning' },
      { title: 'Almuerzo en restaurante típico', cost: 25, type: 'afternoon' },
      { title: 'Degustación de café local', cost: 18, type: 'afternoon' },
      { title: 'Food tour nocturno', cost: 35, type: 'evening' }
    ],
    'Medio': [
      { title: 'Clase de cocina con chef', cost: 75, type: 'morning' },
      { title: 'Tour de viñedos', cost: 65, type: 'morning' },
      { title: 'Almuerzo en restaurante gourmet', cost: 85, type: 'afternoon' },
      { title: 'Degustación de vinos', cost: 70, type: 'afternoon' },
      { title: 'Cena maridaje de 5 tiempos', cost: 95, type: 'evening' }
    ],
    'Alto': [
      { title: 'Experiencia culinaria con chef estrella Michelin', cost: 250, type: 'morning' },
      { title: 'Tour gastronómico privado', cost: 200, type: 'morning' },
      { title: 'Almuerzo en restaurante exclusivo', cost: 180, type: 'afternoon' },
      { title: 'Clase de sommelier profesional', cost: 220, type: 'afternoon' },
      { title: 'Cena degustación premium', cost: 300, type: 'evening' }
    ]
  },
  'Deportes y Aventura': {
    'Económico': [
      { title: 'Clase de yoga al aire libre', cost: 15, type: 'morning' },
      { title: 'Partido de fútbol local', cost: 20, type: 'morning' },
      { title: 'Ciclismo urbano', cost: 25, type: 'afternoon' },
      { title: 'Escalada en rocódromo', cost: 30, type: 'afternoon' },
      { title: 'Partido de voleibol playero', cost: 18, type: 'evening' }
    ],
    'Medio': [
      { title: 'Clase de surf o paddle', cost: 60, type: 'morning' },
      { title: 'Escalada en roca natural', cost: 75, type: 'morning' },
      { title: 'Mountain bike en senderos', cost: 55, type: 'afternoon' },
      { title: 'Paracaidismo indoor', cost: 85, type: 'afternoon' },
      { title: 'Partido en estadio profesional', cost: 70, type: 'evening' }
    ],
    'Alto': [
      { title: 'Clase privada de golf', cost: 180, type: 'morning' },
      { title: 'Salto en paracaídas', cost: 250, type: 'morning' },
      { title: 'Vuelo en avioneta deportiva', cost: 300, type: 'afternoon' },
      { title: 'Buceo profesional certificado', cost: 220, type: 'afternoon' },
      { title: 'Experiencia VIP evento deportivo', cost: 280, type: 'evening' }
    ]
  }
};

/**
 * Generate daily schedule based on budget type
 */
const generateDailySchedule = (budgetType, activities, day) => {
  const schedules = {
    'Económico': [
      { time: '09:00', period: 'morning' },
      { time: '12:30', period: 'afternoon' },
      { time: '15:00', period: 'afternoon' },
      { time: '19:00', period: 'evening' }
    ],
    'Medio': [
      { time: '08:30', period: 'morning' },
      { time: '11:00', period: 'morning' },
      { time: '14:00', period: 'afternoon' },
      { time: '17:30', period: 'afternoon' },
      { time: '20:00', period: 'evening' }
    ],
    'Alto': [
      { time: '08:00', period: 'morning' },
      { time: '10:30', period: 'morning' },
      { time: '13:00', period: 'afternoon' },
      { time: '16:00', period: 'afternoon' },
      { time: '19:30', period: 'evening' },
      { time: '22:00', period: 'evening' }
    ]
  };

  const schedule = schedules[budgetType];
  const dailyActivities = [];

  schedule.forEach((slot, index) => {
    const filteredActivities = activities.filter(a => a.type === slot.period);
    if (filteredActivities.length > 0) {
      const randomActivity = filteredActivities[Math.floor(Math.random() * filteredActivities.length)];
      dailyActivities.push({
        time: slot.time,
        title: randomActivity.title,
        description: `${randomActivity.title} - Incluido en el itinerario`,
        cost: randomActivity.cost
      });
    }
  });

  return dailyActivities;
};

/**
 * Detect budget type based on trip budget
 */
const detectBudgetType = (budget, days) => {
  const dailyBudget = budget / days;
  
  if (dailyBudget < 100) return 'Económico';
  if (dailyBudget >= 100 && dailyBudget < 300) return 'Medio';
  return 'Alto';
};

/**
 * Calculate budget breakdown based on budget type
 */
const calculateBudgetBreakdown = (totalBudget, budgetType, days) => {
  const percentages = {
    'Económico': { accommodation: 0.35, food: 0.30, activities: 0.20, transport: 0.10, extras: 0.05 },
    'Medio': { accommodation: 0.35, food: 0.25, activities: 0.25, transport: 0.10, extras: 0.05 },
    'Alto': { accommodation: 0.40, food: 0.20, activities: 0.30, transport: 0.05, extras: 0.05 }
  };

  const breakdown = percentages[budgetType];
  
  return {
    accommodation: Math.round(totalBudget * breakdown.accommodation),
    food: Math.round(totalBudget * breakdown.food),
    activities: Math.round(totalBudget * breakdown.activities),
    transport: Math.round(totalBudget * breakdown.transport),
    extras: Math.round(totalBudget * breakdown.extras),
    total: totalBudget
  };
};

/**
 * Get weather forecast for the trip
 */
const getWeatherForecast = async (destination, startDate, endDate) => {
  try {
    // In a real scenario, you would use the weather API
    // For now, we'll return mock data with proper icon URLs
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const dailyForecasts = [];
    
    // Weather conditions with their corresponding icon codes
    const weatherConditions = [
      { condition: 'Soleado', icon: '01d' },
      { condition: 'Parcialmente nublado', icon: '02d' },
      { condition: 'Nublado', icon: '03d' },
      { condition: 'Lluvia ligera', icon: '10d' }
    ];

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const weatherData = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const chanceOfRain = weatherData.condition.includes('Lluvia') ? Math.round(Math.random() * 50 + 30) : Math.round(Math.random() * 20);
      
      dailyForecasts.push({
        date: date,
        temp: Math.round(Math.random() * 10 + 20), // 20-30°C
        condition: weatherData.condition,
        icon: `https://cdn.weatherapi.com/weather/64x64/day/113.png`, // Default sunny icon
        chanceOfRain: chanceOfRain
      });
    }

    const avgTemp = dailyForecasts.reduce((sum, f) => sum + f.temp, 0) / dailyForecasts.length;

    return {
      averageTemp: Math.round(avgTemp),
      conditions: 'Mayormente soleado',
      dailyForecasts
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      averageTemp: 25,
      conditions: 'No disponible',
      dailyForecasts: []
    };
  }
};

/**
 * Generate itinerary
 */
exports.generateItinerary = async (req, res) => {
  try {
    const { tripId, interestType, budgetType: requestedBudgetType } = req.body;
    const userId = req.user?.id || req.body.userId;

    // Validate input
    if (!tripId || !interestType) {
      return res.status(400).json({
        success: false,
        message: 'Trip ID y tipo de interés son requeridos'
      });
    }

    // Get trip details
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado'
      });
    }

    // Skip user verification if no authentication
    if (userId && trip.userId && trip.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para generar itinerario de este viaje'
      });
    }

    // Calculate days
    const days = Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24));
    
    // Use requested budget type or detect from trip budget
    const budgetType = requestedBudgetType || detectBudgetType(trip.budget || 500, days);

    // Get activity templates
    const activities = activityTemplates[interestType][budgetType];

    // Generate daily activities
    const dailyActivities = [];
    for (let day = 1; day <= days; day++) {
      const date = new Date(trip.startDate);
      date.setDate(date.getDate() + (day - 1));

      dailyActivities.push({
        day,
        date,
        activities: generateDailySchedule(budgetType, activities, day)
      });
    }

    // Get weather forecast
    const weatherInfo = await getWeatherForecast(trip.destination, trip.startDate, trip.endDate);

    // Calculate budget breakdown
    const budgetBreakdown = calculateBudgetBreakdown(trip.budget || 500, budgetType, days);

    // Check if itinerary already exists for this trip
    let itinerary = await Itinerary.findOne({ tripId });

    if (itinerary) {
      // Update existing itinerary
      itinerary.interestType = interestType;
      itinerary.budgetType = budgetType;
      itinerary.dailyActivities = dailyActivities;
      itinerary.weatherInfo = weatherInfo;
      itinerary.budgetBreakdown = budgetBreakdown;
      itinerary.generatedAt = new Date();
      await itinerary.save();
    } else {
      // Create new itinerary
      itinerary = new Itinerary({
        tripId,
        userId,
        interestType,
        budgetType,
        dailyActivities,
        weatherInfo,
        budgetBreakdown
      });
      await itinerary.save();
    }

    // Populate trip data
    await itinerary.populate('tripId');

    res.status(201).json({
      success: true,
      message: 'Itinerario generado exitosamente',
      data: itinerary
    });

  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar itinerario',
      error: error.message
    });
  }
};

/**
 * Get itinerary by ID
 */
exports.getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id).populate('tripId');

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerario no encontrado'
      });
    }

    res.json({
      success: true,
      data: itinerary
    });

  } catch (error) {
    console.error('Error getting itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener itinerario',
      error: error.message
    });
  }
};

/**
 * Get itinerary by trip ID
 */
exports.getItineraryByTripId = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user?.id || req.body.userId;

    const itinerary = await Itinerary.findOne({ tripId }).populate('tripId');

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerario no encontrado para este viaje'
      });
    }

    // Skip user verification if no authentication
    if (userId && itinerary.userId && itinerary.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para ver este itinerario'
      });
    }

    res.json({
      success: true,
      data: itinerary
    });

  } catch (error) {
    console.error('Error getting itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener itinerario',
      error: error.message
    });
  }
};

/**
 * Get all itineraries for user
 */
exports.getUserItineraries = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;

    const itineraries = await Itinerary.find({ userId })
      .populate('tripId')
      .sort({ generatedAt: -1 });

    res.json({
      success: true,
      count: itineraries.length,
      data: itineraries
    });

  } catch (error) {
    console.error('Error getting itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener itinerarios',
      error: error.message
    });
  }
};

/**
 * Delete itinerary
 */
exports.deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerario no encontrado'
      });
    }

    await itinerary.deleteOne();

    res.json({
      success: true,
      message: 'Itinerario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar itinerario',
      error: error.message
    });
  }
};
