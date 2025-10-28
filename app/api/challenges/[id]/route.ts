import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { authenticatedBackendFetch } from "../../_utils/auth";

// GET /api/challenges/[id] - Get a single challenge
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch from Django backend
    const response = await authenticatedBackendFetch(`/challenges/${id}/`, {
      method: 'GET',
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to fetch challenge' },
        { status: response.status }
      );
    }

    const challenge = await response.json();
    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}

// PUT /api/challenges/[id] - Update a challenge
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();

    // Update challenge in Django backend
    const response = await authenticatedBackendFetch(`/challenges/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to update challenge' },
        { status: response.status }
      );
    }

    const updatedChallenge = await response.json();
    return NextResponse.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to update challenge' },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges/[id] - Delete a challenge
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete challenge from Django backend
    const response = await authenticatedBackendFetch(`/challenges/${id}/`, {
      method: 'DELETE',
    }, req);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to delete challenge' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: 'Challenge deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: 'Failed to delete challenge' },
      { status: 500 }
    );
  }
}
