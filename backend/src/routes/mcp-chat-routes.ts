import express from "express";
import { createMCPServer } from "../services/mcp-server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLogger } from "../config/logger";
import { externalApiService } from "../services/external/api-service";
import { aiService } from "../services/ai-service";

const router = express.Router();
const logger = createLogger('MCP-Chat-Routes');

// Endpoint for conversational chat
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    logger.info("Processing chat message", { message: message.substring(0, 100) + '...' });

    // For now, return a simulated response until we implement full integration
    const response = await processChatMessage(message);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error("Error processing chat message", error instanceof Error ? error : new Error('Unknown error'));
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

// Endpoint to execute specific MCP tools
router.post("/tools", async (req, res) => {
  try {
    const { tool, parameters = {} } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: "Tool name is required"
      });
    }

    logger.info("Executing MCP tool directly", { tool, parameters });

    // Execute the MCP tool directly
    const result = await executeMCPTool(tool, parameters);
    logger.info("Tool execution completed", { tool, hasResult: !!result });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error("Error executing MCP tool directly", error instanceof Error ? error : new Error('Unknown error'));
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Error executing MCP tool"
    });
  }
});

// Function to process chat messages with AI integration
async function processChatMessage(message: string): Promise<string> {
  logger.info("Processing chat message with AI", { 
    message: message.substring(0, 50) + '...',
    aiEnabled: aiService.isAIEnabled()
  });
  
  // Basic message analysis to determine the response
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hola') || lowerMessage.includes('hello')) {
    return "Hello! I'm your virtual assistant. I can help you with queries about customers, products, sales and inventory. How can I assist you today?";
  }
  
  if (lowerMessage.includes('cliente') || lowerMessage.includes('customer')) {
    try {
      logger.info("Processing customer query with AI");
      const customers = await executeMCPTool('query-customers', { limit: 10000 });
      logger.info("Customer data received", { count: customers ? customers.length : 0 });
      
      // Use AI to generate intelligent response
      const response = await aiService.generateIntelligentResponse(message, customers, 'customers');
      logger.info("AI response generated for customers", { responseLength: response.length });
      return response;
    } catch (error) {
      logger.error("Error getting customer data", error instanceof Error ? error : new Error('Unknown error'));
      return "I couldn't get customer information at this time. Please try again.";
    }
  }
  
  if (lowerMessage.includes('producto') || lowerMessage.includes('item') || lowerMessage.includes('inventory')) {
    try {
      logger.info("Processing inventory query with AI");
      const items = await executeMCPTool('query-items', { limit: 10000 });
      logger.info("Items data received", { count: items ? items.length : 0 });
      
      // Use AI to generate intelligent response
      const response = await aiService.generateIntelligentResponse(message, items, 'items');
      logger.info("AI response generated for items", { responseLength: response.length });
      return response;
    } catch (error) {
      logger.error("Error getting product data", error instanceof Error ? error : new Error('Unknown error'));
      return "I couldn't get product information at this time. Please try again.";
    }
  }
  
  // Improved sales detection with more keywords
  if (lowerMessage.includes('venta') || lowerMessage.includes('sale') || 
      lowerMessage.includes('ventas') || lowerMessage.includes('sales') ||
      lowerMessage.includes('ingresos') || lowerMessage.includes('revenue') ||
      lowerMessage.includes('facturación') || lowerMessage.includes('billing') ||
      lowerMessage.includes('hoy') || lowerMessage.includes('today') ||
      lowerMessage.includes('mes') || lowerMessage.includes('month') ||
      lowerMessage.includes('día') || lowerMessage.includes('day')) {
    try {
      logger.info("Processing sales query with AI", { query: message });
      const sales = await executeMCPTool('sales-monthly-analysis', { months: 12 });
      logger.info("Sales data received", { hasData: !!sales });
      
      // Use AI to generate intelligent response
      const response = await aiService.generateIntelligentResponse(message, sales, 'sales');
      logger.info("AI response generated for sales", { responseLength: response.length });
      return response;
    } catch (error) {
      logger.error("Error getting sales data", error instanceof Error ? error : new Error('Unknown error'));
      return "I couldn't get sales information at this time. Please try again.";
    }
  }
  
  // Default response with AI assistance - try to determine what the user wants
  try {
    logger.info("Processing general query with AI", { query: message });
    
    // Try to get sales data for general queries that might be about sales
    const salesKeywords = ['cuanto', 'total', 'dinero', 'ganancia', 'profit', 'money', 'earned', 'made'];
    const mightBeSales = salesKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (mightBeSales) {
      const sales = await executeMCPTool('sales-monthly-analysis', { months: 12 });
      return await aiService.generateIntelligentResponse(message, sales, 'sales');
    }
    
    // For other queries, provide a helpful response
    const helpData = { 
      query: message, 
      available_services: [
        'Customer information (clientes, customers)',
        'Product inventory (productos, items, inventory)', 
        'Sales data (ventas, sales, revenue)',
        'Business analytics (análisis, analytics)'
      ]
    };
    
    return await aiService.generateIntelligentResponse(message, helpData, 'customers');
  } catch (error) {
    logger.error("Error in default AI response", error instanceof Error ? error : new Error('Unknown error'));
    // Fallback if AI fails
    return `I received your query: "${message}". I can help you with information about customers, products, sales and inventory. Could you be more specific about what type of information you need?`;
  }
}

// Function to execute MCP tools
async function executeMCPTool(toolName: string, parameters: any): Promise<any> {
  logger.info("executeMCPTool called", { toolName, parameters });
  
  try {
    let response;
    
    switch (toolName) {
      case 'query-customers':
        response = await externalApiService.getCustomersData();
        if (response.success) {
          // If there's a limit parameter, apply it
          const customers = Array.isArray(response.data) ? response.data : [];
          const limit = parameters.limit || customers.length;
          return customers.slice(0, limit);
        }
        throw new Error(response.error || 'Failed to fetch customers');
        
      case 'query-items':
        response = await externalApiService.getItemsData();
        if (response.success) {
          const items = Array.isArray(response.data) ? response.data : [];
          const limit = parameters.limit || items.length;
          return items.slice(0, limit);
        }
        throw new Error(response.error || 'Failed to fetch items');
        
      case 'sales-monthly-analysis':
        response = await externalApiService.getSalesSummary('monthly');
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to fetch sales data');
        
      case 'inventory-turnover':
        response = await externalApiService.getInventoryStatus();
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error || 'Failed to fetch inventory data');
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    logger.error("Error in executeMCPTool", error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
}

// Formatting functions
function formatCustomersResponse(customers: any[]): string {
  if (!customers || customers.length === 0) {
    return 'No customers found in the database.';
  }
  
  const customerList = customers.map(customer => {
    // Handle different data structures from the real API
    const name = customer.name || customer.customerName || customer.fullName || 'Unknown';
    const email = customer.email || customer.customerEmail || 'No email';
    const phone = customer.phone || customer.phoneNumber || customer.contactNumber || '';
    
    return `• ${name} (${email}${phone ? ` - ${phone}` : ''})`;
  }).join('\n');
  
  return `Here are the customers found:\n\n${customerList}`;
}

function formatItemsResponse(items: any[]): string {
  if (!items || items.length === 0) {
    return 'No products found in inventory.';
  }
  
  const itemList = items.map(item => {
    // Handle different data structures from the real API
    const name = item.name || item.itemName || item.productName || 'Unknown Product';
    const stock = item.stock || item.inventory || item.quantity || 0;
    const price = item.price || item.unitPrice || item.cost || 0;
    
    return `• ${name} - Stock: ${stock} - Price: $${typeof price === 'number' ? price.toFixed(2) : price}`;
  }).join('\n');
  
  return `Here are the products found:\n\n${itemList}`;
}

function formatSalesResponse(salesData: any): string {
  if (!salesData) {
    return 'No sales data found for the requested period.';
  }
  
  // Handle different response structures from the API
  if (Array.isArray(salesData)) {
    const totalSales = salesData.reduce((sum: number, sale: any) => {
      const saleAmount = sale.total || sale.amount || sale.revenue || 0;
      return sum + (typeof saleAmount === 'number' ? saleAmount : 0);
    }, 0);
    
    const totalOrders = salesData.reduce((sum: number, sale: any) => {
      const orderCount = sale.orders || sale.transactions || sale.count || 0;
      return sum + (typeof orderCount === 'number' ? orderCount : 0);
    }, 0);
    
    return `Sales Analysis:\n\n• Total Sales: $${totalSales.toLocaleString()}\n• Total Orders: ${totalOrders}\n• Average per Order: $${totalOrders > 0 ? (totalSales/totalOrders).toFixed(2) : '0.00'}`;
  } else {
    // If it's a single object
    const total = salesData.totalSales || salesData.total || salesData.revenue || 0;
    const orders = salesData.totalOrders || salesData.orders || salesData.transactions || 0;
    
    return `Sales Summary:\n\n• Total Sales: $${typeof total === 'number' ? total.toLocaleString() : total}\n• Total Orders: ${orders}\n• Average per Order: $${orders > 0 && typeof total === 'number' ? (total/orders).toFixed(2) : '0.00'}`;
  }
}

export default router;
