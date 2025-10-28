import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// PUT /api/challenges/[id]/questions/[questionId] - Update a question
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const { id, questionId } = params;
    const data = await req.json();
    const { question, type } = data;
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question data is required' },
        { status: 400 }
      );
    }
    
    // Mock question update
    const updatedQuestion = {
      ...question,
      id: questionId,
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/challenges/[id]/questions/[questionId] - Delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const { id, questionId } = params;
    
    // Mock question deletion
    return NextResponse.json({
      message: 'Question deleted successfully',
      questionId: questionId
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}

