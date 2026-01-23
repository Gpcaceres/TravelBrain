/**
 * Itinerary Business Rules Service
 * Contains activity templates, budget detection, and schedule generation logic
 */

class ItineraryBusinessRules {
  /**
   * Activity templates based on interest type and budget
   */
  getActivityTemplates() {
    return {
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
  }

  /**
   * Detect budget type based on trip budget and days
   */
  detectBudgetType(budget, days) {
    if (!budget || !days || days <= 0) {
      return 'Económico'; // Default
    }

    const dailyBudget = budget / days;
    
    if (dailyBudget < 100) return 'Económico';
    if (dailyBudget >= 100 && dailyBudget < 300) return 'Medio';
    return 'Alto';
  }

  /**
   * Generate daily schedule based on budget type
   */
  generateDailySchedule(budgetType, activities, day) {
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

    const schedule = schedules[budgetType] || schedules['Económico'];
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
  }

  /**
   * Calculate budget breakdown based on budget type
   */
  calculateBudgetBreakdown(totalBudget, budgetType, days) {
    if (!totalBudget || !days || days <= 0) {
      return {
        accommodation: 0,
        food: 0,
        activities: 0,
        transport: 0,
        extras: 0,
        total: 0
      };
    }

    const percentages = {
      'Económico': { 
        accommodation: 0.35, 
        food: 0.30, 
        activities: 0.20, 
        transport: 0.10, 
        extras: 0.05 
      },
      'Medio': { 
        accommodation: 0.35, 
        food: 0.25, 
        activities: 0.25, 
        transport: 0.10, 
        extras: 0.05 
      },
      'Alto': { 
        accommodation: 0.40, 
        food: 0.20, 
        activities: 0.30, 
        transport: 0.05, 
        extras: 0.05 
      }
    };

    const breakdown = percentages[budgetType] || percentages['Económico'];
    
    return {
      accommodation: Math.round(totalBudget * breakdown.accommodation),
      food: Math.round(totalBudget * breakdown.food),
      activities: Math.round(totalBudget * breakdown.activities),
      transport: Math.round(totalBudget * breakdown.transport),
      extras: Math.round(totalBudget * breakdown.extras),
      total: totalBudget
    };
  }

  /**
   * Generate complete itinerary based on trip data
   */
  generateItinerary(tripData, interestType, requestedBudgetType = null) {
    const errors = [];

    // Validate required fields
    if (!tripData.startDate) {
      errors.push({ field: 'startDate', message: 'Fecha de inicio es requerida' });
    }
    if (!tripData.endDate) {
      errors.push({ field: 'endDate', message: 'Fecha de fin es requerida' });
    }
    if (!interestType) {
      errors.push({ field: 'interestType', message: 'Tipo de interés es requerido' });
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Calculate days
    const start = new Date(tripData.startDate);
    const end = new Date(tripData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return { 
        valid: false, 
        errors: [{ field: 'dates', message: 'Las fechas del viaje no son válidas' }] 
      };
    }

    // Detect or use requested budget type
    const budgetType = requestedBudgetType || this.detectBudgetType(tripData.budget || 500, days);

    // Get activity templates
    const templates = this.getActivityTemplates();
    const activities = templates[interestType]?.[budgetType];

    if (!activities) {
      return { 
        valid: false, 
        errors: [{ 
          field: 'interestType', 
          message: `Tipo de interés no válido: ${interestType}` 
        }] 
      };
    }

    // Generate daily activities
    const dailyActivities = [];
    for (let day = 1; day <= days; day++) {
      const date = new Date(start);
      date.setDate(date.getDate() + (day - 1));

      dailyActivities.push({
        day,
        date,
        activities: this.generateDailySchedule(budgetType, activities, day)
      });
    }

    // Calculate budget breakdown
    const budgetBreakdown = this.calculateBudgetBreakdown(
      tripData.budget || 500, 
      budgetType, 
      days
    );

    return {
      valid: true,
      data: {
        interestType,
        budgetType,
        dailyActivities,
        budgetBreakdown,
        days
      }
    };
  }

  /**
   * Validate itinerary generation request
   */
  validateItineraryRequest(requestData) {
    const errors = [];

    if (!requestData.tripId) {
      errors.push({ 
        field: 'tripId', 
        message: 'Trip ID es requerido' 
      });
    }

    if (!requestData.interestType) {
      errors.push({ 
        field: 'interestType', 
        message: 'Tipo de interés es requerido' 
      });
    }

    const validInterestTypes = [
      'Cultura e Historia',
      'Naturaleza y Aventura',
      'Gastronomía',
      'Deportes y Aventura'
    ];

    if (requestData.interestType && !validInterestTypes.includes(requestData.interestType)) {
      errors.push({ 
        field: 'interestType', 
        message: `Tipo de interés debe ser uno de: ${validInterestTypes.join(', ')}` 
      });
    }

    if (requestData.budgetType) {
      const validBudgetTypes = ['Económico', 'Medio', 'Alto'];
      if (!validBudgetTypes.includes(requestData.budgetType)) {
        errors.push({ 
          field: 'budgetType', 
          message: `Tipo de presupuesto debe ser uno de: ${validBudgetTypes.join(', ')}` 
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ItineraryBusinessRules();
