// Prueba unitaria de componente React
import { render, screen } from '@testing-library/react'
import App from '../components/App'

test('renderiza el título principal', () => {
  render(<App />)
  expect(screen.getByText(/TravelBrain/i)).toBeInTheDocument()
})
