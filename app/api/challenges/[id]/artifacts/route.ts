import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// POST /api/challenges/[id]/artifacts - Upload artifact
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Mock file upload
    // In production, this would upload to cloud storage
    const artifact = {
      id: `artifact_${Date.now()}`,
      name: file.name,
      description: formData.get('description') || file.name,
      url: `/uploads/${id}/${file.name}`,
      size: file.size,
      type: file.type,
      uploaded_at: new Date().toISOString()
    };
    
    return NextResponse.json(artifact, { status: 201 });
  } catch (error) {
    console.error('Error uploading artifact:', error);
    return NextResponse.json(
      { error: 'Failed to upload artifact' },
      { status: 500 }
    );
  }
}

