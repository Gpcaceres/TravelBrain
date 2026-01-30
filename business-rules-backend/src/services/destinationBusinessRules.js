/**
 * Destination Business Rules Service
 * Implements BR-DEST-001 to BR-DEST-008
 */

class DestinationBusinessRules {
  /**
   * BR-DEST-001: Destination name is mandatory
   */
  validateName(name) {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push({
        code: 'BR-DEST-001',
        field: 'name',
        message: 'El nombre del destino es obligatorio'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-DEST-002: Country is mandatory
   */
  validateCountry(country) {
    const errors = [];

    if (!country || country.trim().length === 0) {
      errors.push({
        code: 'BR-DEST-002',
        field: 'country',
        message: 'El país es obligatorio'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-DEST-003: Geographic coordinates are mandatory
   * Latitude: between -90 and 90 degrees
   * Longitude: between -180 and 180 degrees
   */
  validateCoordinates(lat, lng) {
    const errors = [];

    if (lat === undefined || lat === null) {
      errors.push({
        code: 'BR-DEST-003',
        field: 'lat',
        message: 'La latitud es obligatoria'
      });
    } else {
      const latitude = Number(lat);
      if (isNaN(latitude)) {
        errors.push({
          code: 'BR-DEST-003',
          field: 'lat',
          message: 'La latitud debe ser un número válido'
        });
      } else if (latitude < -90 || latitude > 90) {
        errors.push({
          code: 'BR-DEST-003',
          field: 'lat',
          message: 'La latitud debe estar entre -90 y 90 grados'
        });
      }
    }

    if (lng === undefined || lng === null) {
      errors.push({
        code: 'BR-DEST-003',
        field: 'lng',
        message: 'La longitud es obligatoria'
      });
    } else {
      const longitude = Number(lng);
      if (isNaN(longitude)) {
        errors.push({
          code: 'BR-DEST-003',
          field: 'lng',
          message: 'La longitud debe ser un número válido'
        });
      } else if (longitude < -180 || longitude > 180) {
        errors.push({
          code: 'BR-DEST-003',
          field: 'lng',
          message: 'La longitud debe estar entre -180 y 180 grados'
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-DEST-006: Can be associated with a specific user (userId optional)
   */
  validateUserId(userId) {
    // UserId is optional for destinations
    return { valid: true, errors: [] };
  }

  /**
   * Validate complete destination creation data
   */
  validateCreation(destinationData) {
    const errors = [];

    // Regla especial: Si el país es Perú y no contiene Lima, forzar Lima como destino
    if (destinationData.country && destinationData.country.trim().toLowerCase() === 'perú') {
      destinationData.country = 'Perú, Lima';
      if (destinationData.name && destinationData.name.trim().toLowerCase() === 'perú') {
        destinationData.name = 'Perú, Lima';
      }
    }

    // BR-DEST-001: Validate name
    const nameValidation = this.validateName(destinationData.name);
    if (!nameValidation.valid) {
      errors.push(...nameValidation.errors);
    }

    // BR-DEST-002: Validate country
    const countryValidation = this.validateCountry(destinationData.country);
    if (!countryValidation.valid) {
      errors.push(...countryValidation.errors);
    }

    // BR-DEST-003: Validate coordinates
    const coordinatesValidation = this.validateCoordinates(
      destinationData.lat, 
      destinationData.lng
    );
    if (!coordinatesValidation.valid) {
      errors.push(...coordinatesValidation.errors);
    }

    // BR-DEST-004: Description is optional (no validation needed)
    // BR-DEST-005: Image is optional (no validation needed)
    // BR-DEST-006: UserId is optional
    const userIdValidation = this.validateUserId(destinationData.userId);
    if (!userIdValidation.valid) {
      errors.push(...userIdValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate destination update data (partial validation)
   */
  validateUpdate(destinationData) {
    const errors = [];

    // Regla especial: Si el país es Perú y no contiene Lima, forzar Lima como destino
    if (destinationData.country && destinationData.country.trim().toLowerCase() === 'perú') {
      destinationData.country = 'Perú, Lima';
      if (destinationData.name && destinationData.name.trim().toLowerCase() === 'perú') {
        destinationData.name = 'Perú, Lima';
      }
    }

    // Only validate provided fields
    if (destinationData.name !== undefined) {
      const nameValidation = this.validateName(destinationData.name);
      if (!nameValidation.valid) {
        errors.push(...nameValidation.errors);
      }
    }

    if (destinationData.country !== undefined) {
      const countryValidation = this.validateCountry(destinationData.country);
      if (!countryValidation.valid) {
        errors.push(...countryValidation.errors);
      }
    }

    if (destinationData.lat !== undefined || destinationData.lng !== undefined) {
      const coordinatesValidation = this.validateCoordinates(
        destinationData.lat, 
        destinationData.lng
      );
      if (!coordinatesValidation.valid) {
        errors.push(...coordinatesValidation.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate only coordinates (useful for geospatial queries)
   */
  validateCoordinatesOnly(lat, lng) {
    return this.validateCoordinates(lat, lng);
  }

  /**
   * BR-DEST-007, BR-DEST-008: Generate index recommendations
   * These are metadata for the backend to create appropriate indexes
   */
  getIndexRecommendations() {
    return {
      indexes: [
        { 
          fields: ['name', 'country'], 
          type: 'compound', 
          description: 'BR-DEST-007: Index by name and country for efficient searches' 
        },
        { 
          fields: ['lat', 'lng'], 
          type: 'geospatial', 
          indexType: '2dsphere',
          description: 'BR-DEST-008: Index by coordinates for geospatial searches' 
        }
      ]
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Useful for proximity searches
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = new DestinationBusinessRules();
