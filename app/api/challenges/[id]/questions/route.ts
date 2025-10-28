import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// POST /api/challenges/[id]/questions - Add a question to challenge
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await req.json();
    const { question, type } = data;
    
    if (!question || !type) {
      return NextResponse.json(
        { error: 'Question and type are required' },
        { status: 400 }
      );
    }
    
    // Mock question creation
    const newQuestion = {
      ...question,
      id: `question_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: 'Question added successfully',
      question: newQuestion
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding question:', error);
    return NextResponse.json(
      { error: 'Failed to add question' },
      { status: 500 }
    );
  }
}

