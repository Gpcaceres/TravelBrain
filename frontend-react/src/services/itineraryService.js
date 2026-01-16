import axios from 'axios';
import { API_CONFIG } from '../config';

const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

/**
 * Create axios instance with auth headers
 */
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

/**
 * Generate a new itinerary for a trip
 * @param {string} tripId - Trip ID
 * @param {string} interestType - Type of interest (Cultura e Historia, Naturaleza y Aventura, Gastronomía, Deportes y Aventura)
 * @returns {Promise} Generated itinerary
 */
export const generateItinerary = async (tripId, interestType) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/itineraries/generate`,
      { tripId, interestType },
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get itinerary by ID
 * @param {string} id - Itinerary ID
 * @returns {Promise} Itinerary data
 */
export const getItineraryById = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/itineraries/${id}`,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error getting itinerary:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get itinerary by trip ID
 * @param {string} tripId - Trip ID
 * @returns {Promise} Itinerary data
 */
export const getItineraryByTripId = async (tripId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/itineraries/trip/${tripId}`,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error getting itinerary by trip:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all itineraries for current user
 * @returns {Promise} List of itineraries
 */
export const getUserItineraries = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/itineraries`,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user itineraries:', error);
    throw error.response?.data || error;
  }
};

/**
 * Delete itinerary
 * @param {string} id - Itinerary ID
 * @returns {Promise} Delete confirmation
 */
export const deleteItinerary = async (id) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/itineraries/${id}`,
      createAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    throw error.response?.data || error;
  }
};

/**
 * Generate PDF for itinerary (client-side)
 * @param {object} itinerary - Itinerary data
 * @param {object} trip - Trip data
 */
export const generateItineraryPDF = (itinerary, trip) => {
  // This will be handled by html2pdf or jsPDF in the component
  // This function serves as a placeholder for the PDF generation logic
  console.log('Generating PDF for itinerary:', itinerary._id);
};

export default {
  generateItinerary,
  getItineraryById,
  getItineraryByTripId,
  getUserItineraries,
  deleteItinerary,
  generateItineraryPDF
};
