// Prueba E2E básica con Cypress
// Este archivo es un ejemplo para cypress/integration/travelbrain.e2e.js

describe('TravelBrain E2E', () => {
  it('Carga la página principal', () => {
    cy.visit('https://travelbrain.ddns.net/')
    cy.contains('TravelBrain')
  })

  it('Login de usuario', () => {
    cy.visit('https://travelbrain.ddns.net/login')
    cy.get('input[name="username"]').type('test')
    cy.get('input[name="password"]').type('test')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })

  it('Crear un viaje', () => {
    cy.visit('https://travelbrain.ddns.net/trips')
    cy.get('button#create-trip').click()
    cy.get('input[name="tripName"]').type('Viaje E2E')
    cy.get('button[type="submit"]').click()
    cy.contains('Viaje E2E')
  })
})
