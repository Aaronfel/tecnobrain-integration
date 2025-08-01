# Tecnobrain Integration

A NestJS application with Prisma ORM and PostgreSQL database.

## Features

- **NestJS** - A progressive Node.js framework
- **Prisma** - Next-generation ORM for Node.js and TypeScript
- **PostgreSQL** - Robust relational database (dockerized)
- **Docker Compose** - For database containerization
- **TypeScript** - Type-safe development

## Prerequisites

- Node.js (version 18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo 'DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/tecnobrain_db"
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key' > .env

# 3. Start everything with Docker
npm run dev

# 4. Setup database (first time only)
npm run dev:setup

# 🎉 Done! App running at http://localhost:3000
```

## Getting Started (Detailed)

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/tecnobrain_db"

# Application
PORT=3000
NODE_ENV=development

# JWT (for future authentication)
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Start Development Environment

**Super Easy Docker Setup:**

```bash
# 1. Start everything with Docker
npm run dev

# 2. Set up database (first time only)
npm run dev:setup
```

**That's it! 🎉** Your app is running at `http://localhost:3000`

### Alternative: Local Development (Database Only)

```bash
# Start only PostgreSQL in Docker
docker-compose up -d postgres

# Run app locally
npm run start:dev

# Set up database (first time only)
npm run db:generate
npm run db:migrate
npm run db:seed
```

## API Endpoints

### Users API

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

Example user creation:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

## Database Management

### 🐳 With Docker (Recommended)

```bash
# All-in-one database setup
npm run dev:setup    # generate + migrate + seed

# Individual commands
npm run generate     # Generate Prisma client
npm run migrate      # Create and apply migrations
npm run seed        # Seed with sample data
npm run studio      # Open Prisma Studio GUI
```

### 🏠 Local Development (Alternative)

```bash
# When running app locally (not in Docker)
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create and apply migrations
npm run db:push      # Push schema without migration
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed with sample data
```

## Development

### 🚀 Super Simple Commands

```bash
# Start everything (Docker + Database + App)
npm run dev

# First time setup (generate + migrate + seed)
npm run dev:setup

# View logs from all services
npm run dev:logs

# Stop everything
npm run dev:stop
```

### 🔧 Database Commands

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database with sample data
npm run seed

# Open Prisma Studio (database GUI)
npm run studio
```

### 🏗️ Build Commands

```bash
# Build for production
npm run build

# Start production build locally
npm run start:prod

# Start with local hot reload (no Docker)
npm run start:dev
```

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

## Project Structure

```
src/
├── prisma/           # Prisma service and module
├── users/            # Users module (example)
├── app.controller.ts # Main application controller
├── app.module.ts     # Root application module
├── app.service.ts    # Main application service
└── main.ts          # Application entry point

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Database seeding script
```

## Adding New Modules

To add a new module (e.g., Posts):

1. Generate the module:

```bash
nest generate module posts
nest generate service posts
nest generate controller posts
```

2. Inject PrismaService into your service
3. Add the module to `app.module.ts`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens

## 🐳 Docker Deployment Options

### Option 1: Local Development (Database Only)

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Run NestJS locally
npm run start:dev
```

### Option 2: Full Docker Development

```bash
# Start both database and application
npm run docker:dev

# Or run in detached mode
npm run docker:dev:detached
```

### Option 3: Production Docker Deployment

```bash
# Production build and run
npm run docker:prod

# Or in detached mode
npm run docker:prod:detached
```

## Docker Commands Reference

```bash
# Development
npm run docker:dev              # Start both services in foreground
npm run docker:dev:detached     # Start both services in background

# Production
npm run docker:prod             # Start production build in foreground
npm run docker:prod:detached    # Start production build in background

# Management
npm run docker:down             # Stop all services
npm run docker:logs             # View logs from all services
docker-compose logs app         # View only app logs
docker-compose logs postgres    # View only database logs

# Database management in Docker
docker-compose exec app npm run db:migrate    # Run migrations
docker-compose exec app npm run db:seed       # Seed database
docker-compose exec app npm run db:studio     # Open Prisma Studio

# Direct database access
docker-compose exec postgres psql -U postgres -d tecnobrain_db
```

## 🔧 Docker Environment Setup

For Docker deployment, use these environment variables:

```bash
# For Docker (internal network)
DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/tecnobrain_db"

# For Production
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-production-jwt-secret
```
