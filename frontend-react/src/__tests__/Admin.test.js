import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../pages/Admin';

describe('Admin', () => {
  it('renderiza el componente Admin', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );
  });
});
