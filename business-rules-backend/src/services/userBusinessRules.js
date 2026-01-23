/**
 * User Business Rules Service
 * Implements BR-USR-001 to BR-USR-008
 */

class UserBusinessRules {
  /**
   * BR-USR-001: Email is mandatory and must be unique
   * BR-USR-002: Email is always stored in lowercase
   */
  validateEmail(email) {
    const errors = [];

    if (!email) {
      errors.push({
        code: 'BR-USR-001',
        field: 'email',
        message: 'El email es obligatorio'
      });
      return { valid: false, errors };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({
        code: 'BR-USR-001',
        field: 'email',
        message: 'El email no tiene un formato válido'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      normalizedEmail: email.toLowerCase() // BR-USR-002
    };
  }

  /**
   * BR-USR-005: Username can be optional, but if provided must be unique
   * BR-USR-008: Username cannot be less than 3 characters
   */
  validateUsername(username) {
    const errors = [];

    // Username is optional
    if (!username) {
      return { valid: true, errors: [] };
    }

    // If provided, must be at least 3 characters
    if (username.length < 3) {
      errors.push({
        code: 'BR-USR-008',
        field: 'username',
        message: 'El username no puede tener menos de 3 caracteres'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-USR-007: Password must have minimum 6 characters
   */
  validatePassword(password) {
    const errors = [];

    if (!password) {
      errors.push({
        code: 'BR-USR-007',
        field: 'password',
        message: 'La contraseña es obligatoria'
      });
      return { valid: false, errors };
    }

    if (password.length < 6) {
      errors.push({
        code: 'BR-USR-007',
        field: 'password',
        message: 'La contraseña debe tener mínimo 6 caracteres'
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * BR-USR-003: Users can have roles: ADMIN, REGISTERED, USER (default: USER)
   */
  validateRole(role) {
    const validRoles = ['ADMIN', 'REGISTERED', 'USER'];
    const errors = [];

    if (role && !validRoles.includes(role)) {
      errors.push({
        code: 'BR-USR-003',
        field: 'role',
        message: `El rol debe ser uno de: ${validRoles.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      normalizedRole: role || 'USER' // Default to USER
    };
  }

  /**
   * BR-USR-004: Users can have states: ACTIVE, INACTIVE (default: ACTIVE)
   */
  validateStatus(status) {
    const validStatuses = ['ACTIVE', 'INACTIVE'];
    const errors = [];

    if (status && !validStatuses.includes(status)) {
      errors.push({
        code: 'BR-USR-004',
        field: 'status',
        message: `El estado debe ser uno de: ${validStatuses.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      normalizedStatus: status || 'ACTIVE' // Default to ACTIVE
    };
  }

  /**
   * BR-USR-006: Default timezone: America/Guayaquil
   */
  validateTimezone(timezone) {
    return {
      valid: true,
      normalizedTimezone: timezone || 'America/Guayaquil'
    };
  }

  /**
   * Validate complete user registration data
   */
  validateRegistration(userData) {
    const errors = [];
    const normalizedData = {};

    // Validate email
    const emailValidation = this.validateEmail(userData.email);
    if (!emailValidation.valid) {
      errors.push(...emailValidation.errors);
    } else {
      normalizedData.email = emailValidation.normalizedEmail;
    }

    // Validate username (optional)
    const usernameValidation = this.validateUsername(userData.username);
    if (!usernameValidation.valid) {
      errors.push(...usernameValidation.errors);
    } else if (userData.username) {
      normalizedData.username = userData.username;
    }

    // Validate password
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }

    // Validate role
    const roleValidation = this.validateRole(userData.role);
    if (!roleValidation.valid) {
      errors.push(...roleValidation.errors);
    }
    normalizedData.role = roleValidation.normalizedRole;

    // Validate status
    const statusValidation = this.validateStatus(userData.status);
    if (!statusValidation.valid) {
      errors.push(...statusValidation.errors);
    }
    normalizedData.status = statusValidation.normalizedStatus;

    // Set default timezone
    const timezoneValidation = this.validateTimezone(userData.timezone);
    normalizedData.timezone = timezoneValidation.normalizedTimezone;

    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }

  /**
   * Validate user update data (partial validation)
   */
  validateUpdate(userData) {
    const errors = [];
    const normalizedData = {};

    // Only validate provided fields
    if (userData.email !== undefined) {
      const emailValidation = this.validateEmail(userData.email);
      if (!emailValidation.valid) {
        errors.push(...emailValidation.errors);
      } else {
        normalizedData.email = emailValidation.normalizedEmail;
      }
    }

    if (userData.username !== undefined) {
      const usernameValidation = this.validateUsername(userData.username);
      if (!usernameValidation.valid) {
        errors.push(...usernameValidation.errors);
      } else {
        normalizedData.username = userData.username;
      }
    }

    if (userData.password !== undefined) {
      const passwordValidation = this.validatePassword(userData.password);
      if (!passwordValidation.valid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (userData.role !== undefined) {
      const roleValidation = this.validateRole(userData.role);
      if (!roleValidation.valid) {
        errors.push(...roleValidation.errors);
      } else {
        normalizedData.role = roleValidation.normalizedRole;
      }
    }

    if (userData.status !== undefined) {
      const statusValidation = this.validateStatus(userData.status);
      if (!statusValidation.valid) {
        errors.push(...statusValidation.errors);
      } else {
        normalizedData.status = statusValidation.normalizedStatus;
      }
    }

    if (userData.timezone !== undefined) {
      const timezoneValidation = this.validateTimezone(userData.timezone);
      normalizedData.timezone = timezoneValidation.normalizedTimezone;
    }

    return {
      valid: errors.length === 0,
      errors,
      normalizedData
    };
  }
}

module.exports = new UserBusinessRules();
