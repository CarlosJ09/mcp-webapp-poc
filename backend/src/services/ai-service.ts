/**
 * @fileoverview AI service for intelligent chat responses
 * Provides LLM integration for natural language processing and response generation
 */

import OpenAI from 'openai';
import { createLogger } from '../config/logger';
import { config } from '../config/app';
import { encoding_for_model } from 'tiktoken';

const logger = createLogger('AI-Service');

/**
 * AI service class for generating intelligent responses
 */
export class AIService {
  private openai: OpenAI | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.isEnabled = true;
      logger.info('AI Service initialized with OpenAI');
    } else {
      logger.warn('AI Service disabled: OPENAI_API_KEY not found');
    }
  }

  /**
   * Check if AI service is available
   */
  isAIEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Count tokens in text using tiktoken
   */
  private countTokens(text: string): number {
    try {
      const encoder = encoding_for_model("gpt-3.5-turbo");
      const tokens = encoder.encode(text);
      encoder.free();
      return tokens.length;
    } catch (error) {
      logger.warn('Token counting failed, estimating', error instanceof Error ? error.message : 'Unknown error');
      // Rough estimation: ~4 characters per token
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * Count total tokens for a request (system + user messages)
   */
  private countRequestTokens(systemMessage: string, userMessage: string, maxTokens: number): {
    input: number;
    output: number;
    total: number;
  } {
    const inputTokens = this.countTokens(systemMessage) + this.countTokens(userMessage);
    return {
      input: inputTokens,
      output: maxTokens,
      total: inputTokens + maxTokens
    };
  }

  /**
   * Generate intelligent response based on user query and data
   */
  async generateIntelligentResponse(
    userQuery: string,
    rawData: any,
    dataType: 'customers' | 'items' | 'sales' | 'inventory'
  ): Promise<string> {
    if (!this.isEnabled || !this.openai) {
      // Fallback to simple response if AI is not available
      return this.generateFallbackResponse(userQuery, rawData, dataType);
    }

    try {
      // Detect language of the user query
      const isSpanish = /[áéíóúñü]|cliente|venta|producto|inventario|cuántos|total|ventas|productos|clientes/i.test(userQuery);
      const language = isSpanish ? 'Spanish' : 'English';
      
      // Build optimized prompt with summarized data
      const prompt = this.buildOptimizedPrompt(userQuery, rawData, dataType, language);
      
      // Enhanced system message based on data type and language
      const systemMessage = this.buildSystemMessage(dataType, language);
      const maxTokens = 150;
      
      // Count tokens before sending
      const tokenCount = this.countRequestTokens(systemMessage, prompt, maxTokens);
      
      logger.info('📊 TOKEN USAGE ANALYSIS', {
        inputTokens: tokenCount.input,
        maxOutputTokens: tokenCount.output,
        totalTokensMax: tokenCount.total,
        estimatedCost: `$${(tokenCount.total * 0.002 / 1000).toFixed(6)}`,
        queryLength: userQuery.length,
        promptLength: prompt.length,
        language,
        dataType
      });

      // Check if token count is reasonable
      if (tokenCount.input > 1000) {
        logger.warn('⚠️  HIGH TOKEN COUNT', {
          inputTokens: tokenCount.input,
          recommendation: 'Consider reducing data size further'
        });
      }
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content?.trim();
      
      if (response) {
        const actualOutputTokens = this.countTokens(response);
        const actualTotal = tokenCount.input + actualOutputTokens;
        
        logger.info('✅ AI RESPONSE SUCCESS', { 
          actualOutputTokens,
          actualTotalTokens: actualTotal,
          actualCost: `$${(actualTotal * 0.002 / 1000).toFixed(6)}`,
          responseLength: response.length,
          language
        });
        return response;
      } else {
        throw new Error('Empty response from AI');
      }

    } catch (error) {
      logger.error('Error generating AI response', error instanceof Error ? error : new Error('Unknown error'));
      // Fallback to simple response on error
      return this.generateFallbackResponse(userQuery, rawData, dataType);
    }
  }

  /**
   * Build system message based on data type and language
   */
  private buildSystemMessage(dataType: string, language: string): string {
    const today = new Date().toISOString().split('T')[0];
    
    if (language === 'Spanish') {
      switch (dataType) {
        case 'customers':
          return `Eres un asistente de análisis de clientes. Fecha: ${today}. Proporciona información clara sobre clientes, incluyendo números específicos, estadísticas y insights útiles. Responde en español de forma profesional.`;
        case 'items':
          return `Eres un asistente de gestión de inventario. Fecha: ${today}. Proporciona información detallada sobre productos, incluyendo niveles de stock, precios y análisis de inventario. Responde en español de forma profesional.`;
        case 'sales':
          return `Eres un asistente de análisis de ventas. Fecha: ${today}. Proporciona información detallada sobre ingresos, órdenes, tendencias y análisis financiero. Incluye números específicos y porcentajes. Responde en español de forma profesional.`;
        case 'inventory':
          return `Eres un asistente de control de inventario. Fecha: ${today}. Proporciona análisis sobre estado de stock, productos agotados, y recomendaciones de inventario. Responde en español de forma profesional.`;
        default:
          return `Eres un asistente de análisis de negocio. Fecha: ${today}. Proporciona información clara y específica basada en los datos disponibles. Responde en español de forma profesional y concisa.`;
      }
    } else {
      switch (dataType) {
        case 'customers':
          return `You are a customer analytics assistant. Date: ${today}. Provide clear customer information including specific numbers, statistics, and useful insights. Respond professionally in English.`;
        case 'items':
          return `You are an inventory management assistant. Date: ${today}. Provide detailed product information including stock levels, pricing, and inventory analysis. Respond professionally in English.`;
        case 'sales':
          return `You are a sales analytics assistant. Date: ${today}. Provide detailed revenue information, order analysis, trends, and financial insights. Include specific numbers and percentages. Respond professionally in English.`;
        case 'inventory':
          return `You are an inventory control assistant. Date: ${today}. Provide stock status analysis, out-of-stock items, and inventory recommendations. Respond professionally in English.`;
        default:
          return `You are a business analytics assistant. Date: ${today}. Provide clear and specific information based on available data. Respond professionally and concisely in English.`;
      }
    }
  }

  /**
   * Build optimized prompt with summarized data (token-efficient)
   */
  private buildOptimizedPrompt(userQuery: string, rawData: any, dataType: string, language: string): string {
    let summary = '';
    let context = '';

    switch (dataType) {
      case 'customers':
        if (Array.isArray(rawData) && rawData.length > 0) {
          const topCustomers = rawData.slice(0, 5).map(c => ({
            name: c.name || c.customerName || 'Unknown',
            email: c.email || c.customerEmail || 'N/A',
            phone: c.phone || c.phoneNumber || 'N/A'
          }));
          
          summary = `${rawData.length} customers total`;
          context = `Recent customers: ${topCustomers.map(c => `${c.name} (${c.email})`).join(', ')}`;
        } else {
          summary = 'No customers found';
          context = 'Database appears empty or unavailable';
        }
        break;

      case 'items':
        if (Array.isArray(rawData) && rawData.length > 0) {
          const totalStock = rawData.reduce((sum, item) => sum + (item.stock || item.inventory || item.quantity || 0), 0);
          const avgPrice = rawData.reduce((sum, item) => sum + (item.price || item.unitPrice || item.cost || 0), 0) / rawData.length;
          const lowStock = rawData.filter(item => (item.stock || item.inventory || item.quantity || 0) < 10).length;
          const topProducts = rawData.slice(0, 5).map(p => ({
            name: p.name || p.itemName || p.productName || 'Unknown',
            stock: p.stock || p.inventory || p.quantity || 0,
            price: p.price || p.unitPrice || p.cost || 0
          }));
          
          summary = `${rawData.length} products, ${totalStock} total units, $${avgPrice.toFixed(2)} avg price, ${lowStock} low stock items`;
          context = `Top products: ${topProducts.map(p => `${p.name} (${p.stock} units @ $${p.price})`).join(', ')}`;
        } else {
          summary = 'No products in inventory';
          context = 'Inventory appears empty or unavailable';
        }
        break;

      case 'sales':
        if (Array.isArray(rawData) && rawData.length > 0) {
          const totalRevenue = rawData.reduce((sum, sale) => sum + (sale.total || sale.amount || sale.revenue || 0), 0);
          const totalOrders = rawData.reduce((sum, sale) => sum + (sale.orders || sale.transactions || sale.count || 1), 0);
          const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
          const recentPeriods = rawData.slice(-3).map(s => ({
            period: s.month || s.period || s.date || 'Unknown',
            revenue: s.total || s.amount || s.revenue || 0,
            orders: s.orders || s.transactions || s.count || 0
          }));
          
          summary = `$${totalRevenue.toLocaleString()} total revenue, ${totalOrders} orders, $${avgOrderValue.toFixed(2)} avg order value`;
          context = `Recent periods: ${recentPeriods.map(p => `${p.period}: $${p.revenue.toLocaleString()} (${p.orders} orders)`).join(', ')}`;
        } else if (rawData && typeof rawData === 'object') {
          const total = rawData.total || rawData.revenue || rawData.totalSales || 0;
          const orders = rawData.orders || rawData.transactions || rawData.totalOrders || 0;
          const avgValue = orders > 0 ? total / orders : 0;
          
          summary = `$${total.toLocaleString()} revenue, ${orders} orders, $${avgValue.toFixed(2)} avg order`;
          context = `Current period performance`;
        } else {
          summary = 'No sales data available';
          context = 'Sales information unavailable or empty';
        }
        break;

      case 'inventory':
        if (Array.isArray(rawData) && rawData.length > 0) {
          const inStock = rawData.filter(item => (item.stock || item.inventory || 0) > 0).length;
          const outOfStock = rawData.filter(item => (item.stock || item.inventory || 0) === 0).length;
          const lowStock = rawData.filter(item => {
            const stock = item.stock || item.inventory || 0;
            return stock > 0 && stock < 10;
          }).length;
          
          summary = `${inStock} in stock, ${outOfStock} out of stock, ${lowStock} low stock`;
          context = `Inventory status breakdown for ${rawData.length} total products`;
        } else {
          summary = 'No inventory data';
          context = 'Inventory information unavailable';
        }
        break;

      default:
        summary = 'Data available';
        context = 'General business information';
    }

    // Create structured prompt based on language
    if (language === 'Spanish') {
      return `CONSULTA: "${userQuery}"

DATOS DEL NEGOCIO:
• ${summary}
• ${context}

INSTRUCCIONES:
- Responde en español de forma profesional y clara
- Incluye números específicos y detalles relevantes
- Si es sobre ventas, menciona totales y promedios
- Si es sobre productos, incluye stock y precios
- Si es sobre clientes, proporciona estadísticas útiles
- Sé conciso pero informativo (máximo 3-4 oraciones)

RESPUESTA:`;
    } else {
      return `QUERY: "${userQuery}"

BUSINESS DATA:
• ${summary}  
• ${context}

INSTRUCTIONS:
- Respond in English professionally and clearly
- Include specific numbers and relevant details
- For sales: mention totals and averages
- For products: include stock levels and pricing
- For customers: provide useful statistics
- Be concise but informative (max 3-4 sentences)

RESPONSE:`;
    }
  }

  /**
   * Generate detailed fallback response when AI is not available
   */
  private generateFallbackResponse(userQuery: string, rawData: any, dataType: string): string {
    // Detect language for fallback responses
    const isSpanish = /[áéíóúñü]|cliente|venta|producto|inventario|cuántos|total|ventas|productos|clientes/i.test(userQuery);
    
    switch (dataType) {
      case 'customers':
        const customerCount = Array.isArray(rawData) ? rawData.length : 0;
        
        if (customerCount === 0) {
          return isSpanish 
            ? "📋 No se encontraron clientes en la base de datos actualmente."
            : "📋 No customers found in the database currently.";
        }
        
        // Get sample customer data for more detail
        if (Array.isArray(rawData) && rawData.length > 0) {
          const sampleCustomers = rawData.slice(0, 3).map(c => 
            c.name || c.customerName || c.email || 'Unknown Customer'
          );
          
          return isSpanish
            ? `📊 **Información de Clientes:**
• Total de clientes: ${customerCount}
• Algunos clientes: ${sampleCustomers.join(', ')}
• Base de datos activa y funcionando correctamente`
            : `📊 **Customer Information:**
• Total customers: ${customerCount}
• Sample customers: ${sampleCustomers.join(', ')}
• Database is active and working properly`;
        }
        
        return isSpanish 
          ? `📋 Total de clientes registrados: ${customerCount}`
          : `📋 Total registered customers: ${customerCount}`;

      case 'items':
        const itemCount = Array.isArray(rawData) ? rawData.length : 0;
        
        if (itemCount === 0) {
          return isSpanish
            ? "📦 No hay productos en el inventario actualmente."
            : "📦 No products in inventory currently.";
        }
        
        if (Array.isArray(rawData) && rawData.length > 0) {
          const totalStock = rawData.reduce((sum, item) => sum + (item.stock || item.inventory || item.quantity || 0), 0);
          const avgPrice = rawData.reduce((sum, item) => sum + (item.price || item.unitPrice || item.cost || 0), 0) / rawData.length;
          const inStock = rawData.filter(item => (item.stock || item.inventory || item.quantity || 0) > 0).length;
          
          return isSpanish
            ? `📦 **Inventario de Productos:**
• Total de productos: ${itemCount}
• Productos con stock: ${inStock}
• Stock total: ${totalStock} unidades
• Precio promedio: $${avgPrice.toFixed(2)}`
            : `📦 **Product Inventory:**
• Total products: ${itemCount}
• Products in stock: ${inStock}
• Total stock: ${totalStock} units
• Average price: $${avgPrice.toFixed(2)}`;
        }
        
        return isSpanish
          ? `📦 Productos en inventario: ${itemCount}`
          : `📦 Products in inventory: ${itemCount}`;

      case 'sales':
        if (Array.isArray(rawData) && rawData.length > 0) {
          const totalRevenue = rawData.reduce((sum, sale) => sum + (sale.total || sale.amount || sale.revenue || 0), 0);
          const totalOrders = rawData.reduce((sum, sale) => sum + (sale.orders || sale.transactions || sale.count || 1), 0);
          const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
          const periods = rawData.length;
          
          return isSpanish
            ? `💰 **Análisis de Ventas:**
• Ingresos totales: $${totalRevenue.toLocaleString()}
• Total de órdenes: ${totalOrders}
• Valor promedio por orden: $${avgOrderValue.toFixed(2)}
• Períodos analizados: ${periods}`
            : `💰 **Sales Analysis:**
• Total revenue: $${totalRevenue.toLocaleString()}
• Total orders: ${totalOrders}
• Average order value: $${avgOrderValue.toFixed(2)}
• Periods analyzed: ${periods}`;
        } else if (rawData && typeof rawData === 'object') {
          const total = rawData.total || rawData.revenue || rawData.totalSales || 0;
          const orders = rawData.orders || rawData.transactions || rawData.totalOrders || 0;
          
          return isSpanish
            ? `💰 **Resumen de Ventas:**
• Total de ventas: $${total.toLocaleString()}
• Número de órdenes: ${orders}
• Promedio por orden: $${orders > 0 ? (total / orders).toFixed(2) : '0.00'}`
            : `💰 **Sales Summary:**
• Total sales: $${total.toLocaleString()}
• Number of orders: ${orders}
• Average per order: $${orders > 0 ? (total / orders).toFixed(2) : '0.00'}`;
        }
        
        return isSpanish
          ? "💰 Información de ventas disponible, pero sin datos específicos en este momento."
          : "💰 Sales information available, but no specific data at this time.";

      case 'inventory':
        if (Array.isArray(rawData) && rawData.length > 0) {
          const inStock = rawData.filter(item => (item.stock || item.inventory || 0) > 0).length;
          const outOfStock = rawData.filter(item => (item.stock || item.inventory || 0) === 0).length;
          const lowStock = rawData.filter(item => {
            const stock = item.stock || item.inventory || 0;
            return stock > 0 && stock < 10;
          }).length;
          
          return isSpanish
            ? `📊 **Estado del Inventario:**
• Productos con stock: ${inStock}
• Productos agotados: ${outOfStock}
• Stock bajo (< 10 unidades): ${lowStock}
• Total de productos: ${rawData.length}`
            : `📊 **Inventory Status:**
• Products in stock: ${inStock}
• Out of stock: ${outOfStock}
• Low stock (< 10 units): ${lowStock}
• Total products: ${rawData.length}`;
        }
        
        return isSpanish
          ? "📊 Información de inventario disponible"
          : "📊 Inventory information available";

      default:
        return isSpanish
          ? `📋 Se encontró información de ${dataType}. Los datos están disponibles para consulta.`
          : `📋 Found ${dataType} information. Data is available for queries.`;
    }
  }
}

/**
 * Default AI service instance
 */
export const aiService = new AIService();
