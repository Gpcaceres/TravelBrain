import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';

describe('Dashboard', () => {
  it('renderiza el componente Dashboard', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  });
});
