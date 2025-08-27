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
- **JSON-RPC 2.0** - Remote procedure call protocol
- **HTTP/HTTPS** - Transport layer protocol
- **Server-Sent Events (SSE)** - Real-time communication
- **CORS** - Cross-origin resource sharing

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
│   │       └── calculations.ts # Business logic utilities
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
- **⚡ Real-time Updates**: Refresh data via MCP tool calls
- **🎯 KPI Metrics**: Calculated business intelligence indicators  
- **🔄 Session Management**: Automatic reconnection on session expiry
- **📱 Responsive Design**: Mobile-first dashboard layout

## ✅ Feasibility Conclusions

### **FEASIBLE ✅**
The POC successfully demonstrates that frontend applications **CAN** communicate directly with MCP servers with the following findings:

#### **Positive Outcomes**
1. **✅ Technical Viability**: HTTP transport works effectively for MCP communication
2. **✅ Real-world Performance**: Sub-second response times for data fetching
3. **✅ Developer Experience**: Clean abstraction possible over JSON-RPC complexity
4. **✅ Feature Completeness**: Full MCP protocol support (initialize, resources, tools)
5. **✅ Error Handling**: Robust session management and retry mechanisms
6. **✅ Scalability**: Architecture supports multiple concurrent sessions

#### **Technical Benefits**
- **🎯 Direct Protocol Access**: No need for REST API wrapper layers
- **⚡ Efficient Communication**: Single protocol for resources and tools
- **🔒 Type Safety**: End-to-end TypeScript support possible
- **🔄 Real-time Capabilities**: SSE support for live updates
- **🧩 Tool Integration**: Direct access to MCP tools from frontend

#### **Challenges & Considerations**
- **🌐 CORS Complexity**: Requires careful server-side CORS configuration
- **🔐 Session Management**: More complex than traditional REST APIs
- **📚 Learning Curve**: Developers need to understand JSON-RPC and MCP concepts
- **🔧 Tooling**: Limited existing tooling compared to REST ecosystems

## 🎯 Use Cases Where This Approach Excels

1. **Dashboard Applications**: Real-time analytics with dynamic tool execution
2. **AI-Powered UIs**: Frontends that need direct access to AI model tools
3. **Developer Tools**: Applications requiring protocol-level MCP integration
4. **Rapid Prototyping**: Quick POCs without building separate REST APIs

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

### **Recommendations for Production Use**
1. **Authentication**: Implement proper auth mechanisms for session security
2. **Rate Limiting**: Add request throttling for production workloads  
3. **Error Monitoring**: Comprehensive logging and error tracking
4. **Caching Strategy**: Implement intelligent resource caching
5. **WebSocket Upgrade**: Consider WebSocket for even better real-time performance

### **When to Consider This Approach**
- ✅ Applications requiring dynamic tool execution
- ✅ Real-time dashboards with complex data operations
- ✅ AI-powered interfaces needing direct model access
- ✅ Rapid prototyping without backend API development

### **When to Prefer Traditional REST APIs**
- ❌ Simple CRUD applications
- ❌ Teams unfamiliar with JSON-RPC protocols
- ❌ Applications requiring extensive HTTP middleware
- ❌ Complex authentication/authorization requirements

## 🏆 Final Verdict

**The POC conclusively proves that direct frontend-to-MCP communication is not only feasible but offers unique advantages for specific use cases.** While it introduces some complexity compared to traditional REST APIs, the benefits of direct protocol access, tool integration, and real-time capabilities make it a viable architectural choice for modern web applications, particularly those involving AI/ML workflows or dynamic data operations.

This approach opens new possibilities for frontend applications to leverage the growing MCP ecosystem directly, potentially becoming a valuable pattern for next-generation web applications.