import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Trips from '../pages/Trips';

describe('Trips', () => {
  it('renderiza el componente Trips', () => {
      render(
        <MemoryRouter>
          <Trips />
        </MemoryRouter>
      );
  });
});
