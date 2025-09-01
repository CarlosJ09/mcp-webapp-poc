# Backend Architecture - Layered Structure

Este documento describe la nueva arquitectura por capas del backend, implementada sin cambiar funcionalidad, funciones, datos de prueba o nombres/referencias.

## Estructura del Proyecto

```
backend/
├── src/                          # Código fuente
│   ├── application/              # Capa de aplicación
│   │   ├── services/            # Servicios de aplicación
│   │   │   ├── dashboard-resources.ts  # Recursos del dashboard MCP
│   │   │   └── dashboard-tools.ts      # Herramientas del dashboard MCP
│   │   └── use-cases/           # Casos de uso (para futuro desarrollo)
│   │
│   ├── domain/                   # Capa de dominio
│   │   ├── entities/            # Entidades de dominio (para futuro desarrollo)
│   │   └── repositories/        # Interfaces de repositorios (para futuro desarrollo)
│   │
│   ├── infrastructure/           # Capa de infraestructura
│   │   ├── external/            # Servicios externos
│   │   │   └── api-service.ts   # Cliente API externo
│   │   ├── persistence/         # Persistencia de datos (para futuro desarrollo)
│   │   └── transport/           # Transporte MCP
│   │       └── mcp-server.ts    # Servidor MCP y gestión de transporte
│   │
│   ├── presentation/             # Capa de presentación
│   │   ├── controllers/         # Controladores (para futuro desarrollo)
│   │   ├── middleware/          # Middleware HTTP
│   │   │   ├── health.ts        # Middleware de health checks
│   │   │   └── security.ts      # Middleware de seguridad
│   │   └── routes/              # Definición de rutas
│   │       └── mcp-routes.ts    # Rutas MCP
│   │
│   ├── shared/                   # Código compartido
│   │   ├── config/              # Configuraciones
│   │   │   ├── app.ts           # Configuración general
│   │   │   ├── cors.ts          # Configuración CORS
│   │   │   └── logger.ts        # Configuración de logging
│   │   ├── utils/               # Utilidades (para futuro desarrollo)
│   │   └── types/               # Tipos compartidos (para futuro desarrollo)
│   │
│   └── main/                     # Punto de entrada principal
│       ├── index.ts             # Servidor HTTP principal
│       └── stdio-mcp-server.ts  # Servidor MCP via STDIO
│
├── dist/                         # Código compilado
├── node_modules/                 # Dependencias
└── archivos de configuración raíz
```

## Descripción de las Capas

### 1. **Presentation Layer** (`src/presentation/`)
- **Responsabilidad**: Maneja la interfaz HTTP y las interacciones con clientes
- **Componentes**:
  - **Routes**: Definen endpoints HTTP y enrutan requests
  - **Middleware**: Procesan requests (seguridad, logging, validación)
  - **Controllers**: (Preparado para futuro desarrollo de controladores dedicados)

### 2. **Application Layer** (`src/application/`)
- **Responsabilidad**: Contiene la lógica de aplicación y orquestación
- **Componentes**:
  - **Services**: Servicios de aplicación que orquestan operaciones
    - `dashboard-resources.ts`: Maneja recursos MCP del dashboard
    - `dashboard-tools.ts`: Maneja herramientas MCP del dashboard
  - **Use Cases**: (Preparado para casos de uso específicos del negocio)

### 3. **Infrastructure Layer** (`src/infrastructure/`)
- **Responsabilidad**: Implementa detalles técnicos y comunicación externa
- **Componentes**:
  - **External**: Servicios para comunicación con APIs externas
    - `api-service.ts`: Cliente HTTP para API externa
  - **Transport**: Manejo del protocolo MCP
    - `mcp-server.ts`: Implementación del servidor MCP
  - **Persistence**: (Preparado para implementaciones de base de datos)

### 4. **Domain Layer** (`src/domain/`)
- **Responsabilidad**: Contiene la lógica de negocio pura
- **Componentes**:
  - **Entities**: (Preparado para entidades de dominio)
  - **Repositories**: (Preparado para interfaces de repositorios)

### 5. **Shared Layer** (`src/shared/`)
- **Responsabilidad**: Código y configuración compartida entre capas
- **Componentes**:
  - **Config**: Configuración de la aplicación
  - **Utils**: (Preparado para utilidades comunes)
  - **Types**: (Preparado para tipos TypeScript compartidos)

### 6. **Main Layer** (`src/main/`)
- **Responsabilidad**: Puntos de entrada de la aplicación
- **Componentes**:
  - `index.ts`: Servidor HTTP principal
  - `stdio-mcp-server.ts`: Servidor MCP standalone

## Beneficios de esta Arquitectura

### 🎯 **Separación de Responsabilidades**
Cada capa tiene una responsabilidad específica y bien definida

### 🔄 **Inversión de Dependencias**
Las capas superiores dependen de abstracciones, no de implementaciones concretas

### 🧪 **Testabilidad**
Cada capa puede ser probada independientemente

### 📈 **Escalabilidad**
Fácil agregar nuevas funcionalidades siguiendo la estructura establecida

### 🔧 **Mantenibilidad**
Cambios en una capa no afectan directamente a otras capas

## Flujo de Dependencias

```
Main → Presentation → Application → Infrastructure
  ↓         ↓            ↓             ↓
Shared ← Shared  ← Shared     ← Shared
```

- **Main** orquesta toda la aplicación
- **Presentation** maneja HTTP y routing
- **Application** contiene lógica de aplicación
- **Infrastructure** maneja detalles técnicos
- **Shared** es utilizado por todas las capas
- **Domain** es independiente (preparado para lógica de negocio)

## Scripts Actualizados

```json
{
  "start": "tsx watch src/main/index.ts",
  "start:stdio": "tsx watch src/main/stdio-mcp-server.ts",
  "build": "tsc",
  "start:prod": "node dist/src/main/index.js",
  "start:stdio:prod": "node dist/src/main/stdio-mcp-server.js"
}
```

## Migración Realizada

✅ **Sin cambios funcionales**: Toda la funcionalidad existente se mantiene  
✅ **Sin cambios de nombres**: Todas las funciones y referencias mantienen sus nombres originales  
✅ **Sin cambios de datos**: No se modificaron datos de prueba ni configuraciones  
✅ **Estructura mejorada**: Código organizado por responsabilidades y capas  
✅ **Compatibilidad**: Scripts y configuraciones actualizadas para la nueva estructura  

La migración fue exitosa y el servidor funciona correctamente con la nueva arquitectura por capas.
