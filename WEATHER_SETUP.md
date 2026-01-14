# Weather Feature - OpenWeatherMap API Setup

## Getting Your FREE API Key

The Weather feature uses OpenWeatherMap API to fetch real-time weather data. Follow these steps to get your free API key:

### Step 1: Sign Up
1. Go to [https://openweathermap.org/](https://openweathermap.org/)
2. Click on **"Sign Up"** or **"Sign In"** if you already have an account
3. Create a free account (no credit card required)

### Step 2: Get API Key
1. After signing in, go to **"API keys"** tab in your account
2. You'll see a default API key already generated for you
3. Copy this API key

### Step 3: Add to Your Project
1. Open `frontend-react/src/pages/Weather.jsx`
2. Find line 39: `const API_KEY = 'YOUR_API_KEY'`
3. Replace `'YOUR_API_KEY'` with your actual API key

Example:
```javascript
const API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' // Your actual key
```

### Step 4: Save and Test
1. Save the file
2. Restart your development server if needed
3. Go to `/weather` page and search for any city

## API Limits (Free Tier)
- ✅ 60 calls/minute
- ✅ 1,000,000 calls/month
- ✅ Current weather data
- ✅ 3-hour forecast

## Troubleshooting

**Error: "City not found"**
- Check spelling of the city name
- Try adding country code: "London,UK"

**Error: "401 Unauthorized"**
- Your API key might not be activated yet (wait 10-15 minutes after signup)
- Check if you copied the key correctly

**Error: "Too many requests"**
- You've exceeded the free tier limit
- Wait a minute and try again

## Features Included
- 🌤️ Current weather conditions
- 🌡️ Temperature in Celsius
- 💧 Humidity levels
- 💨 Wind speed
- 📍 Location-based search
- 💾 Save searches to database
- 📊 View recent weather searches

## Example Cities to Try
- London
- New York
- Tokyo
- Paris
- Sydney
- Dubai
- Moscow
- Rio de Janeiro
