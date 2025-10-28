import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { authenticatedBackendFetch } from "../../_utils/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/challenges/user-progress - Get user's progress on all challenges
export async function GET(req: NextRequest) {
  try {
    // Get all challenge progress for the current user from Django backend
    const response = await authenticatedBackendFetch(
      `/challenges/user-progress/`,
      {
        method: 'GET',
      },
      req
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // If endpoint doesn't exist, return empty array
      if (response.status === 404 || response.status === 405) {
        console.warn('User progress endpoint not implemented, returning empty');
        return NextResponse.json([]);
      }
      
      return NextResponse.json(
        errorData || { error: 'Failed to fetch user progress' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    
    // Return empty array instead of error
    return NextResponse.json([]);
  }
}

