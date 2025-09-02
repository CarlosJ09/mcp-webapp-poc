import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tool, parameters = {} } = await request.json();

    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Tool name is required' },
        { status: 400 }
      );
    }

    // URL del backend MCP (ajusta según tu configuración)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    console.log('🔧 Tools API Debug:', { 
      backendUrl, 
      env: process.env.NEXT_PUBLIC_BACKEND_URL,
      tool, 
      parameters 
    });
    
    // Llamada al backend MCP para ejecutar herramientas específicas
    const response = await fetch(`${backendUrl}/api/mcp/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool, parameters }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data.result || data
    });

  } catch (error) {
    console.error('Error in MCP tools API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
