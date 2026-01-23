/**
 * Route Business Rules Service
 * Implements BR-ROUTE-001 to BR-ROUTE-008
 */

class RouteBusinessRules {
  /**
   * BR-ROUTE-001: Each route must be associated with a user (userId mandatory)
   */
  validateUserId(userId) {
    const errors = [];

    if (!userId) {
      errors.push({
        code: 'BR-ROUTE-001',
        field: 'userId',
        message: 'La ruta debe estar asociada a un usuario (userId es obligatorio)'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-ROUTE-002: Route name is mandatory
   */
  validateName(name) {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push({
        code: 'BR-ROUTE-002',
        field: 'name',
        message: 'El nombre de la ruta es obligatorio'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-ROUTE-003: Must have an origin point with valid coordinates
   * Latitude: between -90 and 90
   * Longitude: between -180 and 180
   */
  validateOrigin(origin) {
    const errors = [];

    if (!origin) {
      errors.push({
        code: 'BR-ROUTE-003',
        field: 'origin',
        message: 'El punto de origen es obligatorio'
      });
      return { valid: false, errors };
    }

    if (origin.lat === undefined || origin.lat === null) {
      errors.push({
        code: 'BR-ROUTE-003',
        field: 'origin.lat',
        message: 'La latitud del origen es obligatoria'
      });
    } else {
      const lat = Number(origin.lat);
      if (isNaN(lat)) {
        errors.push({
          code: 'BR-ROUTE-003',
          field: 'origin.lat',
          message: 'La latitud del origen debe ser un número válido'
        });
      } else if (lat < -90 || lat > 90) {
        errors.push({
          code: 'BR-ROUTE-003',
          field: 'origin.lat',
          message: 'La latitud del origen debe estar entre -90 y 90 grados'
        });
      }
    }

    if (origin.lng === undefined || origin.lng === null) {
      errors.push({
        code: 'BR-ROUTE-003',
        field: 'origin.lng',
        message: 'La longitud del origen es obligatoria'
      });
    } else {
      const lng = Number(origin.lng);
      if (isNaN(lng)) {
        errors.push({
          code: 'BR-ROUTE-003',
          field: 'origin.lng',
          message: 'La longitud del origen debe ser un número válido'
        });
      } else if (lng < -180 || lng > 180) {
        errors.push({
          code: 'BR-ROUTE-003',
          field: 'origin.lng',
          message: 'La longitud del origen debe estar entre -180 y 180 grados'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-ROUTE-004: Must have a destination point with valid coordinates
   * Latitude: between -90 and 90
   * Longitude: between -180 and 180
   */
  validateDestination(destination) {
    const errors = [];

    if (!destination) {
      errors.push({
        code: 'BR-ROUTE-004',
        field: 'destination',
        message: 'El punto de destino es obligatorio'
      });
      return { valid: false, errors };
    }

    if (destination.lat === undefined || destination.lat === null) {
      errors.push({
        code: 'BR-ROUTE-004',
        field: 'destination.lat',
        message: 'La latitud del destino es obligatoria'
      });
    } else {
      const lat = Number(destination.lat);
      if (isNaN(lat)) {
        errors.push({
          code: 'BR-ROUTE-004',
          field: 'destination.lat',
          message: 'La latitud del destino debe ser un número válido'
        });
      } else if (lat < -90 || lat > 90) {
        errors.push({
          code: 'BR-ROUTE-004',
          field: 'destination.lat',
          message: 'La latitud del destino debe estar entre -90 y 90 grados'
        });
      }
    }

    if (destination.lng === undefined || destination.lng === null) {
      errors.push({
        code: 'BR-ROUTE-004',
        field: 'destination.lng',
        message: 'La longitud del destino es obligatoria'
      });
    } else {
      const lng = Number(destination.lng);
      if (isNaN(lng)) {
        errors.push({
          code: 'BR-ROUTE-004',
          field: 'destination.lng',
          message: 'La longitud del destino debe ser un número válido'
        });
      } else if (lng < -180 || lng > 180) {
        errors.push({
          code: 'BR-ROUTE-004',
          field: 'destination.lng',
          message: 'La longitud del destino debe estar entre -180 y 180 grados'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-ROUTE-005: Distance (distanceKm) must be greater than or equal to 0
   */
  validateDistance(distanceKm) {
    const errors = [];

    if (distanceKm !== undefined && distanceKm !== null) {
      const distance = Number(distanceKm);
      
      if (isNaN(distance)) {
        errors.push({
          code: 'BR-ROUTE-005',
          field: 'distanceKm',
          message: 'La distancia debe ser un número válido'
        });
      } else if (distance < 0) {
        errors.push({
          code: 'BR-ROUTE-005',
          field: 'distanceKm',
          message: 'La distancia debe ser mayor o igual a 0'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-ROUTE-006: Duration (durationSec) must be greater than or equal to 0
   */
  validateDuration(durationSec) {
    const errors = [];

    if (durationSec !== undefined && durationSec !== null) {
      const duration = Number(durationSec);
      
      if (isNaN(duration)) {
        errors.push({
          code: 'BR-ROUTE-006',
          field: 'durationSec',
          message: 'La duración debe ser un número válido'
        });
      } else if (duration < 0) {
        errors.push({
          code: 'BR-ROUTE-006',
          field: 'durationSec',
          message: 'La duración debe ser mayor o igual a 0'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-ROUTE-007: Allowed transport modes are: driving, walking, cycling, transit
   * Default: driving
   */
  validateTransportMode(mode) {
    const validModes = ['driving', 'walking', 'cycling', 'transit'];
    const errors = [];

    if (mode && !validModes.includes(mode)) {
      errors.push({
        code: 'BR-ROUTE-007',
        field: 'mode',
        message: `El modo de transporte debe ser uno de: ${validModes.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      normalizedMode: mode || 'driving' // Default to driving
    };
  }

  /**
   * Validate complete route creation data
   */
  validateCreation(routeData) {
    const errors = [];
    const normalizedData = {};

    // BR-ROUTE-001: Validate userId
    const userIdValidation = this.validateUserId(routeData.userId);
    if (!userIdValidation.valid) {
      errors.push(...userIdValidation.errors);
    }

    // BR-ROUTE-002: Validate name
    const nameValidation = this.validateName(routeData.name);
    if (!nameValidation.valid) {
      errors.push(...nameValidation.errors);
    }

    // BR-ROUTE-003: Validate origin
    const originValidation = this.validateOrigin(routeData.origin);
    if (!originValidation.valid) {
      errors.push(...originValidation.errors);
    }

    // BR-ROUTE-004: Validate destination
    const destinationValidation = this.validateDestination(routeData.destination);
    if (!destinationValidation.valid) {
      errors.push(...destinationValidation.errors);
    }

    // BR-ROUTE-005: Validate distance
    const distanceValidation = this.validateDistance(routeData.distanceKm);
    if (!distanceValidation.valid) {
      errors.push(...distanceValidation.errors);
    }

    // BR-ROUTE-006: Validate duration
    const durationValidation = this.validateDuration(routeData.durationSec);
    if (!durationValidation.valid) {
      errors.push(...durationValidation.errors);
    }

    // BR-ROUTE-007: Validate transport mode
    const modeValidation = this.validateTransportMode(routeData.mode);
    if (!modeValidation.valid) {
      errors.push(...modeValidation.errors);
    }
    normalizedData.mode = modeValidation.normalizedMode;

    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }

  /**
   * Validate route update data (partial validation)
   */
  validateUpdate(routeData) {
    const errors = [];
    const normalizedData = {};

    // Only validate provided fields
    if (routeData.userId !== undefined) {
      const userIdValidation = this.validateUserId(routeData.userId);
      if (!userIdValidation.valid) {
        errors.push(...userIdValidation.errors);
      }
    }

    if (routeData.name !== undefined) {
      const nameValidation = this.validateName(routeData.name);
      if (!nameValidation.valid) {
        errors.push(...nameValidation.errors);
      }
    }

    if (routeData.origin !== undefined) {
      const originValidation = this.validateOrigin(routeData.origin);
      if (!originValidation.valid) {
        errors.push(...originValidation.errors);
      }
    }

    if (routeData.destination !== undefined) {
      const destinationValidation = this.validateDestination(routeData.destination);
      if (!destinationValidation.valid) {
        errors.push(...destinationValidation.errors);
      }
    }

    if (routeData.distanceKm !== undefined) {
      const distanceValidation = this.validateDistance(routeData.distanceKm);
      if (!distanceValidation.valid) {
        errors.push(...distanceValidation.errors);
      }
    }

    if (routeData.durationSec !== undefined) {
      const durationValidation = this.validateDuration(routeData.durationSec);
      if (!durationValidation.valid) {
        errors.push(...durationValidation.errors);
      }
    }

    if (routeData.mode !== undefined) {
      const modeValidation = this.validateTransportMode(routeData.mode);
      if (!modeValidation.valid) {
        errors.push(...modeValidation.errors);
      }
      normalizedData.mode = modeValidation.normalizedMode;
    }

    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }

  /**
   * BR-ROUTE-008: Generate index recommendations
   * These are metadata for the backend to create appropriate indexes
   */
  getIndexRecommendations() {
    return {
      indexes: [
        { 
          field: 'userId', 
          type: 'single', 
          description: 'BR-ROUTE-008: Index by userId for fast access' 
        }
      ]
    };
  }
}

module.exports = new RouteBusinessRules();
