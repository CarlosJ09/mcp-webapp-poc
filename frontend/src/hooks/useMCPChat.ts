"use client";

import { useState, useCallback } from 'react';

interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export function useMCPChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Llamada al endpoint de chat del backend
      const response = await fetch('/api/mcp/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MCPResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error processing message');
      }

      return data.data || 'Response received from MCP agent';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
}

// Funciones helper para formatear respuestas
function formatCustomersResponse(customers: any[]): string {
  if (!customers || customers.length === 0) {
    return 'No customers found in the database.';
  }
  
  const customerList = customers.slice(0, 5).map(customer => 
    `• ${customer.name || 'No name'} (${customer.email || 'No email'})`
  ).join('\n');
  
  return `Here are the first ${Math.min(customers.length, 5)} customers:\n\n${customerList}\n\n${customers.length > 5 ? `... and ${customers.length - 5} more.` : ''}`;
}

function formatItemsResponse(items: any[]): string {
  if (!items || items.length === 0) {
    return 'No products found in inventory.';
  }
  
  const itemList = items.slice(0, 5).map(item => 
    `• ${item.name || 'No name'} - Stock: ${item.stock || 0} - Price: $${item.price || 0}`
  ).join('\n');
  
  return `Here are the first ${Math.min(items.length, 5)} products:\n\n${itemList}\n\n${items.length > 5 ? `... and ${items.length - 5} more.` : ''}`;
}

function formatSalesResponse(salesData: any): string {
  if (!salesData || salesData.length === 0) {
    return 'No sales data found for the requested period.';
  }
  
  const totalSales = salesData.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0);
  const avgSales = totalSales / salesData.length;
  
  return `Sales analysis for the last 6 months:\n\n• Total records: ${salesData.length}\n• Total sales: $${totalSales.toLocaleString()}\n• Average per record: $${avgSales.toFixed(2)}\n\nData includes all completed sales for the specified period.`;
}

function formatInventoryResponse(inventory: any[]): string {
  if (!inventory || inventory.length === 0) {
    return 'No inventory data found.';
  }
  
  const topItems = inventory.slice(0, 3).map(item => 
    `• ${item.name || 'No name'} - Turnover: ${(item.turnover_ratio || 0).toFixed(2)}`
  ).join('\n');
  
  return `Inventory turnover analysis:\n\n${topItems}\n\nThese are the products with the highest turnover. Higher turnover indicates higher demand.`;
}
