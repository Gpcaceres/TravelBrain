## Proceso de Pruebas E2E (Cypress)

Las pruebas End-to-End (E2E) permiten validar el funcionamiento completo del sistema desde la perspectiva del usuario final, accediendo a la aplicación desplegada en https://travelbrain.ddns.net/.

### Pasos para ejecutar pruebas E2E:
1. Instalar Cypress en el proyecto frontend:
	- Ejecutar: `npm install cypress --save-dev`
2. Ubicar los archivos de prueba en `frontend-react/cypress/integration/`.
3. Modificar las pruebas para apuntar a la URL pública (`https://travelbrain.ddns.net`).
4. Ejecutar Cypress:
	- Modo interactivo: `npx cypress open`
	- Modo consola: `npx cypress run`
5. Revisar los resultados y reportes generados por Cypress.

Estas pruebas permiten detectar errores en el flujo de usuario, login, creación de viajes y navegación general, asegurando que el sistema funciona correctamente en producción.
# Plan de Pruebas Actualizado para TravelBrain

Este documento detalla las pruebas recomendadas considerando la arquitectura actual del proyecto, con servicios levantados en contenedores Docker:

## Servicios Activos
- travelbrain-nginx (proxy/reverse, HTTPS)
- travelbrain-frontend (React)
- travelbrain-backend (Node.js/Express)
- travelbrain-business-rules (Node.js/Express)
- travelbrain-certbot (Certificados SSL)

## Pruebas por Servicio

### 1. Frontend (travelbrain-frontend)
- **Pruebas unitarias:** Componentes, hooks y servicios (Jest, React Testing Library).
- **Pruebas de integración:** Flujo entre componentes y servicios.
- **Pruebas E2E:** Simulación de usuario (Cypress).
- **Pruebas de cobertura:** Reportes automáticos.

### 2. Backend (travelbrain-backend)
- **Pruebas unitarias:** Controladores, modelos, utilidades (Jest, Mocha/Chai).
- **Pruebas de integración:** Rutas, lógica de negocio, conexión a base de datos (Supertest).
- **Pruebas de cobertura:** Reportes automáticos.
- **Pruebas de seguridad:** Autenticación, autorización, inyección SQL (SonarQube, manuales).
- **Pruebas de rendimiento:** Endpoints críticos (Artillery).

### 3. Business Rules (travelbrain-business-rules)
- **Pruebas unitarias:** Lógica de reglas de negocio.
- **Pruebas de integración:** Interacción con backend y base de datos.
- **Pruebas de cobertura:** Reportes automáticos.

### 4. Nginx (travelbrain-nginx)
- **Pruebas de configuración:** Validación de rutas, HTTPS, redirecciones.
- **Pruebas de seguridad:** Certificados, headers, protección contra ataques comunes.

### 5. Certbot (travelbrain-certbot)
- **Pruebas de renovación:** Validar renovación automática de certificados.

## Pruebas Transversales
- **Pruebas de regresión:** En todos los servicios, para asegurar que nuevas funcionalidades no rompen las existentes.
- **Pruebas de integración entre servicios:** Validar comunicación entre frontend, backend y business rules.
- **Pruebas de despliegue:** Validar que los contenedores se levantan correctamente y están accesibles.

## Herramientas de Calidad
- **SonarQube:** Análisis de calidad y seguridad del código.

---

Este plan cubre los aspectos esenciales para asegurar la calidad, seguridad y estabilidad de TravelBrain en su arquitectura actual.