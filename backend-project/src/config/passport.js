const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://travelbrain.ddns.net/api/auth/google/callback",
    passReqToCallback: true,
    scope: ['profile', 'email']
  },
  async (req, accessToken, refreshToken, profile, done) => {
    console.log('🔥 PASSPORT STRATEGY EJECUTÁNDOSE - Profile ID:', profile.id);
    try {
      // Buscar usuario existente por googleId
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Usuario ya existe, actualizar información si es necesario
        user.name = user.name || profile.displayName;
        user.picture = profile.photos && profile.photos[0] ? profile.photos[0].value : user.picture;
        await user.save();
        return done(null, user);
      }
      
      // Verificar si existe un usuario con ese email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Vincular cuenta de Google con usuario existente
        user.googleId = profile.id;
        user.picture = profile.photos && profile.photos[0] ? profile.photos[0].value : user.picture;
        user.name = user.name || profile.displayName;
        await user.save();
        return done(null, user);
      }
      
      // Crear nuevo usuario
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        role: 'USER',
        status: 'ACTIVE'
      });
      
      return done(null, user);
    } catch (error) {
      console.error('Error en estrategia de Google OAuth:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
