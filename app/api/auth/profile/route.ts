import { NextResponse } from "next/server";

// Mock user profile data
const mockUserProfile = {
  id: "user_001",
  email: "admin@crdfglobal.org",
  username: "admin",
  first_name: "Admin",
  last_name: "User",
  full_name: "Admin User",
  role: "admin",
  status: "active",
  is_mfa_enabled: false,
  created_at: "2023-01-01T00:00:00Z",
  last_login_at: new Date().toISOString(),
  profile: {
    bio: "System Administrator",
    avatar: null,
    phone: null,
    institution: "CRDF Global",
    department: "Cybersecurity",
    student_id: null,
    email_notifications: true,
    sms_notifications: false,
    two_factor_enabled: false
  },
  permissions: [
    "challenges.create",
    "challenges.read",
    "challenges.update",
    "challenges.delete",
    "users.read",
    "users.update",
    "teams.read",
    "teams.update",
    "events.read",
    "events.update"
  ],
  preferences: {
    theme: "light",
    language: "en",
    timezone: "UTC",
    date_format: "MM/DD/YYYY",
    time_format: "12h"
  }
};

export async function GET(req: Request) {
  try {
    // In a real application, you would verify the user's token
    // and fetch their actual profile from a database.
    // For now, we return a mock admin user.
    
    return NextResponse.json(mockUserProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
