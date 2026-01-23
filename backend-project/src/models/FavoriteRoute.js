const mongoose = require('mongoose');

/**
 * FavoriteRoute Schema
 * Represents a user's saved favorite route
 */
const favoriteRouteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    origin: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lon: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      },
      label: {
        type: String,
        trim: true
      }
    },
    destination: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lon: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      },
      label: {
        type: String,
        trim: true
      }
    },
    distanceKm: {
      type: Number,
      min: 0
    },
    durationSec: {
      type: Number,
      min: 0
    },
    mode: {
      type: String,
      enum: ['driving', 'walking', 'cycling', 'transit'],
      default: 'driving'
    },
    transportType: {
      type: String,
      enum: ['ground', 'air', 'sea', 'mixed'],
      default: 'ground'
    },
    segments: [{
      type: {
        type: String,
        enum: ['ground', 'air', 'sea'],
        required: true
      },
      start: {
        lat: Number,
        lon: Number,
        label: String
      },
      end: {
        lat: Number,
        lon: Number,
        label: String
      },
      distance: Number,
      duration: Number
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'favorite_routes',
    timestamps: false
  }
);

// Indexes for performance
favoriteRouteSchema.index({ userId: 1 });
favoriteRouteSchema.index({ createdAt: -1 });

// Virtual for duration in minutes
favoriteRouteSchema.virtual('durationMin').get(function() {
  if (this.durationSec) {
    return Math.round(this.durationSec / 60);
  }
  return 0;
});

module.exports = mongoose.model('FavoriteRoute', favoriteRouteSchema);
