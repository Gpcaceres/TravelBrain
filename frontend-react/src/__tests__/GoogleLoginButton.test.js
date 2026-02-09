import React from 'react';
import { render, screen } from '@testing-library/react';
import GoogleLoginButton from '../components/GoogleLoginButton';

describe('GoogleLoginButton', () => {
  it('renderiza el botón de Google', () => {
    render(<GoogleLoginButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
