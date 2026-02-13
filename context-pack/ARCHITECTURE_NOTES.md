# NPSme Architecture

Frontend:
- React + Vite
- Tailwind
- Recharts 3.7
- Routing via routesRegistry.js
- Protected routes via cookie auth

Backend:
- Express server.js
- intercom.routes.js mounted under /api/intercom
- Dropbox storage for survey exports
- Public endpoints under /api/intercom/public

Deploy:
- Heroku
- Procfile: web: node server.js
- Build via Vite

Key pages:
- /envola
- /intercom-nps-analytics
