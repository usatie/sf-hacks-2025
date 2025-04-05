import { NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function GET() {
  try {
    console.log(`Checking backend health at: ${API_URL}/health`);
    
    // Make a request to the backend health endpoint
    const response = await fetch(`${API_URL}/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache health check responses in development
      cache: 'no-store',
    });

    if (!response.ok) {
      console.log(`Backend health check failed with status: ${response.status}`);
      
      // Create a descriptive error message
      let errorMessage = 'Backend API is unavailable';
      
      if (response.status === 404) {
        errorMessage = 'Backend health endpoint not found';
      } else if (response.status >= 500) {
        errorMessage = 'Backend server error';
      }
      
      return NextResponse.json(
        { 
          status: 'error', 
          message: errorMessage,
          endpoint: `${API_URL}/health`,
          statusCode: response.status
        },
        { status: 503 }
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse health check response as JSON:', jsonError);
      return NextResponse.json(
        { status: 'error', message: 'Invalid response from backend' },
        { status: 500 }
      );
    }
    
    // Return the response from the backend
    return NextResponse.json({
      status: 'ok',
      message: 'Backend API is available',
      data
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to backend API',
        details: errorMessage,
        endpoint: `${API_URL}/health`
      },
      { status: 500 }
    );
  }
}