import React from 'react';
import { render } from '@testing-library/react';
import Register from '../pages/Register';
import { MemoryRouter } from 'react-router-dom';

describe('Register', () => {
  it('renderiza el componente Register', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
  });
});
