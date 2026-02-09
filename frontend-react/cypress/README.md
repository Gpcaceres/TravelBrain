# Cypress E2E Tests for TravelBrain

This directory contains End-to-End (E2E) tests for TravelBrain using Cypress.

## Setup

1. Install dependencies (from the `frontend-react` directory):
```bash
npm install
```

This will install Cypress as defined in the devDependencies.

## Running Tests

### Interactive Mode (Recommended for Development)
Opens the Cypress Test Runner where you can see tests running in a browser:
```bash
npm run cypress:open
```

### Headless Mode (For CI/CD)
Runs all tests in the terminal without opening a browser:
```bash
npm run cypress:run
```

## Test Structure

The tests are located in `cypress/e2e/travelbrain.e2e.cy.js` and cover:

1. **Carga la página principal** - Verifies the landing page loads correctly
2. **Login exitoso con credenciales válidas** - Tests successful login
3. **Login fallido con contraseña incorrecta** - Tests failed login with wrong password
4. **Crear un viaje** - Tests creating a new trip with complete form submission
5. **Navegar al dashboard después del login** - Tests dashboard navigation and content
6. **Acceder a la página de destinos** - Tests destinations page access
7. **Acceder a la página del clima** - Tests weather page access
8. **Acceder a la página de perfil** - Tests profile page access
9. **Verificar protección de rutas sin autenticación** - Tests route protection for unauthorized users

## Test Credentials

The tests use the following credentials:
- Email: `ithopc@gmail.com`
- Password: `admin1234`

**Note:** These credentials must exist in the production database at `https://travelbrain.ddns.net/` for the tests to pass.

## Test Environment

All tests run against the production environment:
- Base URL: `https://travelbrain.ddns.net/`

## Notes

- Tests include appropriate wait times for asynchronous operations
- The "Create Trip" test logs in first before attempting to create a trip
- Protected route tests verify proper authentication redirects
- All authenticated tests perform login before accessing protected pages

## Troubleshooting

If tests fail:
1. Verify the application is running at `https://travelbrain.ddns.net/`
2. Check that test credentials are valid
3. Ensure the database has necessary test data
4. Check network connectivity to the production server
5. Review Cypress logs for specific error messages
