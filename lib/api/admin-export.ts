/**
 * Admin Export API service
 * Handles data export functionality for teams and users in admin interface
 */

import { apiClient } from './client';

// Export response types
export interface TeamsExportResponse {
  success: boolean;
  message: string;
  data: {
    teams: Array<{
      team_id: string;
      name: string;
      description: string;
      max_members: number;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      created_by: {
        user_id: string;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        role: string;
      };
      members: Array<{
        member_id: string;
        user: {
          user_id: string;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
          role: string;
          is_active: boolean;
          date_joined: string;
          last_login: string;
          profile: {
            institution: string;
            department: string;
            created_at: string;
            updated_at: string;
          };
        };
        role: string;
        joined_at: string;
        is_active: boolean;
      }>;
      invitations: Array<{
        invitation_id: string;
        invited_user: {
          user_id: string;
          email: string;
          username: string;
        };
        invited_by: {
          user_id: string;
          email: string;
          username: string;
        };
        status: string;
        invited_at: string;
        responded_at: string | null;
        expires_at: string;
      }>;
      requests: Array<{
        request_id: string;
        user: {
          user_id: string;
          email: string;
          username: string;
          first_name: string;
          last_name: string;
        };
        status: string;
        requested_at: string;
        responded_at: string | null;
        message: string;
      }>;
    }>;
    total_teams: number;
    export_timestamp: string;
  };
}

export interface UsersExportResponse {
  success: boolean;
  message: string;
  data: {
    users: Array<{
      user_id: string;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      role: string;
      is_active: boolean;
      is_staff: boolean;
      is_superuser: boolean;
      date_joined: string;
      last_login: string;
      profile: {
        institution: string;
        department: string;
        created_at: string;
        updated_at: string;
      };
      event_registrations: Array<{
        registration_id: string;
        event: {
          event_id: string;
          event_code: string;
          name: string;
          description: string;
          starts_at: string;
          ends_at: string;
          created_by: {
            user_id: string;
            email: string;
            username: string;
          };
        };
        status: string;
        registered_at: string;
        withdrawn_at: string | null;
        notes: string;
        can_participate: boolean;
        participation_duration: number;
      }>;
      team_memberships: Array<{
        membership_id: string;
        team: {
          team_id: string;
          name: string;
          description: string;
          max_members: number;
          is_active: boolean;
          created_at: string;
          created_by: {
            user_id: string;
            email: string;
            username: string;
          };
        };
        role: string;
        joined_at: string;
        is_active: boolean;
      }>;
      audit_logs: Array<{
        audit_id: string;
        action: string;
        entity_type: string;
        entity_id: string;
        old_values: any;
        new_values: any;
        ip_address: string;
        user_agent: string;
        timestamp: string;
      }>;
    }>;
    total_users: number;
    export_timestamp: string;
  };
}

export interface ExportOptions {
  format?: 'excel' | 'csv';
  includeInactive?: boolean;
  includeAuditLogs?: boolean;
}

export interface SystemExportResponse {
  success: boolean;
  message: string;
  data: {
    export_info: {
      export_type: string;
      export_timestamp: string;
      exported_by: string;
      version: string;
    };
    teams: any[];
    users: any[];
    events: any[];
    challenges: any[];
    system_settings: any;
    statistics: any;
  };
}

class AdminExportAPI {
  /**
   * Export teams data with all related information
   */
  async exportTeams(options: ExportOptions = {}): Promise<TeamsExportResponse> {
    console.log('🔍 exportTeams method called with options:', options);
    
    const params = new URLSearchParams();
    
    // Don't send format to API - it always returns JSON
    if (options.includeInactive) {
      params.append('include_inactive', 'true');
    }
    
    const queryString = params.toString();
    const endpoint = `/teams/export/teams/${queryString ? `?${queryString}` : ''}`;
    
    console.log('Export teams endpoint:', endpoint);
    console.log('Export teams options:', options);
    console.log('apiClient available:', !!apiClient);
    
    try {
      console.log('Making API call...');
      const result = await apiClient.get<TeamsExportResponse>(endpoint);
      console.log('Export teams result:', result);
      return result;
    } catch (error) {
      console.error('Teams export error:', error);
      throw error;
    }
  }

  /**
   * Export users data with all related information
   */
  async exportUsers(options: ExportOptions = {}): Promise<UsersExportResponse> {
    const params = new URLSearchParams();
    
    // Don't send format to API - it always returns JSON
    if (options.includeInactive) {
      params.append('include_inactive', 'true');
    }
    
    if (options.includeAuditLogs) {
      params.append('include_audit_logs', 'true');
    }
    
    const queryString = params.toString();
    const endpoint = `/teams/export/users/${queryString ? `?${queryString}` : ''}`;
    
    console.log('Export users endpoint:', endpoint);
    console.log('Export users options:', options);
    
    try {
      return await apiClient.get<UsersExportResponse>(endpoint);
    } catch (error) {
      console.error('Users export error:', error);
      throw error;
    }
  }

  /**
   * Export complete system data with all related information
   */
  async exportSystem(options: ExportOptions = {}): Promise<SystemExportResponse> {
    const params = new URLSearchParams();
    
    // Set export type to system
    params.append('export_type', 'system');
    
    // Don't send format to API - it always returns JSON
    if (options.includeInactive) {
      params.append('include_inactive', 'true');
    }
    
    if (options.includeAuditLogs) {
      params.append('include_audit_logs', 'true');
    }
    
    const queryString = params.toString();
    const endpoint = `/teams/export/users/${queryString ? `?${queryString}` : ''}`;
    
    console.log('Export system endpoint:', endpoint);
    console.log('Export system options:', options);
    
    try {
      const result = await apiClient.get<SystemExportResponse>(endpoint);
      console.log('Export system result:', result);
      return result;
    } catch (error) {
      console.error('System export error:', error);
      throw error;
    }
  }


  /**
   * Helper function to trigger file download
   */
  downloadFile(blob: Blob, filename: string): void {
    console.log('Starting file download:', { filename, blobSize: blob.size, blobType: blob.type });
    
    const url = window.URL.createObjectURL(blob);
    console.log('Created object URL:', url);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    console.log('Created download link:', { href: link.href, download: link.download });
    
    document.body.appendChild(link);
    console.log('Link added to DOM, clicking...');
    
    link.click();
    console.log('Link clicked');
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('File download process completed');
  }

  /**
   * Export teams and trigger download
   */
  async exportAndDownloadTeams(options: ExportOptions = {}): Promise<void> {
    try {
      console.log('Starting teams export and download...', options);
      const data = await this.exportTeams(options);
      console.log('Teams data received:', data);
      
      const format = options.format || 'excel';
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `teams_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      console.log('Creating download file:', { format, extension, filename });
      
      // Convert JSON response to the requested format
      if (format === 'csv') {
        const csvContent = this.convertToCSV(data);
        console.log('CSV content generated:', csvContent.substring(0, 200) + '...');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename);
      } else {
        // For Excel, convert JSON to CSV and download as CSV (since we don't have xlsx library)
        // In a real implementation, you would use a library like 'xlsx' to create proper Excel files
        const csvContent = this.convertToCSV(data);
        console.log('Excel content generated (as CSV):', csvContent.substring(0, 200) + '...');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename.replace('.xlsx', '.csv'));
      }
      
      console.log('Teams export and download completed');
    } catch (error) {
      console.error('Failed to export teams:', error);
      throw error;
    }
  }

  /**
   * Export users and trigger download
   */
  async exportAndDownloadUsers(options: ExportOptions = {}): Promise<void> {
    try {
      console.log('Starting users export and download...', options);
      const data = await this.exportUsers(options);
      console.log('Users data received:', data);
      
      const format = options.format || 'excel';
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `users_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      console.log('Creating download file:', { format, extension, filename });
      
      // Convert JSON response to the requested format
      if (format === 'csv') {
        const csvContent = this.convertToCSV(data);
        console.log('CSV content generated:', csvContent.substring(0, 200) + '...');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename);
      } else {
        // For Excel, convert JSON to CSV and download as CSV (since we don't have xlsx library)
        // In a real implementation, you would use a library like 'xlsx' to create proper Excel files
        const csvContent = this.convertToCSV(data);
        console.log('Excel content generated (as CSV):', csvContent.substring(0, 200) + '...');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename.replace('.xlsx', '.csv'));
      }
      
      console.log('Users export and download completed');
    } catch (error) {
      console.error('Failed to export users:', error);
      throw error;
    }
  }

  /**
   * Export complete system and trigger download
   */
  async exportAndDownloadSystem(options: ExportOptions = {}): Promise<void> {
    try {
      console.log('Starting system export and download...', options);
      const data = await this.exportSystem(options);
      console.log('System data received:', data);
      
      const format = options.format || 'excel';
      const extension = format === 'excel' ? 'xlsx' : 'csv';
      const filename = `system_export_${new Date().toISOString().split('T')[0]}.${extension}`;
      
      console.log('Creating download file:', { format, extension, filename });
      
      // Convert JSON response to the requested format
      if (format === 'csv') {
        const csvContent = this.convertToCSV(data);
        console.log('CSV content generated:', csvContent.substring(0, 200) + '...');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename);
      } else {
        // For Excel, convert JSON to CSV and download as CSV (since we don't have xlsx library)
        // In a real implementation, you would use a library like 'xlsx' to create proper Excel files
        const csvContent = this.convertToCSV(data);
        console.log('Excel content generated (as CSV):', csvContent.substring(0, 200) + '...');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, filename.replace('.xlsx', '.csv'));
      }
      
      console.log('System export and download completed');
    } catch (error) {
      console.error('Failed to export system:', error);
      throw error;
    }
  }

  /**
   * Convert JSON data to CSV format
   */
  convertToCSV(data: any): string {
    if (!data || !data.data) {
      return '';
    }

    // Handle different export types
    if (data.data.teams && data.data.users) {
      // System export - create multiple CSV sections
      return this.convertSystemDataToCSV(data);
    } else if (data.data.teams) {
      // Teams export
      return this.convertTeamsToCSV(data.data.teams);
    } else if (data.data.users) {
      // Users export
      return this.convertUsersToCSV(data.data.users);
    }

    return '';
  }

  /**
   * Convert teams data to CSV
   */
  private convertTeamsToCSV(teams: any[]): string {
    if (!teams || teams.length === 0) return '';

    const headers = [
      'Team ID', 'Name', 'Description', 'Max Members', 'Is Active', 
      'Created At', 'Updated At', 'Created By Email', 'Created By Username',
      'Member Count', 'Invitation Count', 'Request Count'
    ];

    const rows = teams.map(team => [
      team.team_id || '',
      team.name || '',
      team.description || '',
      team.max_members || '',
      team.is_active ? 'Yes' : 'No',
      team.created_at || '',
      team.updated_at || '',
      team.created_by?.email || '',
      team.created_by?.username || '',
      team.members?.length || 0,
      team.invitations?.length || 0,
      team.requests?.length || 0
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert users data to CSV
   */
  private convertUsersToCSV(users: any[]): string {
    if (!users || users.length === 0) return '';

    const headers = [
      'User ID', 'Email', 'Username', 'First Name', 'Last Name', 'Role',
      'Is Active', 'Is Staff', 'Is Superuser', 'Date Joined', 'Last Login',
      'Institution', 'Department', 'Team Memberships Count', 'Event Registrations Count',
      'Audit Logs Count', 'Team Names', 'Event Names'
    ];

    const rows = users.map(user => {
      // Extract team names
      const teamNames = user.team_memberships?.map((membership: any) => 
        membership.team?.name || ''
      ).filter(Boolean).join('; ') || '';

      // Extract event names
      const eventNames = user.event_registrations?.map((registration: any) => 
        registration.event?.name || ''
      ).filter(Boolean).join('; ') || '';

      return [
        user.user_id || '',
        user.email || '',
        user.username || '',
        user.first_name || '',
        user.last_name || '',
        user.role || '',
        user.is_active ? 'Yes' : 'No',
        user.is_staff ? 'Yes' : 'No',
        user.is_superuser ? 'Yes' : 'No',
        user.date_joined || '',
        user.last_login || '',
        user.profile?.institution || '',
        user.profile?.department || '',
        user.team_memberships?.length || 0,
        user.event_registrations?.length || 0,
        user.audit_logs?.length || 0,
        teamNames,
        eventNames
      ];
    });

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert system data to CSV (multiple sections)
   */
  private convertSystemDataToCSV(data: any): string {
    let csv = '';

    // Add export info
    csv += 'EXPORT INFORMATION\n';
    csv += `Export Type,${data.data.export_info?.export_type || 'system'}\n`;
    csv += `Export Timestamp,${data.data.export_timestamp || new Date().toISOString()}\n`;
    csv += `Total Users,${data.data.total_users || 0}\n`;
    csv += `Total Teams,${data.data.total_teams || 0}\n\n`;

    // Add summary statistics
    csv += 'SUMMARY STATISTICS\n';
    csv += `Total Users,${data.data.total_users || 0}\n`;
    csv += `Total Teams,${data.data.total_teams || 0}\n`;
    csv += `Active Users,${data.data.users?.filter((u: any) => u.is_active).length || 0}\n`;
    csv += `Staff Users,${data.data.users?.filter((u: any) => u.is_staff).length || 0}\n`;
    csv += `Superusers,${data.data.users?.filter((u: any) => u.is_superuser).length || 0}\n\n`;

    // Add users data
    if (data.data.users && data.data.users.length > 0) {
      csv += 'USERS DATA\n';
      csv += this.convertUsersToCSV(data.data.users);
      csv += '\n\n';
    }

    // Add teams data if available
    if (data.data.teams && data.data.teams.length > 0) {
      csv += 'TEAMS DATA\n';
      csv += this.convertTeamsToCSV(data.data.teams);
      csv += '\n\n';
    }

    // Add events data if available
    if (data.data.events && data.data.events.length > 0) {
      csv += 'EVENTS DATA\n';
      csv += this.convertEventsToCSV(data.data.events);
      csv += '\n\n';
    }

    // Add challenges data if available
    if (data.data.challenges && data.data.challenges.length > 0) {
      csv += 'CHALLENGES DATA\n';
      csv += this.convertChallengesToCSV(data.data.challenges);
      csv += '\n\n';
    }

    return csv;
  }

  /**
   * Convert events data to CSV
   */
  private convertEventsToCSV(events: any[]): string {
    if (!events || events.length === 0) return '';

    const headers = [
      'Event ID', 'Event Code', 'Name', 'Description', 'Starts At', 'Ends At',
      'Created By Email', 'Created By Username', 'Is Active'
    ];

    const rows = events.map(event => [
      event.event_id || '',
      event.event_code || '',
      event.name || '',
      event.description || '',
      event.starts_at || '',
      event.ends_at || '',
      event.created_by?.email || '',
      event.created_by?.username || '',
      event.is_active ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert challenges data to CSV
   */
  private convertChallengesToCSV(challenges: any[]): string {
    if (!challenges || challenges.length === 0) return '';

    const headers = [
      'Challenge ID', 'Title', 'Description', 'Category', 'Difficulty',
      'Points', 'Is Active', 'Created At', 'Updated At'
    ];

    const rows = challenges.map(challenge => [
      challenge.challenge_id || '',
      challenge.title || '',
      challenge.description || '',
      challenge.category || '',
      challenge.difficulty || '',
      challenge.points || 0,
      challenge.is_active ? 'Yes' : 'No',
      challenge.created_at || '',
      challenge.updated_at || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert JSON data to Excel format (simplified version)
   * In a real implementation, you would use a library like 'xlsx'
   */
  convertToExcel(data: any, filename: string): void {
    // This is a placeholder - in a real implementation, you would:
    // 1. Use a library like 'xlsx' to convert JSON to Excel
    // 2. Create multiple sheets for different data types
    // 3. Format the data appropriately
    
    console.log('Converting to Excel:', { data, filename });
    
    // For now, convert to CSV and download
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadFile(blob, filename.replace('.xlsx', '.csv'));
  }
}

// Export singleton instance
export const adminExportAPI = new AdminExportAPI();
