import { NextResponse } from "next/server";

// Mock user data for authentication
const mockUsers = [
  {
    id: "user_001",
    email: "admin@crdfglobal.org",
    username: "admin",
    first_name: "Admin",
    last_name: "User",
    role: "admin",
    password: "admin123", // In production, this would be hashed
    institution: "CRDF Global",
    department: "Cybersecurity",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z"
  },
  {
    id: "user_002",
    email: "user@example.com",
    username: "testuser",
    first_name: "Test",
    last_name: "User",
    role: "user",
    password: "user123", // In production, this would be hashed
    institution: "Test University",
    department: "Computer Science",
    is_active: true,
    created_at: "2023-01-01T00:00:00Z"
  }
];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password (in production, this would use proper password hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    // Generate mock tokens (in production, use JWT)
    const accessToken = `mock_access_token_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;

    return NextResponse.json({
      access: accessToken,
      refresh: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        institution: user.institution,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
