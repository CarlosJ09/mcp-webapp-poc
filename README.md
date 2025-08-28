# MCP Webapp Proof of Concept

## 🎯 Project Purpose

This project serves as a **Proof of Concept (POC)** to explore the feasibility of connecting standard frontend web applications directly to **MCP (Model Context Protocol)** servers. While MCP is traditionally designed for AI model interactions, this experiment investigates whether web frontends can effectively communicate with MCP servers for data fetching and tool execution.

## 🧪 Research Question

**"Can a standard web frontend application communicate directly with an MCP server using HTTP transport, and what are the technical challenges and benefits of this approach?"**

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/SSE     ┌─────────────────┐
│   Next.js       │ ◄──────────────► │   Express.js    │
│   Frontend      │   JSON-RPC 2.0   │   MCP Server    │
│   (Port 3001)   │                  │   (Port 3000)   │
└─────────────────┘                  └─────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ • React Hooks   │                  │ • MCP SDK       │
│ • Recharts      │                  │ • Resources     │
│ • Lucide Icons  │                  │ • Tools         │
│ • TypeScript    │                  │ • HTTP Transport│
└─────────────────┘                  └─────────────────┘
```

## 🛠️ Technologies & Protocols Used

### Frontend Stack
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Recharts** - Data visualization library
- **Lucide React** - Professional icon library
- **Tailwind CSS** - Utility-first CSS framework

### Backend Stack
- **Express.js** - Web application framework
- **MCP SDK** - Model Context Protocol implementation
- **@modelcontextprotocol/sdk** - Official MCP TypeScript SDK
- **ts-node** - TypeScript execution environment

### Protocols & Communication
- **MCP (Model Context Protocol)** - Core communication protocol
- **JSON-RPC 2.0** - Remote procedure call protocol (see detailed explanation below)
- **HTTP/HTTPS** - Transport layer protocol
- **Server-Sent Events (SSE)** - Streaming response handling
- **CORS** - Cross-origin resource sharing

## 🔌 Understanding JSON-RPC in MCP Context

### What is JSON-RPC?
**JSON-RPC 2.0** is a stateless, light-weight remote procedure call (RPC) protocol that uses JSON for data encoding. Unlike REST APIs that use HTTP methods (GET, POST, PUT, DELETE) with resource URLs, JSON-RPC uses a single endpoint with method names embedded in the request payload.

### Why Does MCP Use JSON-RPC?

MCP adopted JSON-RPC because:
- **🎯 Method-Oriented**: Perfect for calling specific functions/tools remotely
- **📦 Single Endpoint**: Simplifies transport layer implementation  
- **🔄 Stateful Sessions**: Supports session-based communication better than REST
- **⚡ Lightweight**: Minimal protocol overhead
- **🤝 Bi-directional**: Easy request/response correlation with IDs

### JSON-RPC vs REST API Comparison

| Aspect | JSON-RPC | REST API |
|--------|----------|----------|
| **Endpoint** | Single URL (`/mcp`) | Multiple URLs (`/users`, `/posts`) |
| **Methods** | `"method": "resources/read"` | `GET /api/resources` |
| **Transport** | Always POST | GET/POST/PUT/DELETE |
| **Structure** | `{"jsonrpc":"2.0","method":"..."}` | HTTP verb + URL path |
| **Caching** | Limited (always POST) | Excellent (GET requests) |
| **Discoverability** | Requires method listing | Self-documenting URLs |

### Example MCP JSON-RPC Request/Response

```typescript
// Request: Initialize MCP connection
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {"resources": {"subscribe": true}}
  }
}

// Response: Server capabilities
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {"resources": {"listChanged": true}}
  }
}
```

This is why our MCP client looks different from typical REST clients - it's designed around method calls rather than resource URLs.

## 📁 Project Structure

```
mcp-webapp-poc/
├── backend/                    # MCP Server Implementation
│   ├── index.ts               # Main server entry point
│   ├── config/
│   │   └── cors.ts           # CORS configuration
│   ├── services/
│   │   └── mcp-server.ts     # MCP server management
│   ├── resources/
│   │   └── dashboard-resources.ts # Data resources
│   ├── tools/
│   │   └── dashboard-tools.ts     # MCP tools
│   └── routes/
│       └── mcp-routes.ts     # HTTP route handlers
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx      # Main dashboard page
│   │   ├── lib/
│   │   │   └── mcp-client.ts # MCP client implementation
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts # Data management hook
│   │   ├── components/
│   │   │   ├── dashboard/    # Chart components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── types/
│   │   │   └── dashboard.ts  # TypeScript definitions
│   │   └── utils/
│   │       └── format.ts # format logic utilities
```

## 🚧 Technical Challenges Faced & Solutions

### 1. **Transport Protocol Mismatch**
- **Challenge**: MCP traditionally uses `stdio` transport for local processes
- **Solution**: Implemented `StreamableHTTPServerTransport` for web compatibility

### 2. **Session Management**
- **Challenge**: HTTP stateless nature vs MCP session requirements
- **Solution**: Custom session ID management with retry logic for expired sessions

### 3. **CORS Policy Issues**
- **Challenge**: Browser security blocking cross-origin requests
- **Solution**: Configured comprehensive CORS middleware with proper headers exposure

### 4. **JSON-RPC vs REST APIs**
- **Challenge**: Frontend developers expect REST APIs, not JSON-RPC
- **Solution**: Created abstraction layer in MCP client to handle JSON-RPC complexity

### 5. **Type Safety Across Protocol Boundary**
- **Challenge**: Dynamic JSON-RPC responses vs TypeScript strict typing
- **Solution**: Comprehensive TypeScript interfaces with proper error handling

## 🧩 Key Implementation Details

### MCP Client Architecture
```typescript
class MCPClient {
  private baseUrl: string;
  private sessionId: string | null = null;
  
  // HTTP-based JSON-RPC communication
  private async makeRequest(request: MCPRequest): Promise<MCPResponse>
  
  // MCP Protocol methods
  async initialize(): Promise<{tools: MCPTool[], resources: MCPResource[]}>
  async callTool(name: string, args: any): Promise<any>
  async readResource(uri: string): Promise<any>
}
```

### Resource & Tool Implementation
- **Resources**: `sales://monthly`, `analytics://users`, `metrics://performance`
- **Tools**: `generate-realtime-data` with parameterized data generation
- **Mock Data**: JSONPlaceholder-style fake APIs for realistic testing

## 📊 Dashboard Features Implemented

- **📈 Interactive Charts**: Sales trends, revenue breakdown, user demographics
- **🔄 Manual Data Refresh**: On-demand data updates via MCP resource calls
- **🎯 KPI Metrics**: Calculated business intelligence indicators  
- **🔄 Session Management**: Automatic reconnection on session expiry
- **📱 Responsive Design**: Mobile-first dashboard layout

## ✅ Feasibility Conclusions

### **FEASIBLE ✅**
The POC successfully demonstrates that frontend applications **CAN** communicate directly with MCP servers with the following findings:

#### **Positive Outcomes**
1. **✅ Technical Viability**: HTTP transport works effectively for MCP communication
2. **✅ Performance**: Sub-second response times for data fetching and tool execution
3. **✅ Developer Experience**: Clean abstraction possible over JSON-RPC complexity
4. **✅ Feature Completeness**: Full MCP protocol support (initialize, resources, tools)
5. **✅ Error Handling**: Robust session management and retry mechanisms
6. **✅ Scalability**: Architecture supports multiple concurrent sessions

#### **Technical Benefits**
- **🎯 Direct Protocol Access**: No need for REST API wrapper layers
- **⚡ Efficient Communication**: Single protocol for resources and tools
- **🔒 Type Safety**: End-to-end TypeScript support possible
- **🧩 Tool Integration**: Direct access to MCP tools from frontend

#### **Critical Security Considerations ⚠️**
- **🚨 Exposed Credentials**: MCP server URLs and session tokens visible in browser
- **🌐 Client-Side Exposure**: All MCP endpoints and capabilities discoverable by users
- **🔓 No Authentication Layer**: Direct client access bypasses traditional auth middleware
- **👁️ Data Visibility**: All MCP resources and tools exposed to client inspection
- **🛡️ CORS Vulnerabilities**: Opening CORS for MCP may expose other services

#### **Additional Challenges & Considerations**
- **🌐 CORS Complexity**: Requires careful server-side CORS configuration
- **🔐 Session Management**: More complex than traditional REST APIs  
- **📚 Learning Curve**: Developers need to understand JSON-RPC and MCP concepts
- **🔧 Tooling**: Limited existing tooling compared to REST ecosystems
- **💾 No HTTP Caching**: JSON-RPC POST requests can't leverage browser caching

## 🎯 Use Cases Where This Approach Excels

**⚠️ IMPORTANT: These use cases assume NON-PRODUCTION or INTERNAL-ONLY environments**

1. **Rapid Prototyping**: Quick POCs without building separate REST APIs
2. **Internal Developer Tools**: Applications for trusted internal users only
3. **Local Development**: Desktop applications with embedded MCP servers
4. **Educational Projects**: Learning MCP protocol implementation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd mcp-webapp-poc
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**  
   ```bash
   cd frontend
   npm install
   ```

4. **Start the MCP server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3000
   ```

5. **Start the frontend**
   ```bash
   cd frontend  
   npm run dev
   # Frontend runs on http://localhost:3001
   ```

### Testing with Claude Desktop

For traditional MCP usage with AI models, configure `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "dashboard-server": {
      "command": "npx",
      "args": ["ts-node", "stdio-mcp-server.ts"],
      "cwd": "/path/to/backend"
    }
  }
}
```

## 🎓 Key Learnings & Recommendations

### **🚨 CRITICAL SECURITY RECOMMENDATION**

**For Production Applications: Use MCP on Backend, Expose REST APIs to Frontend**

The security implications of direct frontend-to-MCP communication make it unsuitable for most production scenarios. The recommended architecture is:

```
Frontend → REST API → Backend MCP Client → MCP Server
```

This provides:
- **🔒 Security**: Credentials and internal logic hidden from clients
- **🛡️ Authentication**: Traditional auth middleware on REST endpoints  
- **📊 Logging**: Server-side request logging and monitoring
- **💾 Caching**: HTTP caching for better performance
- **🔧 Control**: Fine-grained access control over MCP resources

### **When Direct Frontend-to-MCP is Acceptable**
- ✅ **Internal-only applications** with trusted users
- ✅ **Rapid prototyping** and proof-of-concepts  
- ✅ **Local development tools** (not web-deployed)
- ✅ **Educational projects** for learning MCP

### **When to Definitely Use Traditional Backend Architecture**
- ❌ **Public-facing applications**
- ❌ **Applications handling sensitive data**
- ❌ **Multi-tenant systems**
- ❌ **Applications requiring user authentication**
- ❌ **Production systems requiring audit trails**
- ❌ **Applications needing rate limiting per user**

## 🏆 Final Verdict

### **Technical Feasibility: ✅ PROVEN**
**The POC conclusively proves that direct frontend-to-MCP communication is technically feasible** and works well for the intended use case.

### **Production Readiness: ⚠️ LIMITED**
**However, serious security considerations make this approach unsuitable for most production applications.** The direct exposure of MCP endpoints, credentials, and internal logic to client-side code creates significant security risks.

### **Recommended Production Architecture**
For production systems, we recommend:
```
Frontend ← REST API ← Backend (MCP Client) ← MCP Server
```

This maintains the benefits of MCP on the backend while providing proper security boundaries.

### **Value of This POC**
This experiment provides valuable insights into:
- **🔬 MCP Protocol Understanding**: How MCP works over HTTP transport
- **⚙️ Implementation Patterns**: Techniques for JSON-RPC client development  
- **🚧 Integration Challenges**: Real-world hurdles and solutions
- **🏗️ Architecture Options**: When direct vs proxied MCP access makes sense

### **Bottom Line**
While **technically successful**, this approach should be reserved for **internal tools, prototypes, and educational purposes**. For production web applications serving external users, a traditional backend-proxied architecture remains the security-conscious choice.

The real value of this POC is demonstrating **how MCP can be integrated into web applications** - whether directly or through backend proxies - opening new possibilities for AI-powered web interfaces.