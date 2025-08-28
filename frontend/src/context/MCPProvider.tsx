"use client";

import { createContext, useEffect, useState, useCallback, useRef } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { MCP_CLIENT_OPTIONS } from "@/config/mcp-client";
import {
  ListResourcesResult,
  ListToolsResult,
  CallToolRequest,
  ReadResourceRequest,
} from "@modelcontextprotocol/sdk/types.js";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface MCPContextType {
  client?: Client;
  tools: ListToolsResult;
  resources: ListResourcesResult;
  connectionState: ConnectionState;
  error?: string;
  callTool: (request: CallToolRequest) => Promise<any>;
  readResource: (request: ReadResourceRequest) => Promise<any>;
  reconnect: () => Promise<void>;
}

export const MCPContext = createContext<MCPContextType>({
  client: undefined,
  tools: { tools: [] },
  resources: { resources: [] },
  connectionState: "disconnected",
  callTool: async () => {
    throw new Error("MCP client not initialized");
  },
  readResource: async () => {
    throw new Error("MCP client not initialized");
  },
  reconnect: async () => {
    throw new Error("MCP client not initialized");
  },
});

export function MCPProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client>();
  const [tools, setTools] = useState<ListToolsResult>({ tools: [] });
  const [resources, setResources] = useState<ListResourcesResult>({
    resources: [],
  });
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [error, setError] = useState<string>();

  // Use refs to prevent effect dependencies issues
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const connectClient = useCallback(async () => {
    if (connectionState === "connecting") return;

    setConnectionState("connecting");
    setError(undefined);

    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_MCP_SERVER_HOST ?? "http://localhost:3000/mcp";
      const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
      const newClient = new Client(MCP_CLIENT_OPTIONS);

      await newClient.connect(transport);

      if (isUnmountedRef.current) return;

      setClient(newClient);
      setConnectionState("connected");
      console.log("Client connected to MCP server");

      // Fetch initial data
      try {
        const [toolsResult, resourcesResult] = await Promise.all([
          newClient.listTools(),
          newClient.listResources(),
        ]);

        if (!isUnmountedRef.current) {
          setTools(toolsResult);
          setResources(resourcesResult);
          console.log("Tools and resources fetched successfully");
        }
      } catch (fetchError) {
        console.error("Error fetching tools/resources:", fetchError);
        // Don't disconnect on fetch error, just log it
      }
    } catch (connectionError) {
      console.error("MCP connection error:", connectionError);
      if (!isUnmountedRef.current) {
        setConnectionState("error");
        setError(
          connectionError instanceof Error
            ? connectionError.message
            : "Connection failed"
        );

        // Auto-retry connection after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current) {
            connectClient();
          }
        }, 5000);
      }
    }
  }, []);

  const reconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Close existing client if any
    if (client) {
      try {
        await client.close();
      } catch (e) {
        console.warn("Error closing existing client:", e);
      }
    }

    setClient(undefined);
    setConnectionState("disconnected");
    await connectClient();
  }, [client, connectClient]);

  const callTool = useCallback(
    async (request: CallToolRequest) => {
      if (!client || connectionState !== "connected") {
        throw new Error("MCP client not connected");
      }
      return await client.callTool(request.params);
    },
    [client, connectionState]
  );

  const readResource = useCallback(
    async (request: ReadResourceRequest) => {
      if (!client || connectionState !== "connected") {
        throw new Error("MCP client not connected");
      }
      return await client.readResource(request.params);
    },
    [client, connectionState]
  );

  useEffect(() => {
    isUnmountedRef.current = false;
    connectClient();

    return () => {
      isUnmountedRef.current = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (client) {
        client.close().catch(console.error);
      }
    };
  }, [connectClient, client]);

  const contextValue: MCPContextType = {
    client,
    tools,
    resources,
    connectionState,
    error,
    callTool,
    readResource,
    reconnect,
  };

  return (
    <MCPContext.Provider value={contextValue}>{children}</MCPContext.Provider>
  );
}
