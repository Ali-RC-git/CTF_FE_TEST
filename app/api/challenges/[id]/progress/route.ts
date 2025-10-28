/**
 * API Route: Get Challenge Progress
 * GET /api/challenges/{id}/progress?eventId={eventId}&teamId={teamId}
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const teamId = searchParams.get('teamId');

    if (!eventId || !teamId) {
      return NextResponse.json(
        { success: false, message: 'Missing eventId or teamId' },
        { status: 400 }
      );
    }

    // Get the authorization token from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header missing' },
        { status: 401 }
      );
    }

    // Call backend API to get progress
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/api/v1/events/${eventId}/challenges/${challengeId}/progress/`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || errorData.detail || 'Failed to fetch progress',
          error: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in progress API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
