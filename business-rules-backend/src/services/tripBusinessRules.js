/**
 * Trip Business Rules Service
 * Implements BR-TRIP-001 to BR-TRIP-012
 */

class TripBusinessRules {
  /**
   * BR-TRIP-001: Each trip must be associated with a user (userId mandatory)
   */
  validateUserId(userId) {
    const errors = [];

    if (!userId) {
      errors.push({
        code: 'BR-TRIP-001',
        field: 'userId',
        message: 'El viaje debe estar asociado a un usuario (userId es obligatorio)'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-TRIP-002: Trip title is mandatory
   */
  validateTitle(title) {
    const errors = [];

    if (!title || title.trim().length === 0) {
      errors.push({
        code: 'BR-TRIP-002',
        field: 'title',
        message: 'El título del viaje es obligatorio'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-TRIP-003: Destination is mandatory
   */
  validateDestination(destination) {
    const errors = [];

    if (!destination || destination.trim().length === 0) {
      errors.push({
        code: 'BR-TRIP-003',
        field: 'destination',
        message: 'El destino es obligatorio'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-TRIP-004: Start date is mandatory
   * BR-TRIP-005: End date is mandatory
   */
  validateDates(startDate, endDate) {
    const errors = [];

    if (!startDate) {
      errors.push({
        code: 'BR-TRIP-004',
        field: 'startDate',
        message: 'La fecha de inicio es obligatoria'
      });
    }

    if (!endDate) {
      errors.push({
        code: 'BR-TRIP-005',
        field: 'endDate',
        message: 'La fecha de fin es obligatoria'
      });
    }

    // Additional validation: endDate should be after startDate
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime())) {
        errors.push({
          code: 'BR-TRIP-004',
          field: 'startDate',
          message: 'La fecha de inicio no es válida'
        });
      }

      if (isNaN(end.getTime())) {
        errors.push({
          code: 'BR-TRIP-005',
          field: 'endDate',
          message: 'La fecha de fin no es válida'
        });
      }

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
        errors.push({
          code: 'BR-TRIP-005',
          field: 'endDate',
          message: 'La fecha de fin debe ser posterior a la fecha de inicio'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-TRIP-006: Budget must be greater than or equal to 0
   */
  validateBudget(budget) {
    const errors = [];

    if (budget !== undefined && budget !== null) {
      const budgetNum = Number(budget);
      
      if (isNaN(budgetNum)) {
        errors.push({
          code: 'BR-TRIP-006',
          field: 'budget',
          message: 'El presupuesto debe ser un número válido'
        });
      } else if (budgetNum < 0) {
        errors.push({
          code: 'BR-TRIP-006',
          field: 'budget',
          message: 'El presupuesto debe ser mayor o igual a 0'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-TRIP-008: System automatically calculates trip duration in days
   * BR-TRIP-009: Duration is calculated as: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
   */
  calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    const durationMs = end - start;
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    return durationDays;
  }

  /**
   * Validate complete trip creation data
   */
  validateCreation(tripData) {
    const errors = [];
    const calculatedData = {};

    // BR-TRIP-001: Validate userId
    const userIdValidation = this.validateUserId(tripData.userId);
    if (!userIdValidation.valid) {
      errors.push(...userIdValidation.errors);
    }

    // BR-TRIP-002: Validate title
    const titleValidation = this.validateTitle(tripData.title);
    if (!titleValidation.valid) {
      errors.push(...titleValidation.errors);
    }

    // BR-TRIP-003: Validate destination
    const destinationValidation = this.validateDestination(tripData.destination);
    if (!destinationValidation.valid) {
      errors.push(...destinationValidation.errors);
    }

    // BR-TRIP-004, BR-TRIP-005: Validate dates
    const datesValidation = this.validateDates(tripData.startDate, tripData.endDate);
    if (!datesValidation.valid) {
      errors.push(...datesValidation.errors);
    }

    // BR-TRIP-006: Validate budget
    const budgetValidation = this.validateBudget(tripData.budget);
    if (!budgetValidation.valid) {
      errors.push(...budgetValidation.errors);
    }

    // BR-TRIP-008, BR-TRIP-009: Calculate duration
    if (tripData.startDate && tripData.endDate && errors.length === 0) {
      const duration = this.calculateDuration(tripData.startDate, tripData.endDate);
      if (duration !== null) {
        calculatedData.duration = duration;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      calculatedData
    };
  }

  /**
   * Validate trip update data (partial validation)
   */
  validateUpdate(tripData) {
    const errors = [];
    const calculatedData = {};

    // Only validate provided fields
    if (tripData.userId !== undefined) {
      const userIdValidation = this.validateUserId(tripData.userId);
      if (!userIdValidation.valid) {
        errors.push(...userIdValidation.errors);
      }
    }

    if (tripData.title !== undefined) {
      const titleValidation = this.validateTitle(tripData.title);
      if (!titleValidation.valid) {
        errors.push(...titleValidation.errors);
      }
    }

    if (tripData.destination !== undefined) {
      const destinationValidation = this.validateDestination(tripData.destination);
      if (!destinationValidation.valid) {
        errors.push(...destinationValidation.errors);
      }
    }

    if (tripData.startDate !== undefined || tripData.endDate !== undefined) {
      const datesValidation = this.validateDates(tripData.startDate, tripData.endDate);
      if (!datesValidation.valid) {
        errors.push(...datesValidation.errors);
      }
    }

    if (tripData.budget !== undefined) {
      const budgetValidation = this.validateBudget(tripData.budget);
      if (!budgetValidation.valid) {
        errors.push(...budgetValidation.errors);
      }
    }

    // Recalculate duration if dates are provided
    if (tripData.startDate && tripData.endDate && errors.length === 0) {
      const duration = this.calculateDuration(tripData.startDate, tripData.endDate);
      if (duration !== null) {
        calculatedData.duration = duration;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      calculatedData
    };
  }

  /**
   * BR-TRIP-010, BR-TRIP-011: Generate index recommendations
   * These are metadata for the backend to create appropriate indexes
   */
  getIndexRecommendations() {
    return {
      indexes: [
        { field: 'userId', type: 'single', description: 'BR-TRIP-010: Index by userId for fast searches' },
        { 
          fields: ['startDate', 'endDate'], 
          type: 'compound', 
          description: 'BR-TRIP-011: Index by date range' 
        }
      ],
      sorting: {
        default: { createdAt: -1 },
        description: 'BR-TRIP-012: Sort by creation date descending'
      }
    };
  }
}

module.exports = new TripBusinessRules();
