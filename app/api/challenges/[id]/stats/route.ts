import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// GET /api/challenges/[id]/stats - Get challenge statistics
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Mock statistics data
    // In production, this would come from actual analytics
    const stats = {
      total_attempts: 247,
      successful_attempts: 193,
      completion_rate: 0.78,
      average_time_spent: 42,
      hint_usage: 156,
      average_score: 4250
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge stats' },
      { status: 500 }
    );
  }
}

