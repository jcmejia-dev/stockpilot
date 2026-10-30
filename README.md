# StockPilot

**Simple inventory management for small businesses.**

StockPilot is the first flagship SaaS product under Mejia Software. The project is currently in **Alpha Preview**.

## Current deployment

This repository currently contains the public Vue 3 + Vite frontend preview and a GitHub Pages deployment workflow.

GitHub Pages hosts static frontend assets only. Real StockPilot authentication, tenant isolation, inventory transactions, PostgreSQL/MySQL data, audit logs, and server-side authorization will be implemented in the application backend and deployed to infrastructure suitable for Laravel.

## Stack direction

- Frontend: Vue 3 + Vite
- Backend: Laravel (planned next phase)
- Database: PostgreSQL or MySQL (planned next phase)
- CI/CD: GitHub Actions
- Preview hosting: GitHub Pages

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Product principles

- Inventory correctness before flashy features
- Every stock change must be traceable
- Tenant isolation is a security requirement
- Mobile-friendly for small Philippine businesses
- No fake production claims: status stays Alpha/Beta until real workflows are tested
