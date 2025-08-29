# MCP WebApp POC - Production Ready Setup Guide

This project contains a production-ready backend (MCP Server) and frontend (Next.js app) configured to run with Node.js by compiling TypeScript to JavaScript.

## Project Structure

```
├── backend/                # Production-ready MCP Server (Express.js)
│   ├── config/            # Centralized configuration
│   ├── middleware/        # Security, health checks, logging
│   ├── services/          # Business logic and external APIs
│   ├── resources/         # MCP resources
│   ├── tools/             # MCP tools
│   ├── routes/            # HTTP routes
│   └── .env               # Environment variables
├── frontend/              # Next.js application with static export
│   ├── src/               # Source code
│   ├── server.js          # Custom Node.js static server
│   └── .env.local         # Frontend environment variables
└── SETUP.md              # This setup guide
```

## Features Implemented

### Backend (Production Ready)
- ✅ **Layered Architecture**: Clean separation of concerns
- ✅ **Environment Configuration**: Centralized config management
- ✅ **Security Middleware**: Rate limiting, security headers, CORS
- ✅ **Health Monitoring**: Comprehensive health checks
- ✅ **Structured Logging**: JSON logs with context
- ✅ **Error Handling**: Graceful error management
- ✅ **External API Service**: Abstracted data layer
- ✅ **TypeScript**: Full type safety

### Frontend
- ✅ **Static Export**: Compiled to static files
- ✅ **Custom Server**: Node.js HTTP server for serving static files
- ✅ **Environment Variables**: Configuration management
- ✅ **Next.js 15**: Modern React framework

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation & Setup

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment
```bash
cp .env.example .env
# Edit .env file with your configuration
```

#### Key Environment Variables
```bash
# Server Configuration  
NODE_ENV=development
PORT=3000
HOST=localhost

# External Services
HOSTDATA_URL=https://server-api-thryv.onrender.com

# CORS (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:3002,http://localhost:3001

# Security
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=true

# Health Checks
HEALTH_CHECK_ENABLED=true
```

#### Build & Run
```bash
# Compile TypeScript to JavaScript
npm run build

# Run in production mode
npm run start:prod
```

The backend will be available at: `http://localhost:3000`

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend  
npm install
```

#### Configure Environment
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

#### Key Frontend Environment Variables
```bash
# MCP Server
NEXT_PUBLIC_MCP_SERVER_HOST=http://localhost:3000/mcp

# Application
NEXT_PUBLIC_APP_NAME=MCP Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# Performance
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_RECONNECT_ATTEMPTS=3

# Features
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

#### Build & Run (Static Mode)
```bash
# Compile to static files
npm run build:static

# Run custom Node.js server
npm run start:static
```

Or use the combined command:
```bash
npm run start:prod
```

The frontend will be available at: `http://localhost:3002`

#### Development Mode
```bash
npm run dev
# Runs Next.js development server on port 3002
```

## Available Scripts

### Backend Scripts
- `npm start` - Development mode with TypeScript watch
- `npm run build` - Compile TypeScript to JavaScript  
- `npm run start:prod` - Production mode (compiled)
- `npm run start:stdio` - MCP stdio server (development)
- `npm run start:stdio:prod` - MCP stdio server (production)

### Frontend Scripts
- `npm run dev` - Development mode (port 3002)
- `npm run build` - Next.js production build
- `npm run build:static` - Static export build
- `npm run start:static` - Custom Node.js static server
- `npm run start:prod` - Build and serve static files
- `npm run lint` - Code linting

## Running Both Services

### Terminal 1 - Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure .env file
npm run build  
npm run start:prod
```

### Terminal 2 - Frontend  
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure .env.local file
npm run start:prod
```

## Monitoring & Health Checks

The backend provides several monitoring endpoints:

### Health Check Endpoints
- `GET /health` - Comprehensive health status
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Example Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z", 
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "development",
  "checks": {
    "memory": { "status": "pass", "usage": 45.2 },
    "external_service": { 
      "status": "pass", 
      "message": "External API accessible",
      "duration": 150 
    },
    "uptime": {
      "status": "pass",
      "message": "Process running for 3600 seconds"
    }
  }
}
```

## Security Features

### Backend Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: XSS protection, content type validation
- **CORS Policy**: Environment-specific origin restrictions  
- **Request Validation**: JSON payload validation and size limits
- **Error Handling**: Secure error responses without information leakage

### Production Recommendations
1. Use HTTPS in production
2. Configure appropriate rate limits
3. Set restrictive CORS origins
4. Enable comprehensive logging
5. Monitor health check endpoints
6. Use environment variables for secrets

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # Backend
lsof -i :3002  # Frontend

# Kill the process
kill -9 <PID>
```

#### Environment Variables Not Loading
- Ensure `.env` files are in the correct directories
- Check file names: `.env` (backend), `.env.local` (frontend)  
- Verify syntax (no spaces around = signs)

#### External API Connection Issues
- Check `HOSTDATA_URL` in backend `.env`
- Verify network connectivity
- Check health endpoint: `GET /health`

#### CORS Errors
- Verify `ALLOWED_ORIGINS` in backend `.env`
- Ensure frontend URL matches allowed origins
- Check browser developer tools for specific CORS errors

### Logs & Debugging

#### Backend Logs
```bash
# Enable debug logging
echo "ENABLE_DEBUG_LOGS=true" >> backend/.env
echo "LOG_LEVEL=debug" >> backend/.env
```

#### Frontend Debugging
```bash
# Enable debug mode
echo "NEXT_PUBLIC_ENABLE_DEBUG_MODE=true" >> frontend/.env.local
```

## Architecture Notes

### Backend Architecture
- **Layered Design**: Presentation → Business → Data layers
- **Dependency Injection**: Services and configuration
- **Error Boundaries**: Graceful error handling
- **Observability**: Structured logging and health checks

### Frontend Architecture  
- **Static Generation**: No server-side rendering needed
- **Custom Server**: Node.js HTTP server for production
- **Environment Config**: Centralized configuration management
- **MCP Integration**: Direct protocol communication

## Performance Considerations

### Backend Performance
- Connection pooling for external APIs
- Request/response caching headers
- Memory usage monitoring
- Graceful shutdown handling

### Frontend Performance
- Static file serving with proper MIME types
- Asset optimization through Next.js build
- Client-side caching of MCP responses
- Lazy loading of dashboard components

## Development vs Production

### Development Features
- Permissive CORS policy  
- Detailed error messages
- Request/response logging
- Hot reloading (frontend)

### Production Features
- Strict CORS policy
- Minimal error information  
- Structured JSON logging
- Static file optimization
- Security headers
- Rate limiting

This setup provides a solid foundation for both development and production deployments with proper monitoring, security, and performance considerations.

### Frontend

1. **Instalar dependencias**
   ```bash
   cd frontend
   npm install
   ```

2. **Modo Desarrollo (con TypeScript)**
   ```bash
   npm run dev
   ```
   
   La aplicación estará disponible en: `http://localhost:3002`

3. **Modo Producción (compilado a JavaScript estático)**
   ```bash
   npm run build:static
   npm run start:static
   ```
   
   O en un solo comando:
   ```bash
   npm run start:prod
   ```

4. **Ejecutar servidor estático directamente**
   ```bash
   node server.js
   ```

#### Scripts Disponibles (Frontend)

- `npm run dev` - Ejecuta en modo desarrollo (puerto 3002)
- `npm run build` - Compila para producción con Next.js
- `npm run build:static` - Compila a archivos estáticos en carpeta `out/`
- `npm run start` - Ejecuta la versión compilada de Next.js
- `npm run start:static` - Ejecuta servidor HTTP básico para archivos estáticos
- `npm run start:prod` - Compila y ejecuta en modo producción estático
- `npm run lint` - Ejecuta el linter

## Ejecución Completa

Para ejecutar ambos servicios:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm install
   npm run build
   npm run start:prod
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm install
   npm run start:prod
   ```

El backend estará en `http://localhost:3000` y el frontend en `http://localhost:3002`.

## Notas Importantes

- El backend se compiló de ESNext a CommonJS para mejor compatibilidad con Node.js
- El archivo `stdio-mcp-server.ts` fue modificado para evitar el uso de top-level await
- El frontend se configuró para generar archivos estáticos que se sirven con un servidor HTTP básico de Node.js
- Next.js se configuró con `output: 'export'` para generar archivos completamente estáticos
- Las dependencias deben instalarse en cada directorio por separado
- El frontend cambió del puerto 3001 al 3002 para evitar conflictos
