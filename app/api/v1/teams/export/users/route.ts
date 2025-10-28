import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Mock comprehensive users data with all related information
const mockUsersExportData = {
  success: true,
  message: "Users data exported successfully",
  data: {
    users: [
      {
        user_id: "550e8400-e29b-41d4-a716-446655440010",
        email: "john.smith@example.com",
        username: "johnsmith",
        first_name: "John",
        last_name: "Smith",
        role: "user",
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: "2024-01-01T00:00:00Z",
        last_login: "2024-01-20T09:15:00Z",
        profile: {
          institution: "Tech University",
          department: "Computer Science",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        },
        event_registrations: [
          {
            registration_id: "550e8400-e29b-41d4-a716-446655440301",
            event: {
              event_id: "550e8400-e29b-41d4-a716-446655440400",
              event_code: "CRDF-2024-001",
              name: "CRDF Global CTF 2024",
              description: "Annual cybersecurity capture the flag competition",
              starts_at: "2024-12-01T10:00:00Z",
              ends_at: "2024-12-01T18:00:00Z",
              created_by: {
                user_id: "550e8400-e29b-41d4-a716-446655440500",
                email: "admin@crdfglobal.org",
                username: "admin"
              }
            },
            status: "active",
            registered_at: "2024-01-05T12:00:00Z",
            withdrawn_at: null,
            notes: "Auto-registered",
            can_participate: true,
            participation_duration: 120
          }
        ],
        team_memberships: [
          {
            membership_id: "550e8400-e29b-41d4-a716-446655440601",
            team: {
              team_id: "550e8400-e29b-41d4-a716-446655440001",
              name: "Cyber Warriors",
              description: "Elite cybersecurity team focused on advanced threat detection",
              max_members: 5,
              is_active: true,
              created_at: "2024-01-15T10:30:00Z",
              created_by: {
                user_id: "550e8400-e29b-41d4-a716-446655440010",
                email: "john.smith@example.com",
                username: "johnsmith"
              }
            },
            role: "member",
            joined_at: "2024-01-15T10:30:00Z",
            is_active: true
          }
        ],
        audit_logs: [
          {
            audit_id: "550e8400-e29b-41d4-a716-446655440701",
            action: "user_create",
            entity_type: "User",
            entity_id: "550e8400-e29b-41d4-a716-446655440010",
            old_values: null,
            new_values: { email: "john.smith@example.com", role: "user" },
            ip_address: "127.0.0.1",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            timestamp: "2024-01-01T00:00:00Z"
          },
          {
            audit_id: "550e8400-e29b-41d4-a716-446655440702",
            action: "profile_update",
            entity_type: "UserProfile",
            entity_id: "550e8400-e29b-41d4-a716-446655440010",
            old_values: { institution: null },
            new_values: { institution: "Tech University" },
            ip_address: "192.168.1.100",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            timestamp: "2024-01-15T10:30:00Z"
          }
        ]
      },
      {
        user_id: "550e8400-e29b-41d4-a716-446655440020",
        email: "sarah.johnson@example.com",
        username: "sarahj",
        first_name: "Sarah",
        last_name: "Johnson",
        role: "user",
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: "2024-01-02T00:00:00Z",
        last_login: "2024-01-19T16:30:00Z",
        profile: {
          institution: "State University",
          department: "Information Technology",
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-16T11:00:00Z"
        },
        event_registrations: [
          {
            registration_id: "550e8400-e29b-41d4-a716-446655440302",
            event: {
              event_id: "550e8400-e29b-41d4-a716-446655440400",
              event_code: "CRDF-2024-001",
              name: "CRDF Global CTF 2024",
              description: "Annual cybersecurity capture the flag competition",
              starts_at: "2024-12-01T10:00:00Z",
              ends_at: "2024-12-01T18:00:00Z",
              created_by: {
                user_id: "550e8400-e29b-41d4-a716-446655440500",
                email: "admin@crdfglobal.org",
                username: "admin"
              }
            },
            status: "active",
            registered_at: "2024-01-06T14:30:00Z",
            withdrawn_at: null,
            notes: "Auto-registered",
            can_participate: true,
            participation_duration: 90
          }
        ],
        team_memberships: [
          {
            membership_id: "550e8400-e29b-41d4-a716-446655440602",
            team: {
              team_id: "550e8400-e29b-41d4-a716-446655440001",
              name: "Cyber Warriors",
              description: "Elite cybersecurity team focused on advanced threat detection",
              max_members: 5,
              is_active: true,
              created_at: "2024-01-15T10:30:00Z",
              created_by: {
                user_id: "550e8400-e29b-41d4-a716-446655440010",
                email: "john.smith@example.com",
                username: "johnsmith"
              }
            },
            role: "member",
            joined_at: "2024-01-16T11:00:00Z",
            is_active: true
          }
        ],
        audit_logs: [
          {
            audit_id: "550e8400-e29b-41d4-a716-446655440703",
            action: "user_create",
            entity_type: "User",
            entity_id: "550e8400-e29b-41d4-a716-446655440020",
            old_values: null,
            new_values: { email: "sarah.johnson@example.com", role: "user" },
            ip_address: "127.0.0.1",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            timestamp: "2024-01-02T00:00:00Z"
          }
        ]
      },
      {
        user_id: "550e8400-e29b-41d4-a716-446655440500",
        email: "admin@crdfglobal.org",
        username: "admin",
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        is_active: true,
        is_staff: true,
        is_superuser: true,
        date_joined: "2023-01-01T00:00:00Z",
        last_login: "2024-01-20T08:00:00Z",
        profile: {
          institution: "CRDF Global",
          department: "Cybersecurity",
          created_at: "2023-01-01T00:00:00Z",
          updated_at: "2024-01-10T12:00:00Z"
        },
        event_registrations: [],
        team_memberships: [],
        audit_logs: [
          {
            audit_id: "550e8400-e29b-41d4-a716-446655440704",
            action: "user_create",
            entity_type: "User",
            entity_id: "550e8400-e29b-41d4-a716-446655440010",
            old_values: null,
            new_values: { email: "john.smith@example.com", role: "user" },
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            timestamp: "2024-01-01T00:00:00Z"
          },
          {
            audit_id: "550e8400-e29b-41d4-a716-446655440705",
            action: "user_create",
            entity_type: "User",
            entity_id: "550e8400-e29b-41d4-a716-446655440020",
            old_values: null,
            new_values: { email: "sarah.johnson@example.com", role: "user" },
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            timestamp: "2024-01-02T00:00:00Z"
          }
        ]
      },
      {
        user_id: "550e8400-e29b-41d4-a716-446655440600",
        email: "instructor@example.com",
        username: "instructor",
        first_name: "Jane",
        last_name: "Doe",
        role: "instructor",
        is_active: true,
        is_staff: true,
        is_superuser: false,
        date_joined: "2024-01-01T00:00:00Z",
        last_login: "2024-01-19T14:20:00Z",
        profile: {
          institution: "Tech University",
          department: "Cybersecurity",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-10T09:15:00Z"
        },
        event_registrations: [
          {
            registration_id: "550e8400-e29b-41d4-a716-446655440303",
            event: {
              event_id: "550e8400-e29b-41d4-a716-446655440400",
              event_code: "CRDF-2024-001",
              name: "CRDF Global CTF 2024",
              description: "Annual cybersecurity capture the flag competition",
              starts_at: "2024-12-01T10:00:00Z",
              ends_at: "2024-12-01T18:00:00Z",
              created_by: {
                user_id: "550e8400-e29b-41d4-a716-446655440500",
                email: "admin@crdfglobal.org",
                username: "admin"
              }
            },
            status: "active",
            registered_at: "2024-01-01T10:00:00Z",
            withdrawn_at: null,
            notes: "Instructor registration",
            can_participate: true,
            participation_duration: 0
          }
        ],
        team_memberships: [],
        audit_logs: [
          {
            audit_id: "550e8400-e29b-41d4-a716-446655440706",
            action: "user_create",
            entity_type: "User",
            entity_id: "550e8400-e29b-41d4-a716-446655440600",
            old_values: null,
            new_values: { email: "instructor@example.com", role: "instructor" },
            ip_address: "127.0.0.1",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            timestamp: "2024-01-01T00:00:00Z"
          }
        ]
      }
    ],
    total_users: 4,
    export_timestamp: new Date().toISOString()
  }
};

// Mock comprehensive system data combining teams, users, and system information
const mockSystemExportData = {
  success: true,
  message: "Complete system data exported successfully",
  data: {
    export_info: {
      export_type: "complete_system",
      export_timestamp: new Date().toISOString(),
      exported_by: "admin",
      version: "1.0.0"
    },
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
          }
        ],
        invitations: [],
        requests: []
      }
    ],
    users: [
      {
        user_id: "550e8400-e29b-41d4-a716-446655440010",
        email: "john.smith@example.com",
        username: "johnsmith",
        first_name: "John",
        last_name: "Smith",
        role: "user",
        is_active: true,
        is_staff: false,
        is_superuser: false,
        date_joined: "2024-01-01T00:00:00Z",
        last_login: "2024-01-20T09:15:00Z",
        profile: {
          institution: "Tech University",
          department: "Computer Science",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        },
        event_registrations: [],
        team_memberships: [],
        audit_logs: []
      }
    ],
    events: [
      {
        event_id: "550e8400-e29b-41d4-a716-446655440400",
        event_code: "CRDF-2024-001",
        name: "CRDF Global CTF 2024",
        description: "Annual cybersecurity capture the flag competition",
        starts_at: "2024-12-01T10:00:00Z",
        ends_at: "2024-12-01T18:00:00Z",
        is_active: true,
        registration_status: "Open",
        max_participants: 1000,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
        created_by: {
          user_id: "550e8400-e29b-41d4-a716-446655440500",
          email: "admin@crdfglobal.org",
          username: "admin"
        },
        registrations: [
          {
            registration_id: "550e8400-e29b-41d4-a716-446655440301",
            user_id: "550e8400-e29b-41d4-a716-446655440010",
            status: "active",
            registered_at: "2024-01-05T12:00:00Z",
            withdrawn_at: null,
            notes: "Auto-registered",
            can_participate: true,
            participation_duration: 120
          }
        ]
      }
    ],
    challenges: [
      {
        challenge_id: "550e8400-e29b-41d4-a716-446655440600",
        title: "Web Security Challenge",
        description: "Find and exploit web vulnerabilities",
        category: "Web Security",
        difficulty: "Medium",
        points: 100,
        is_active: true,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-01-15T14:30:00Z",
        created_by: {
          user_id: "550e8400-e29b-41d4-a716-446655440500",
          email: "admin@crdfglobal.org",
          username: "admin"
        },
        submissions: [
          {
            submission_id: "550e8400-e29b-41d4-a716-446655440701",
            user_id: "550e8400-e29b-41d4-a716-446655440010",
            team_id: "550e8400-e29b-41d4-a716-446655440001",
            flag: "CTF{web_security_flag}",
            submitted_at: "2024-01-18T15:30:00Z",
            is_correct: true,
            points_awarded: 100
          }
        ]
      }
    ],
    system_settings: {
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_special_chars: true,
        max_age_days: 90
      },
      session_settings: {
        timeout_minutes: 30,
        max_concurrent_sessions: 3
      },
      registration_settings: {
        allow_self_registration: true,
        require_email_verification: true,
        default_user_role: "user"
      },
      event_settings: {
        max_team_size: 5,
        allow_team_switching: false,
        auto_approve_teams: false
      }
    },
    statistics: {
      total_users: 4,
      total_teams: 3,
      total_events: 1,
      total_challenges: 1,
      active_users: 3,
      active_teams: 2,
      total_submissions: 1,
      successful_submissions: 1,
      export_timestamp: new Date().toISOString()
    }
  }
};

export async function GET(req: Request) {
  try {
    // For now, return mock data since the backend export endpoints may not be implemented yet
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Fetch all users from database with related data
    // 3. Include all user profiles, teams, events, and audit logs
    // 4. Format the data for export
    
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('include_inactive') === 'true';
    const includeAuditLogs = url.searchParams.get('include_audit_logs') === 'true';
    const exportType = url.searchParams.get('export_type') || 'users'; // 'users' or 'system'
    
    // Log the request for debugging
    console.log('Export request received:', {
      includeInactive,
      includeAuditLogs,
      exportType,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    });
    
    // Choose export data based on export type
    let exportData;
    
    if (exportType === 'system') {
      exportData = { ...mockSystemExportData };
      
      // Filter system data based on parameters
      if (!includeInactive) {
        exportData.data.teams = exportData.data.teams.filter(team => team.is_active);
        exportData.data.users = exportData.data.users.filter(user => user.is_active);
        exportData.data.events = exportData.data.events.filter(event => event.is_active);
        exportData.data.challenges = exportData.data.challenges.filter(challenge => challenge.is_active);
      }
      
      if (!includeAuditLogs) {
        exportData.data.users = exportData.data.users.map(user => ({
          ...user,
          audit_logs: []
        }));
      }
    } else {
      // Default to users export
      exportData = { ...mockUsersExportData };
      
      // Filter users data based on parameters
      if (!includeInactive) {
        exportData.data.users = exportData.data.users.filter(user => user.is_active);
      }
      
      if (!includeAuditLogs) {
        exportData.data.users = exportData.data.users.map(user => ({
          ...user,
          audit_logs: []
        }));
      }
    }
    
    // Always return JSON - frontend handles format conversion
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    
    return new NextResponse(JSON.stringify(exportData, null, 2), { headers });
    
  } catch (error) {
    console.error('Users export error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to export users data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
