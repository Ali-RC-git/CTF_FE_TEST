import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Mock comprehensive teams data with all related information
const mockTeamsExportData = {
  success: true,
  message: "Teams data exported successfully",
  data: {
    teams: [
      {
        team_id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Cyber Warriors",
        description: "Elite cybersecurity team focused on advanced threat detection and penetration testing",
        max_members: 5,
        is_active: true,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-20T14:45:00Z",
        created_by: {
          user_id: "550e8400-e29b-41d4-a716-446655440010",
          email: "john.smith@example.com",
          username: "johnsmith",
          first_name: "John",
          last_name: "Smith",
          role: "admin"
        },
        members: [
          {
            member_id: "550e8400-e29b-41d4-a716-446655440011",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440010",
              email: "john.smith@example.com",
              username: "johnsmith",
              first_name: "John",
              last_name: "Smith",
              role: "user",
              is_active: true,
              date_joined: "2024-01-01T00:00:00Z",
              last_login: "2024-01-20T09:15:00Z",
              profile: {
                institution: "Tech University",
                department: "Computer Science",
                created_at: "2024-01-01T00:00:00Z",
                updated_at: "2024-01-15T10:30:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-15T10:30:00Z",
            is_active: true
          },
          {
            member_id: "550e8400-e29b-41d4-a716-446655440012",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440020",
              email: "sarah.johnson@example.com",
              username: "sarahj",
              first_name: "Sarah",
              last_name: "Johnson",
              role: "user",
              is_active: true,
              date_joined: "2024-01-02T00:00:00Z",
              last_login: "2024-01-19T16:30:00Z",
              profile: {
                institution: "State University",
                department: "Information Technology",
                created_at: "2024-01-02T00:00:00Z",
                updated_at: "2024-01-16T11:00:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-16T11:00:00Z",
            is_active: true
          },
          {
            member_id: "550e8400-e29b-41d4-a716-446655440013",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440030",
              email: "mike.davis@example.com",
              username: "miked",
              first_name: "Mike",
              last_name: "Davis",
              role: "user",
              is_active: true,
              date_joined: "2024-01-03T00:00:00Z",
              last_login: "2024-01-20T08:45:00Z",
              profile: {
                institution: "Cyber Academy",
                department: "Cybersecurity",
                created_at: "2024-01-03T00:00:00Z",
                updated_at: "2024-01-17T13:20:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-17T13:20:00Z",
            is_active: true
          }
        ],
        invitations: [
          {
            invitation_id: "550e8400-e29b-41d4-a716-446655440101",
            invited_user: {
              user_id: "550e8400-e29b-41d4-a716-446655440040",
              email: "david.miller@example.com",
              username: "davidm"
            },
            invited_by: {
              user_id: "550e8400-e29b-41d4-a716-446655440010",
              email: "john.smith@example.com",
              username: "johnsmith"
            },
            status: "pending",
            invited_at: "2024-01-20T10:30:00Z",
            responded_at: null,
            expires_at: "2024-01-27T10:30:00Z"
          }
        ],
        requests: [
          {
            request_id: "550e8400-e29b-41d4-a716-446655440201",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440050",
              email: "alex.brown@example.com",
              username: "alexb",
              first_name: "Alex",
              last_name: "Brown"
            },
            status: "pending",
            requested_at: "2024-01-19T14:30:00Z",
            responded_at: null,
            message: "I have extensive experience in cybersecurity and would love to join your team."
          },
          {
            request_id: "550e8400-e29b-41d4-a716-446655440202",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440060",
              email: "emma.taylor@example.com",
              username: "emmat",
              first_name: "Emma",
              last_name: "Taylor"
            },
            status: "approved",
            requested_at: "2024-01-18T10:15:00Z",
            responded_at: "2024-01-19T16:20:00Z",
            message: "Looking to contribute to cybersecurity challenges."
          }
        ]
      },
      {
        team_id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Code Breakers",
        description: "Cryptography and reverse engineering specialists",
        max_members: 4,
        is_active: true,
        created_at: "2024-01-10T08:15:00Z",
        updated_at: "2024-01-19T11:30:00Z",
        created_by: {
          user_id: "550e8400-e29b-41d4-a716-446655440070",
          email: "robert.chen@example.com",
          username: "robertc",
          first_name: "Robert",
          last_name: "Chen",
          role: "admin"
        },
        members: [
          {
            member_id: "550e8400-e29b-41d4-a716-446655440071",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440070",
              email: "robert.chen@example.com",
              username: "robertc",
              first_name: "Robert",
              last_name: "Chen",
              role: "user",
              is_active: true,
              date_joined: "2024-01-05T00:00:00Z",
              last_login: "2024-01-20T07:30:00Z",
              profile: {
                institution: "Crypto University",
                department: "Mathematics",
                created_at: "2024-01-05T00:00:00Z",
                updated_at: "2024-01-10T08:15:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-10T08:15:00Z",
            is_active: true
          },
          {
            member_id: "550e8400-e29b-41d4-a716-446655440072",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440080",
              email: "jennifer.lee@example.com",
              username: "jenniferl",
              first_name: "Jennifer",
              last_name: "Lee",
              role: "user",
              is_active: true,
              date_joined: "2024-01-06T00:00:00Z",
              last_login: "2024-01-19T15:45:00Z",
              profile: {
                institution: "Engineering College",
                department: "Computer Engineering",
                created_at: "2024-01-06T00:00:00Z",
                updated_at: "2024-01-12T14:20:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-12T14:20:00Z",
            is_active: true
          },
          {
            member_id: "550e8400-e29b-41d4-a716-446655440073",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440090",
              email: "kevin.nguyen@example.com",
              username: "kevinn",
              first_name: "Kevin",
              last_name: "Nguyen",
              role: "user",
              is_active: true,
              date_joined: "2024-01-07T00:00:00Z",
              last_login: "2024-01-20T06:20:00Z",
              profile: {
                institution: "Tech Institute",
                department: "Software Engineering",
                created_at: "2024-01-07T00:00:00Z",
                updated_at: "2024-01-14T16:10:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-14T16:10:00Z",
            is_active: true
          }
        ],
        invitations: [],
        requests: [
          {
            request_id: "550e8400-e29b-41d4-a716-446655440203",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440100",
              email: "maria.rodriguez@example.com",
              username: "mariar",
              first_name: "Maria",
              last_name: "Rodriguez"
            },
            status: "pending",
            requested_at: "2024-01-20T09:45:00Z",
            responded_at: null,
            message: "I specialize in cryptography and would like to join your team."
          }
        ]
      },
      {
        team_id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Security Squad",
        description: "Network security and incident response team",
        max_members: 6,
        is_active: false,
        created_at: "2024-01-05T14:20:00Z",
        updated_at: "2024-01-18T09:15:00Z",
        created_by: {
          user_id: "550e8400-e29b-41d4-a716-446655440110",
          email: "lisa.brown@example.com",
          username: "lisab",
          first_name: "Lisa",
          last_name: "Brown",
          role: "admin"
        },
        members: [
          {
            member_id: "550e8400-e29b-41d4-a716-446655440111",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440110",
              email: "lisa.brown@example.com",
              username: "lisab",
              first_name: "Lisa",
              last_name: "Brown",
              role: "user",
              is_active: true,
              date_joined: "2024-01-05T00:00:00Z",
              last_login: "2024-01-18T12:30:00Z",
              profile: {
                institution: "Security Institute",
                department: "Network Security",
                created_at: "2024-01-05T00:00:00Z",
                updated_at: "2024-01-05T14:20:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-05T14:20:00Z",
            is_active: true
          },
          {
            member_id: "550e8400-e29b-41d4-a716-446655440112",
            user: {
              user_id: "550e8400-e29b-41d4-a716-446655440120",
              email: "david.wilson@example.com",
              username: "davidw",
              first_name: "David",
              last_name: "Wilson",
              role: "user",
              is_active: true,
              date_joined: "2024-01-08T00:00:00Z",
              last_login: "2024-01-17T10:45:00Z",
              profile: {
                institution: "Tech College",
                department: "Information Security",
                created_at: "2024-01-08T00:00:00Z",
                updated_at: "2024-01-12T16:30:00Z"
              }
            },
            role: "member",
            joined_at: "2024-01-12T16:30:00Z",
            is_active: true
          }
        ],
        invitations: [
          {
            invitation_id: "550e8400-e29b-41d4-a716-446655440102",
            invited_user: {
              user_id: "550e8400-e29b-41d4-a716-446655440130",
              email: "sophie.taylor@example.com",
              username: "sophiet"
            },
            invited_by: {
              user_id: "550e8400-e29b-41d4-a716-446655440110",
              email: "lisa.brown@example.com",
              username: "lisab"
            },
            status: "declined",
            invited_at: "2024-01-15T11:00:00Z",
            responded_at: "2024-01-16T14:30:00Z",
            expires_at: "2024-01-22T11:00:00Z"
          }
        ],
        requests: []
      }
    ],
    total_teams: 3,
    export_timestamp: new Date().toISOString()
  }
};

export async function GET(req: Request) {
  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Fetch all teams from database with related data
    // 3. Include all team members, requests, invitations, and statistics
    // 4. Format the data for export
    
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('include_inactive') === 'true';
    
    // Filter data based on parameters
    let exportData = { ...mockTeamsExportData };
    
    if (!includeInactive) {
      exportData.data.teams = exportData.data.teams.filter(team => team.is_active);
    }
    
    // Always return JSON - frontend handles format conversion
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    return new NextResponse(JSON.stringify(exportData, null, 2), { headers });
    
  } catch (error) {
    console.error('Teams export error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to export teams data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
