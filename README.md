# Delicia

Delicia is an upcoming intelligent ordering platform for restaurants. The project aims to combine a real-time ordering system with an AI assistant to streamline kitchen operations and improve customer experience.

For a complete Product Requirements Document (PRD) describing the vision, user roles and feature set, refer to the file ["__Delicia__ – Plataforma Inteligente de Pedidos para Restaurantes.MD"](./__Delicia__%20%E2%80%93%20Plataforma%20Inteligente%20de%20Pedidos%20para%20Restaurantes.MD) in this repository. A PDF version is also provided.

## Technology Stack

### Backend
- **NestJS** (Node.js/TypeScript) for a modular server-side application
- **PostgreSQL** with **Prisma** as ORM
- **Redis** (Pub/Sub) and **WebSockets** for real-time features

### Frontend
- **React** with Vite for a modern client-side application
- **Tailwind CSS** and ShadCN UI components for styling
- **TypeScript** across the stack

## Initial Setup (once code is added)
1. Install Node.js (LTS) and a package manager such as `npm` or `pnpm`.
2. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd Delicia
   npm install # or pnpm install
   ```
3. Create an `.env` file with database credentials and other environment variables.
4. Run database migrations with Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development servers:
   ```bash
   # In one terminal: backend
   npm run start:dev

   # In another terminal: frontend
   npm run dev
   ```
6. Access the application at `http://localhost:3000` (or the configured port).

These instructions will be updated as the codebase evolves.
