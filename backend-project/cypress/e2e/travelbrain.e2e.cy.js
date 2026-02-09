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
      cy.contains('Contraseña incorrecta.').should('exist')
  })

  it('Crear un viaje', () => {
    cy.visit('https://travelbrain.ddns.net/trips')
    cy.get('button#create-trip').click()
    cy.get('input[name="tripName"]').type('Viaje E2E')
    cy.get('button[type="submit"]').click()
    cy.contains('Viaje E2E')
  })
})
