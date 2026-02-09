import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthSuccess from '../pages/AuthSuccess';

describe('AuthSuccess', () => {
  it('renderiza el componente AuthSuccess', () => {
    render(
      <MemoryRouter initialEntries={["/auth/success?token=123"]}>
        <Routes>
          <Route path="/auth/success" element={<AuthSuccess />} />
        </Routes>
      </MemoryRouter>
    );
  });
});
