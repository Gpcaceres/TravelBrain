import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from '../pages/Profile';

describe('Profile', () => {
  it('renderiza el componente Profile', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  });
});
