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

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  const clientRef = useRef<Client | undefined>(undefined);

  const connectClient = useCallback(async () => {
    console.log("connectClient called, current state:", connectionState);

    if (connectionState === "connecting") {
      console.log("Already connecting, skipping");
      return;
    }

    setConnectionState("connecting");
    setError(undefined);

    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_MCP_SERVER_HOST ?? "http://localhost:3000/mcp";
      const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
      const newClient = new Client(MCP_CLIENT_OPTIONS);

      console.log("Attempting to connect to:", serverUrl);
      await newClient.connect(transport);

      if (isUnmountedRef.current) {
        console.log("Component unmounted, aborting connection");
        await newClient.close();
        return;
      }

      clientRef.current = newClient;
      setClient(newClient);
      setConnectionState("connected");
      console.log("Client connected to MCP server");

      try {
        console.log("Fetching tools and resources...");
        const [toolsResult, resourcesResult] = await Promise.all([
          newClient.listTools(),
          newClient.listResources(),
        ]);

        if (!isUnmountedRef.current) {
          setTools(toolsResult);
          setResources(resourcesResult);
          console.log("Tools and resources fetched successfully", {
            tools: toolsResult.tools.length,
            resources: resourcesResult.resources.length,
          });
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
        console.log("Scheduling reconnection in 5 seconds...");
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isUnmountedRef.current && connectionState !== "connected") {
            console.log("Auto-retrying connection...");
            connectClient();
          }
        }, 5000);
      }
    }
  }, [connectionState]); // Only depend on connectionState

  const reconnect = useCallback(async () => {
    console.log("Manual reconnect triggered");

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing client if any
    const currentClient = clientRef.current;
    if (currentClient) {
      try {
        await currentClient.close();
        console.log("Existing client closed");
      } catch (e) {
        console.warn("Error closing existing client:", e);
      }
    }

    clientRef.current = undefined;
    setClient(undefined);
    setConnectionState("disconnected");

    // Small delay to ensure state is updated
    setTimeout(() => {
      connectClient();
    }, 100);
  }, [connectClient]);

  // Fix: Pass parameters directly to client methods, not wrapped in params
  const callTool = useCallback(
    async (request: CallToolRequest) => {
      const currentClient = clientRef.current;
      if (!currentClient || connectionState !== "connected") {
        throw new Error("MCP client not connected");
      }

      console.log("Calling tool:", request);
      return await currentClient.callTool(request.params);
    },
    [connectionState]
  );

  const readResource = useCallback(
    async (request: ReadResourceRequest) => {
      const currentClient = clientRef.current;
      if (!currentClient || connectionState !== "connected") {
        throw new Error("MCP client not connected");
      }

      console.log("Reading resource:", request);
      return await currentClient.readResource(request.params);
    },
    [connectionState]
  );

  // Initialize connection only once
  useEffect(() => {
    console.log("MCPProvider useEffect triggered");
    isUnmountedRef.current = false;

    // Only connect if we're not already connected or connecting
    if (connectionState === "disconnected") {
      connectClient();
    }

    return () => {
      console.log("MCPProvider cleanup");
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const currentClient = clientRef.current;
      if (currentClient) {
        currentClient.close().catch(console.error);
        clientRef.current = undefined;
      }
    };
  }, []); // Empty dependency array - only run once on mount

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
