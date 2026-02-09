// Prueba E2E básica con Cypress
// Archivo para cypress/e2e/travelbrain.e2e.cy.js

describe('TravelBrain E2E', () => {
  it('Carga la página principal', () => {
    cy.visit('https://travelbrain.ddns.net/')
    cy.contains('TRAVELBRAIN')
  })

  it('Login exitoso con credenciales válidas', () => {
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('admin1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('Login fallido con contraseña incorrecta', () => {
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('incorrecta123')
    cy.get('button[type="submit"]').click()
      // Espera un poco para que la respuesta se procese
      cy.wait(1000)
      // Verifica que NO redirige al dashboard
      cy.url().should('include', '/login')
      // Opcional: verifica el mensaje de error si es visible
      cy.contains('Contraseña incorrecta').should('exist')
  })

  it('Crear un viaje', () => {
    // First login
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('admin1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // Navigate to trips
    cy.visit('https://travelbrain.ddns.net/trips')
    cy.wait(1000) // Wait for page to load
    
    // Click create trip button (using class since there's no ID)
    cy.get('button.btn-primary').contains('Create Trip').click()
    cy.wait(500)
    
    // Fill in trip form
    cy.get('input#title').type('Viaje E2E Cypress')
    cy.get('input#destination').type('Quito Canton, Pichincha, Ecuador').click()
    cy.wait(500)
    cy.get('input#startDate').should('be.visible').should('be.enabled').type('2026-06-01')
    cy.get('input#endDate').should('be.visible').should('be.enabled').type('2026-06-15')
    cy.get('input#budget').type('500')
    cy.get('textarea#description').type('test');
    // Submit form
    cy.get('button[type="submit"]').click()
    cy.wait(2000)
    // Verify trip was created
    cy.contains('Viaje E2E Cypress').should('exist')
  })

  it('Navegar al dashboard después del login', () => {
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('admin1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome back').should('exist')
    cy.contains('Total Trips').should('exist')
  })

  it('Acceder a la página de destinos', () => {
    // Login first
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('admin1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // Navigate to destinations
    cy.visit('https://travelbrain.ddns.net/destinations')
    cy.wait(1000)
    cy.url().should('include', '/destinations')
  })

  it('Acceder a la página del clima', () => {
    // Login first
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('admin1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // Navigate to weather
    cy.visit('https://travelbrain.ddns.net/weather')
    cy.wait(1000)
    cy.url().should('include', '/weather')
  })

  it('Acceder a la página de perfil', () => {
    // Login first
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input#email').type('test@test.com')
    cy.get('input[type="password"]').type('admin1234')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    
    // Navigate to profile
    cy.visit('https://travelbrain.ddns.net/profile')
    cy.wait(1000)
    cy.url().should('include', '/profile')
  })

  it('Verificar protección de rutas sin autenticación', () => {
    // Try to access protected route without login
    cy.visit('https://travelbrain.ddns.net/trips')
    // Should redirect to login
    cy.url().should('include', '/login')
  })
})
