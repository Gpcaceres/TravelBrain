const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Authentication Routes
 * Note: These routes are mounted at /api/auth in app.js
 */

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Simple login
router.post('/login', authController.simpleLogin);

// GET /api/auth/verify - Verify JWT token
router.get('/verify', authController.verifyToken);

// ===== Google OAuth Routes =====

// GET /api/auth/google - Iniciar autenticación con Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

// GET /api/auth/google/callback - Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://travelbrain.ddns.net'}/login?error=auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: req.user._id.toString(),
          email: req.user.email,
          name: req.user.name,
          role: req.user.role
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://travelbrain.ddns.net';
      res.redirect(`${frontendUrl}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Error en callback de Google:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://travelbrain.ddns.net';
      res.redirect(`${frontendUrl}/login?error=token_generation_failed`);
    }
  }
);

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Sesión cerrada correctamente' 
  });
});

module.exports = router;
