import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { authenticatedBackendFetch } from "../../../../../_utils/auth";

// POST /api/challenges/[id]/questions/[questionId]/submit - Submit answer for a question
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const { id, questionId } = params;
    const body = await req.json();
    const { answer, questionType } = body;

    if (!answer) {
      return NextResponse.json(
        { error: 'Answer is required' },
        { status: 400 }
      );
    }

    // Submit answer to Django backend
    const response = await authenticatedBackendFetch(
      `/challenges/${id}/questions/${questionId}/submit/`,
      {
        method: 'POST',
        body: JSON.stringify({
          answer,
          question_type: questionType
        }),
      },
      req
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        errorData || { error: 'Failed to submit answer' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

