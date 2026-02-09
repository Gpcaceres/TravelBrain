import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  it('debe retornar un objeto con isAuthenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toHaveProperty('isAuthenticated');
  });
});
