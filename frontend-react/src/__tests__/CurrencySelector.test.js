import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CurrencySelector from '../components/CurrencySelector';

describe('CurrencySelector', () => {
  it('renderiza el selector de moneda', () => {
    act(() => {
      render(<CurrencySelector value="USD" onChange={() => {}} />);
    });
    expect(screen.getByRole('button', { name: /conversor de divisas/i })).toBeInTheDocument();
  });
});
