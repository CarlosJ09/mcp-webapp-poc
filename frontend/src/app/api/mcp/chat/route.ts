import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Backend MCP URL (adjust according to your configuration)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    console.log('🔍 Chat API Debug:', { 
      backendUrl, 
      env: process.env.NEXT_PUBLIC_BACKEND_URL,
      message: message.substring(0, 50) + '...'
    });
    
    // Llamada al backend MCP
    const response = await fetch(`${backendUrl}/api/mcp/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error('❌ Backend response error:', {
        status: response.status,
        statusText: response.statusText,
        url: `${backendUrl}/api/mcp/chat`
      });
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    console.log('✅ Backend response data:', data);

    return NextResponse.json({
      success: true,
      data: data.data || 'Response from MCP agent processed successfully'
    });

  } catch (error) {
    console.error('Error in MCP chat API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
