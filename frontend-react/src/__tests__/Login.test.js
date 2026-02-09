import React from 'react';
import { render } from '@testing-library/react';
import Login from '../pages/Login';
import { MemoryRouter } from 'react-router-dom';

describe('Login', () => {
  it('renderiza el componente Login', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });
});
