/**
 * MCP (Model Context Protocol) Client for Frontend
 * 
 * This client allows a Next.js frontend to communicate with an MCP server
 * Note: This is unconventional - MCP is typically used by AI models, not web frontends
 */

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  name: string;
  uri: string;
  description?: string;
  mimeType?: string;
}

class MCPClient {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(request: MCPRequest): Promise<MCPResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };

    // Add session ID if we have one
    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Extract session ID from response headers for future requests
    const newSessionId = response.headers.get('mcp-session-id');
    if (newSessionId && !this.sessionId) {
      this.sessionId = newSessionId;
    }

    // Handle Server-Sent Events format
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/event-stream')) {
      const text = await response.text();
      // Parse SSE format: "event: message\ndata: {json}\n"
      const dataMatch = text.match(/data: (.*)/);
      if (dataMatch) {
        return JSON.parse(dataMatch[1]);
      }
    }

    return await response.json();
  }

  async initialize(): Promise<{ tools: MCPTool[], resources: MCPResource[] }> {
    const response = await this.makeRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          resources: { subscribe: true },
          tools: {}
        },
        clientInfo: {
          name: 'nextjs-frontend',
          version: '1.0.0'
        }
      }
    });

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    // Get available tools
    const toolsResponse = await this.listTools();
    const resourcesResponse = await this.listResources();

    return {
      tools: toolsResponse.tools || [],
      resources: resourcesResponse.resources || []
    };
  }

  async listTools(): Promise<{ tools: MCPTool[] }> {
    const response = await this.makeRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    });

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result;
  }

  async listResources(): Promise<{ resources: MCPResource[] }> {
    const response = await this.makeRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/list'
    });

    if (response.error) {
      throw new Error(`MCP Error: ${response.error.message}`);
    }

    return response.result;
  }

  async callTool(name: string, arguments_: any): Promise<any> {
    const response = await this.makeRequest({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name,
        arguments: arguments_
      }
    });

    if (response.error) {
      throw new Error(`MCP Tool Error: ${response.error.message}`);
    }

    return response.result;
  }

  async readResource(uri: string): Promise<any> {
    const response = await this.makeRequest({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'resources/read',
      params: {
        uri
      }
    });

    if (response.error) {
      throw new Error(`MCP Resource Error: ${response.error.message}`);
    }

    return response.result;
  }

  // Clean up session
  async disconnect(): Promise<void> {
    if (this.sessionId) {
      try {
        await fetch(this.baseUrl, {
          method: 'DELETE',
          headers: {
            'mcp-session-id': this.sessionId
          }
        });
      } catch (error) {
        console.warn('Error disconnecting MCP session:', error);
      } finally {
        this.sessionId = null;
      }
    }
  }
}

// Singleton instance
export const mcpClient = new MCPClient('http://localhost:3000/mcp');

// Helper function to safely use MCP (handles errors gracefully)
export async function useMCP<T>(operation: () => Promise<T>): Promise<{ data: T | null, error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    console.error('MCP Operation failed:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
