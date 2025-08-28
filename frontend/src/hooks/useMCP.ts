import { useContext, useState, useCallback } from "react";
import { MCPContext } from "@/context/MCPProvider";
import {
  CallToolRequest,
  ReadResourceRequest,
} from "@modelcontextprotocol/sdk/types.js";

export function useMCP() {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error("useMCP must be used within an MCPProvider");
  }
  return context;
}

export function useMCPTool() {
  const { callTool, connectionState } = useMCP();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const executeTool = useCallback(
    async (request: CallToolRequest) => {
      if (connectionState !== "connected") {
        throw new Error("MCP client not connected");
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const result = await callTool(request);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [callTool, connectionState]
  );

  return {
    executeTool,
    isLoading,
    error,
    isConnected: connectionState === "connected",
  };
}

export function useMCPResource() {
  const { readResource, connectionState } = useMCP();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const readResourceData = useCallback(
    async (request: ReadResourceRequest) => {
      if (connectionState !== "connected") {
        throw new Error("MCP client not connected");
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const result = await readResource(request);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [readResource, connectionState]
  );

  return {
    readResourceData,
    isLoading,
    error,
    isConnected: connectionState === "connected",
  };
}

export function useMCPConnection() {
  const { connectionState, error, reconnect } = useMCP();

  return {
    connectionState,
    error,
    reconnect,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
    hasError: connectionState === "error",
  };
}
