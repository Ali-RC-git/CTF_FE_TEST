/**
 * API Route: Submit Complete Challenge
 * Saves all challenge data to Redis and updates scoreboard
 * POST /api/challenges/{id}/submit-challenge
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    const body = await request.json();

    const {
      eventId,
      teamId,
      challengeStartTime,
      totalTimeSpent,
      questionsData, // Array of { questionId, answer, hintsUsed, isCorrect, points }
    } = body;

    // Validate required fields
    if (!eventId || !teamId || !questionsData || !Array.isArray(questionsData)) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: eventId, teamId, or questionsData' },
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

    // Calculate total score
    const totalScore = questionsData.reduce((sum: number, q: any) => {
      if (q.isCorrect) {
        // Calculate score: base points - (hints used * 25)
        const score = Math.max(0, q.points - (q.hintsUsed * 25));
        return sum + score;
      }
      return sum;
    }, 0);

    const completedQuestionsCount = questionsData.filter((q: any) => q.isCorrect).length;

    // Prepare payload for backend
    const payload = {
      event_id: eventId,
      team_id: teamId,
      challenge_id: challengeId,
      challenge_started_at: challengeStartTime,
      total_time_spent_seconds: totalTimeSpent,
      total_score: totalScore,
      completed_questions_count: completedQuestionsCount,
      questions: questionsData.map((q: any) => ({
        question_id: q.questionId,
        question_type: q.questionType,
        answer: q.answer,
        hints_used: q.hintsUsed || 0,
        is_correct: q.isCorrect,
        points_earned: q.isCorrect ? Math.max(0, q.points - (q.hintsUsed * 25)) : 0,
        submitted_at: new Date().toISOString(),
      })),
    };

    // Call backend API to save to Redis and update scoreboard
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/challenges/${challengeId}/submit-complete/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || errorData.detail || 'Failed to submit challenge',
          error: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Challenge submitted successfully! Scoreboard updated.',
      data: {
        totalScore,
        completedQuestions: completedQuestionsCount,
        totalQuestions: questionsData.length,
        ...data,
      },
    });
  } catch (error) {
    console.error('Error in submit-challenge API:', error);
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

