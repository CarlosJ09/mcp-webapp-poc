# MCP Server Transport Options

Este proyecto ahora soporta dos tipos de transporte para el servidor MCP:

## 1. HTTP Transport (StreamableHTTPServerTransport)

**Uso**: Para aplicaciones web que se conectan via HTTP/WebSocket

### Iniciar servidor HTTP:
```bash
cd backend && npm start
```

**Características:**
- ✅ Servidor HTTP en puerto 3000
- ✅ Comunicación via HTTP/WebSocket  
- ✅ Múltiples sesiones concurrentes
- ✅ Endpoints REST disponibles
- ✅ Compatible con frontend web
- ✅ Health checks en `/health`

**Endpoints disponibles:**
- `POST /mcp` - Comunicación MCP principal
- `GET /health` - Health check
- `GET /health/live` - Liveness probe  
- `GET /health/ready` - Readiness probe

## 2. Stdio Transport (StdioServerTransport)

**Uso**: Para herramientas CLI, scripts, integraciones nativas

### Iniciar servidor Stdio:
```bash
cd backend && npm run start:stdio
```

**Características:**
- ✅ Comunicación via stdin/stdout
- ✅ Ideal para CLIs y scripts
- ✅ Sin dependencias de red
- ✅ Comunicación directa proceso-a-proceso
- ✅ Perfecto para herramientas de desarrollo

## Recursos y Herramientas Disponibles (Ambos Transportes)

### 🛠️ **Tools disponibles:**
- `get-sales-metrics` - Obtener métricas de ventas por período
- `get-customer-analytics` - Obtener análisis de clientes
- `get-inventory-metrics` - Obtener métricas de inventario

### 📊 **Resources disponibles:**
- `sales-data` (`sales://all`) - Datos de ventas generales
- `customers-data` (`customers://all`) - Datos de clientes
- `dashboard-metrics` (`metrics://dashboard`) - Métricas del dashboard
- `items-data` (`items://all`) - Datos de elementos/productos

## Scripts NPM Disponibles

```bash
# Servidor HTTP (para aplicaciones web)
npm start                    # Desarrollo con watch
npm run start:prod          # Producción

# Servidor Stdio (para CLIs/scripts)  
npm run start:stdio         # Desarrollo con watch
npm run start:stdio:prod    # Producción

# Construcción
npm run build               # Compilar TypeScript
npm run build:watch         # Compilar con watch
```

## Ejemplos de Uso

### Uso con HTTP Transport (Frontend Web)
```javascript
// Frontend se conecta al servidor HTTP
const transport = new StreamableHTTPClientTransport(new URL('http://localhost:3000/mcp'));
const client = new Client(clientOptions);
await client.connect(transport);
```

### Uso con Stdio Transport (CLI/Script)
```javascript
// Script se conecta via stdio
const transport = new StdioClientTransport({
  command: 'node',
  args: ['dist/src/main/stdio-mcp-server.js']
});
const client = new Client(clientOptions);
await client.connect(transport);
```

## Casos de Uso Recomendados

### HTTP Transport 👉 Usar cuando:
- Desarrollas una aplicación web
- Necesitas múltiples clientes concurrentes
- Requieres endpoints REST adicionales
- Integras con servicios web externos
- Necesitas monitoreo y health checks

### Stdio Transport 👉 Usar cuando:
- Desarrollas herramientas CLI
- Integras con scripts/automatización
- Requieres máximo rendimiento
- No necesitas comunicación de red
- Desarrollas plugins para editores (VSCode, etc.)

## Arquitectura SOLID

Ambos transportes utilizan la misma arquitectura SOLID:
- **Single Responsibility**: Cada use case tiene una responsabilidad
- **Open/Closed**: Extensible via interfaces
- **Liskov Substitution**: Repositorios intercambiables  
- **Interface Segregation**: Interfaces específicas
- **Dependency Inversion**: Inyección de dependencias

Los mismos casos de uso, repositorios y servicios funcionan con ambos transportes sin cambios.
