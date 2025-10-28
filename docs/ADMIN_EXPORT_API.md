# Admin Export API Documentation

## Overview

The Admin Export API provides comprehensive data export functionality for teams and users in the CRDF Global CTF platform. This system allows administrators to export complete datasets with all related information in structured formats.

## API Endpoints

### Teams Export API

**Endpoint:** `GET /api/v1/teams/export/teams/`

**Purpose:** Export all teams with complete related data including members, invitations, and requests.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `format` (optional): Export format - `json` (default) or `excel`
- `include_inactive` (optional): Include inactive teams - `true` or `false` (default: `false`)

**Example Request:**
```bash
GET /api/v1/teams/export/teams/?format=json&include_inactive=true
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Teams data exported successfully",
  "data": {
    "teams": [
      {
        "team_id": "uuid",
        "name": "Team Name",
        "description": "Team Description",
        "max_members": 5,
        "is_active": true,
        "created_at": "2024-10-21T12:00:00Z",
        "updated_at": "2024-10-21T12:00:00Z",
        "created_by": {
          "user_id": "uuid",
          "email": "creator@example.com",
          "username": "creator",
          "first_name": "John",
          "last_name": "Doe",
          "role": "admin"
        },
        "members": [
          {
            "member_id": "uuid",
            "user": {
              "user_id": "uuid",
              "email": "member@example.com",
              "username": "member",
              "first_name": "Jane",
              "last_name": "Smith",
              "role": "user",
              "is_active": true,
              "date_joined": "2024-10-21T12:00:00Z",
              "last_login": "2024-10-21T12:00:00Z",
              "profile": {
                "institution": "University",
                "department": "Computer Science",
                "created_at": "2024-10-21T12:00:00Z",
                "updated_at": "2024-10-21T12:00:00Z"
              }
            },
            "role": "member",
            "joined_at": "2024-10-21T12:00:00Z",
            "is_active": true
          }
        ],
        "invitations": [
          {
            "invitation_id": "uuid",
            "invited_user": {
              "user_id": "uuid",
              "email": "invited@example.com",
              "username": "invited"
            },
            "invited_by": {
              "user_id": "uuid",
              "email": "inviter@example.com",
              "username": "inviter"
            },
            "status": "pending",
            "invited_at": "2024-10-21T12:00:00Z",
            "responded_at": null,
            "expires_at": "2024-10-28T12:00:00Z"
          }
        ],
        "requests": [
          {
            "request_id": "uuid",
            "user": {
              "user_id": "uuid",
              "email": "requester@example.com",
              "username": "requester",
              "first_name": "Bob",
              "last_name": "Johnson"
            },
            "status": "pending",
            "requested_at": "2024-10-21T12:00:00Z",
            "responded_at": null,
            "message": "I would like to join this team"
          }
        ]
      }
    ],
    "total_teams": 10,
    "export_timestamp": "2024-10-21T12:00:00Z"
  }
}
```

### Users Export API

**Endpoint:** `GET /api/v1/teams/export/users/`

### Complete System Export API

**Endpoint:** `GET /api/v1/teams/export/users/`

**Purpose:** Export complete system data including teams, users, events, challenges, system settings, and statistics.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `export_type` (required): Set to `system` for complete system export
- `format` (optional): Export format - `json` (default) or `excel`
- `include_inactive` (optional): Include inactive records - `true` or `false` (default: `false`)
- `include_audit_logs` (optional): Include audit logs - `true` or `false` (default: `false`)

**Example Request:**
```bash
GET /api/v1/teams/export/users/?export_type=system&format=json&include_inactive=true&include_audit_logs=true
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Complete system data exported successfully",
  "data": {
    "export_info": {
      "export_type": "complete_system",
      "export_timestamp": "2024-10-21T12:00:00Z",
      "exported_by": "admin",
      "version": "1.0.0"
    },
    "teams": [...],
    "users": [...],
    "events": [...],
    "challenges": [...],
    "system_settings": {
      "password_policy": {...},
      "session_settings": {...},
      "registration_settings": {...},
      "event_settings": {...}
    },
    "statistics": {
      "total_users": 100,
      "total_teams": 10,
      "total_events": 5,
      "total_challenges": 50,
      "active_users": 85,
      "active_teams": 8,
      "total_submissions": 500,
      "successful_submissions": 450,
      "export_timestamp": "2024-10-21T12:00:00Z"
    }
  }
}
```

**Purpose:** Export all users with complete related data including profiles, team memberships, event registrations, and audit logs.

**Authentication:** Required (Admin only)

**Query Parameters:**
- `format` (optional): Export format - `json` (default) or `excel`
- `include_inactive` (optional): Include inactive users - `true` or `false` (default: `false`)
- `include_audit_logs` (optional): Include audit logs - `true` or `false` (default: `false`)

**Example Request:**
```bash
GET /api/v1/teams/export/users/?format=json&include_inactive=true&include_audit_logs=true
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Users data exported successfully",
  "data": {
    "users": [
      {
        "user_id": "uuid",
        "email": "user@example.com",
        "username": "username",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user",
        "is_active": true,
        "is_staff": false,
        "is_superuser": false,
        "date_joined": "2024-10-21T12:00:00Z",
        "last_login": "2024-10-21T12:00:00Z",
        "profile": {
          "institution": "University",
          "department": "Computer Science",
          "created_at": "2024-10-21T12:00:00Z",
          "updated_at": "2024-10-21T12:00:00Z"
        },
        "event_registrations": [
          {
            "registration_id": "uuid",
            "event": {
              "event_id": "uuid",
              "event_code": "TES-2025-001",
              "name": "Test Event",
              "description": "Event Description",
              "starts_at": "2025-12-01T10:00:00Z",
              "ends_at": "2025-12-01T18:00:00Z",
              "created_by": {
                "user_id": "uuid",
                "email": "admin@example.com",
                "username": "admin"
              }
            },
            "status": "active",
            "registered_at": "2024-10-21T12:00:00Z",
            "withdrawn_at": null,
            "notes": "Auto-registered",
            "can_participate": true,
            "participation_duration": 120
          }
        ],
        "team_memberships": [
          {
            "membership_id": "uuid",
            "team": {
              "team_id": "uuid",
              "name": "Team Name",
              "description": "Team Description",
              "max_members": 5,
              "is_active": true,
              "created_at": "2024-10-21T12:00:00Z",
              "created_by": {
                "user_id": "uuid",
                "email": "creator@example.com",
                "username": "creator"
              }
            },
            "role": "member",
            "joined_at": "2024-10-21T12:00:00Z",
            "is_active": true
          }
        ],
        "audit_logs": [
          {
            "audit_id": "uuid",
            "action": "user_create",
            "entity_type": "User",
            "entity_id": "uuid",
            "old_values": null,
            "new_values": {"email": "user@example.com"},
            "ip_address": "127.0.0.1",
            "user_agent": "Mozilla/5.0...",
            "timestamp": "2024-10-21T12:00:00Z"
          }
        ]
      }
    ],
    "total_users": 100,
    "export_timestamp": "2024-10-21T12:00:00Z"
  }
}
```

## Client-Side Integration

### Admin Export Service

The `adminExportAPI` service provides methods for exporting data from the frontend:

```typescript
import { adminExportAPI } from '@/lib/api/admin-export';

// Export teams data
await adminExportAPI.exportAndDownloadTeams({
  format: 'json',
  includeInactive: true
});

// Export users data
await adminExportAPI.exportAndDownloadUsers({
  format: 'json',
  includeInactive: true,
  includeAuditLogs: true
});
```

### Available Methods

1. **`exportTeams(options)`** - Get teams data as JSON
2. **`exportUsers(options)`** - Get users data as JSON
3. **`downloadTeamsExport(options)`** - Download teams data as blob
4. **`downloadUsersExport(options)`** - Download users data as blob
5. **`exportAndDownloadTeams(options)`** - Export and trigger download
6. **`exportAndDownloadUsers(options)`** - Export and trigger download

### Export Options

```typescript
interface ExportOptions {
  format?: 'json' | 'excel';
  includeInactive?: boolean;
  includeAuditLogs?: boolean; // Only for users export
}
```

## Frontend Integration

### Teams Management

The export functionality is integrated into the Teams Management page:

```typescript
const handleExportTeams = async () => {
  try {
    await adminExportAPI.exportAndDownloadTeams({
      format: 'json',
      includeInactive: activeTab === 'all'
    });
    showSuccess('Teams data exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    showError('Failed to export teams data. Please try again.');
  }
};
```

### Users Management

The export functionality is integrated into the Users Management page:

```typescript
const handleExportUsers = async () => {
  try {
    await adminExportAPI.exportAndDownloadUsers({
      format: 'json',
      includeInactive: activeTab === 'all-users',
      includeAuditLogs: true
    });
    showSuccess('Users data exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    showError('Failed to export users data. Please try again.');
  }
};
```

## File Formats

### JSON Format
- Default format for all exports
- Structured data with nested objects
- Easy to parse and process programmatically
- Includes all related data in a single file

### Excel Format (Future Enhancement)
- Structured spreadsheet format
- Multiple sheets for different data types
- Formatted for easy viewing and analysis
- Requires additional library implementation (e.g., 'xlsx')

## Security Considerations

1. **Authentication Required:** All export endpoints require admin authentication
2. **Data Privacy:** Sensitive information is included in exports - ensure proper access controls
3. **Audit Logging:** All export activities should be logged for compliance
4. **Rate Limiting:** Consider implementing rate limiting for export endpoints

## Error Handling

The API returns appropriate error responses:

```json
{
  "success": false,
  "message": "Failed to export teams data",
  "error": "Detailed error message"
}
```

Common error scenarios:
- Authentication failure
- Insufficient permissions
- Database connection issues
- Invalid query parameters

## Performance Considerations

1. **Large Datasets:** Export operations may take time for large datasets
2. **Memory Usage:** Consider pagination for very large exports
3. **Caching:** Implement caching for frequently requested exports
4. **Background Processing:** Consider async processing for large exports

## Future Enhancements

1. **Excel Export:** Full Excel format support with multiple sheets
2. **CSV Export:** Lightweight CSV format option
3. **Filtered Exports:** Export specific subsets of data
4. **Scheduled Exports:** Automated export scheduling
5. **Email Delivery:** Send exports via email
6. **Compression:** Compress large export files
7. **Progress Tracking:** Real-time export progress updates

## Usage Examples

### Basic Teams Export
```bash
curl -X GET "https://api.crdfglobal.org/v1/teams/export/teams/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Teams Export with Inactive Teams
```bash
curl -X GET "https://api.crdfglobal.org/v1/teams/export/teams/?include_inactive=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### Users Export with Audit Logs
```bash
curl -X GET "https://api.crdfglobal.org/v1/teams/export/users/?include_audit_logs=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

## Implementation Notes

- The current implementation uses mock data for demonstration
- Real implementation should connect to actual database
- Authentication middleware should be implemented
- File download handling should be optimized for large files
- Consider implementing export job queues for better performance
