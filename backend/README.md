# MCP Dashboard Backend

## Overview
Backend server for the MCP (Model Context Protocol) Dashboard application with clean architecture following SOLID principles.

## Architecture

The project follows a layered architecture pattern with clear separation of concerns:

```
src/
├── domain/           # Business logic and entities
│   ├── entities/     # Core business entities
│   └── interfaces/   # Domain interfaces and contracts
├── application/      # Use cases and application services
│   ├── services/     # Application services
│   └── use-cases/    # Business use cases
├── infrastructure/   # External systems integration
│   ├── repositories/ # Data access implementations
│   └── external/     # External service integrations
├── presentation/     # HTTP layer
│   └── controllers/  # Request/response handlers
├── shared/          # Shared utilities and configuration
│   ├── config/      # Application configuration
│   ├── types/       # TypeScript interfaces
│   └── utils/       # Utility functions
├── app.ts           # Express application setup
└── index.ts         # Application entry point
```

## SOLID Principles Implementation

- **Single Responsibility**: Each class and module has a single, well-defined purpose
- **Open/Closed**: Components are open for extension but closed for modification
- **Liskov Substitution**: Interfaces enable proper substitution of implementations
- **Interface Segregation**: Small, focused interfaces prevent unnecessary dependencies
- **Dependency Inversion**: High-level modules depend on abstractions, not concretions

## Features

- ✅ Clean Architecture with layered design
- ✅ Dependency Injection for loose coupling
- ✅ Structured logging with context
- ✅ Type-safe configuration management
- ✅ CORS and security middleware
- ✅ Health check endpoints
- ✅ Graceful shutdown handling
- ✅ Environment-based configuration
- ✅ Error handling and validation
- ✅ MCP Protocol support
- ✅ RESTful API design

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run start          # Start with hot reload
npm run start:dev      # Alternative development command
```

### Production
```bash
npm run build          # Compile TypeScript
npm run start:prod     # Start production server
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Dashboard
- `GET /api/dashboard` - Main dashboard data (placeholder)

## Environment Variables

```bash
NODE_ENV=development
PORT=3000
HOST=localhost
ALLOWED_ORIGINS=http://localhost:3002,http://localhost:3001
HOSTDATA_URL=https://server-api-thryv.onrender.com
```

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **dotenv** - Environment variable management
- **cors** - CORS middleware
- **@modelcontextprotocol/sdk** - MCP Protocol support

## License

ISC
