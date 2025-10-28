import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// DELETE /api/challenges/[id]/artifacts/[artifactId] - Delete artifact
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; artifactId: string } }
) {
  try {
    const { id, artifactId } = params;
    
    // Mock deletion
    // In production, this would delete from cloud storage and database
    
    return NextResponse.json({
      message: 'Artifact deleted successfully',
      artifactId: artifactId
    });
  } catch (error) {
    console.error('Error deleting artifact:', error);
    return NextResponse.json(
      { error: 'Failed to delete artifact' },
      { status: 500 }
    );
  }
}

