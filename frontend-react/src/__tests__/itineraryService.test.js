import * as itineraryService from '../services/itineraryService';

describe('itineraryService', () => {
  it('debe tener métodos definidos', () => {
    expect(itineraryService).toHaveProperty('getUserItineraries');
    expect(itineraryService).toHaveProperty('getItineraryById');
    expect(itineraryService).toHaveProperty('getItineraryByTripId');
    expect(itineraryService).toHaveProperty('generateItinerary');
    expect(itineraryService).toHaveProperty('generateItineraryPDF');
    expect(itineraryService).toHaveProperty('deleteItinerary');
  });
});
