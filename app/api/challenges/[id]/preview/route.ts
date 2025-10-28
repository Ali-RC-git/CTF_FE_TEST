import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// GET /api/challenges/[id]/preview - Get challenge preview
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Mock preview data
    // In production, this would calculate totals from the actual challenge
    const preview = {
      challenge: {
        id: id,
        title: "Challenge Preview",
        description: "Preview of the challenge",
        category: "OT/ICS Security",
        difficulty: "Medium",
        points: 500,
        status: "Published"
      },
      totalQuestions: 35,
      totalPoints: 5000,
      estimatedTime: 60
    };
    
    return NextResponse.json(preview);
  } catch (error) {
    console.error('Error fetching challenge preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge preview' },
      { status: 500 }
    );
  }
}

