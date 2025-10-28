import { NextResponse } from "next/server";
import { authenticatedBackendFetch } from "../_utils/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/challenges - Get all challenges with optional filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Build query string from search params
    const queryString = searchParams.toString();
    const endpoint = `/challenges/${queryString ? `?${queryString}` : ''}`;
    
    // Fetch from Django backend
    const response = await authenticatedBackendFetch(endpoint, {
      method: 'GET',
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to fetch challenges' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Create a new challenge
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Create challenge in Django backend
    const response = await authenticatedBackendFetch('/challenges/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to create challenge' },
        { status: response.status }
      );
    }

    const newChallenge = await response.json();
    return NextResponse.json({
      message: 'Challenge created successfully',
      challenge: newChallenge
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
