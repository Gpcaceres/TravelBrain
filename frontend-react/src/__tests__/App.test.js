// Prueba unitaria de componente React
import { render, screen } from '@testing-library/react'
import React from 'react';
// Mock de Destinations para evitar error de import.meta.env
jest.mock('../pages/Destinations', () => () => <div>Mock Destinations</div>);
import App from '../App';

import { MemoryRouter } from 'react-router-dom';

test('renderiza el título principal', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const elements = screen.getAllByText(/TravelBrain/i);
  expect(elements.length).toBeGreaterThan(0);
});
