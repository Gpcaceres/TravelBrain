import React from 'react';
import { render } from '@testing-library/react';
import Weather from '../pages/Weather';

describe('Weather', () => {
  it('renderiza el componente Weather', () => {
    render(<Weather />);
  });
});
