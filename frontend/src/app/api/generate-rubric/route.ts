import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/config';

export async function POST(request: NextRequest) {
  try {
    // Extract the request body
    const body = await request.json();
    
    // Make a request to the backend API
    const response = await fetch(`${API_URL}/generate-rubric`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Failed to generate rubric' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the response from the backend
    return NextResponse.json(data);
  } catch (error) {
    console.error('Generate rubric error:', error);
    
    // Return an error response
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to backend API' },
      { status: 500 }
    );
  }
}