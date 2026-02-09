import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Itineraries from '../pages/Itineraries';

describe('Itineraries', () => {
  it('renderiza el componente Itineraries', () => {
    render(
      <MemoryRouter>
        <Itineraries />
      </MemoryRouter>
    );
  });
});
