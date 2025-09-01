# MCP WebApp Backend - Production Ready

## Overview

This is a production-ready backend implementation for the Model Context Protocol (MCP) WebApp. It provides a robust, scalable, and maintainable architecture following industry best practices.

## 🏗 Architecture

### Layered Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Middleware  │  │   Routes    │  │  Controllers │        │
│  │ (Security,  │  │             │  │              │        │
│  │  CORS, etc) │  │             │  │              │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ MCP Server  │  │   Tools     │  │  Resources  │        │
│  │   Service   │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │External API │  │   Caching   │  │   Logging   │        │
│  │  Service    │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
backend/
├── config/                 # Configuration management
│   ├── app.ts              # Centralized app configuration
│   ├── cors.ts             # CORS policies
│   └── logger.ts           # Logging configuration
├── middleware/             # Express middleware
│   ├── security.ts         # Security middleware (rate limiting, validation)
│   └── health.ts           # Health check endpoints
├── services/               # Business logic services
│   ├── mcp-server.ts       # MCP server management
│   └── external/           # External service integrations
│       └── api-service.ts  # External API client
├── resources/              # MCP resources
│   └── dashboard-resources.ts
├── tools/                  # MCP tools
│   └── dashboard-tools.ts
├── routes/                 # HTTP routes
│   └── mcp-routes.ts
└── index.ts               # Application entry point
```

## 🔧 Configuration Management

### Environment Variables
The application uses a centralized configuration system with environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `HOST` | Server host | `localhost` |
| `HOSTDATA_URL` | External API URL | `https://server-api-thryv.onrender.com` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:3002,http://localhost:3001` |
| `LOG_LEVEL` | Logging level | `info` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | `900000` |
| `HEALTH_CHECK_ENABLED` | Enable health checks | `true` |

### Configuration Files
- `.env` - Environment-specific variables
- `.env.example` - Template for environment variables
- `config/app.ts` - Centralized configuration with validation

## 🛡 Security Features

### Rate Limiting
- Configurable rate limits per IP address
- Customizable time windows
- Graceful error responses
- Logging of rate limit violations

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` with strict rules
- Removal of `X-Powered-By` header

### Request Validation
- Content-Type validation for POST requests
- Payload size limits (1MB default)
- JSON structure validation

### CORS Configuration
- Environment-specific CORS policies
- Strict production settings
- Permissive development settings
- MCP-specific headers support

## 📊 Monitoring & Observability

### Health Checks
Three health check endpoints are provided:

#### `/health` - Comprehensive Health Check
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "memory": {
      "status": "pass",
      "usage": 45.2
    },
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

#### `/health/live` - Liveness Probe
Basic check to verify the process is running.

#### `/health/ready` - Readiness Probe  
Checks if the service is ready to handle requests.

### Structured Logging
- JSON-structured logs in production
- Configurable log levels (error, warn, info, debug)
- Context-aware logging with service names
- Request/response logging for debugging
- Error tracking with stack traces

## 🔌 MCP Integration

### Resources
Four main dashboard resources are provided:
- `sales://monthly` - Monthly sales data
- `customers://all` - Customer information
- `metrics://dashboard` - Dashboard metrics
- `items://all` - Inventory items

### Tools
Three interactive tools are available:
- `get-sales-metrics` - Sales metrics by period
- `get-customers-metrics` - Customer analytics
- `get-inventory-metrics` - Inventory status

### Error Handling
- Comprehensive error catching and logging
- Graceful degradation with error responses
- Retry logic for external API calls
- Timeout handling for network requests

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Start in production mode:
   ```bash
   npm run start:prod
   ```

### Development Mode
```bash
# Watch mode with TypeScript
npm start

# MCP stdio server
npm run start:stdio
```

### Scripts Available
- `npm start` - Development mode with watch
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start:prod` - Run compiled JavaScript
- `npm run start:stdio:prod` - Run compiled MCP stdio server
- `npm test` - Run tests (placeholder)

## 📈 Performance Considerations

### Caching Strategy
- HTTP response caching headers
- In-memory caching for frequently accessed data
- External API response caching

### Resource Management
- Memory usage monitoring
- Connection pooling for external APIs
- Graceful shutdown handling

### Scalability
- Stateless design for horizontal scaling
- Environment-based configuration
- Health checks for load balancer integration

## 🧪 Testing Strategy

### Unit Tests
- Service layer testing
- Configuration validation
- Error handling scenarios

### Integration Tests
- MCP protocol compliance
- External API integration
- Health check endpoints

### Load Testing
- Rate limiting validation
- Performance under load
- Memory leak detection

## 📝 API Documentation

### MCP Endpoints
- `POST /mcp` - Main MCP protocol endpoint
- `GET /health` - Health check
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

### Request/Response Format
All MCP communication follows JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "method": "resources/read",
  "params": {
    "uri": "sales://monthly"
  },
  "id": "request-id"
}
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit sensitive data to version control
2. **Rate Limiting**: Implement appropriate limits for your use case  
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Validate all user inputs
5. **Error Handling**: Don't leak sensitive information in errors
6. **Logging**: Log security events for monitoring
7. **Dependencies**: Keep dependencies up to date

## 📚 Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

## 🤝 Contributing

1. Follow the established code style
2. Add tests for new features
3. Update documentation as needed
4. Use conventional commits
5. Ensure security best practices

## 📄 License

This project is licensed under the ISC License.
