/**
 * API data mappers
 * Convert between backend API data and frontend data structures
 */

import { User, Team, TeamMember, ChallengeDetail, ChallengeQuestion, ChallengeArtifact } from '@/lib/types';
import { BackendUser, BackendTeam, BackendTeamMember } from '@/lib/types';

/**
 * Convert backend user to frontend user format
 */
export function mapBackendUserToUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    name: backendUser.full_name,
    initials: getInitials(backendUser.first_name, backendUser.last_name),
    role: mapBackendRoleToFrontendRole(backendUser.role),
    organization: backendUser.profile?.institution || 'Unknown',
    // Preserve events data if it exists
    events: (backendUser as any).events || [],
    total_events: (backendUser as any).total_events || 0,
    // Preserve team data if it exists
    current_team: (backendUser as any).current_team || null
  };
}

/**
 * Convert backend team to frontend team format
 */
export function mapBackendTeamToTeam(backendTeam: BackendTeam): Team {
  return {
    id: backendTeam.id,
    name: backendTeam.name,
    size: backendTeam.current_size,
    members: backendTeam.members ? backendTeam.members.map(mapBackendTeamMemberToTeamMember) : [],
    isLeader: false, // This would need to be determined based on current user
    // Use same keys as API response
    description: backendTeam.description,
    max_size: backendTeam.max_size,
    min_size: backendTeam.min_size,
    invite_code: backendTeam.invite_code,
    is_invite_only: backendTeam.is_invite_only,
    status: backendTeam.status,
    current_size: backendTeam.current_size,
    is_full: backendTeam.is_full,
    can_join: backendTeam.can_join,
    leader: backendTeam.leader,
    leader_name: backendTeam.leader_name,
    created_at: backendTeam.created_at,
    updated_at: backendTeam.updated_at,
    // UI-specific properties (these might need to be calculated or provided separately)
    memberCount: backendTeam.current_size,
    rank: 'N/A', // This would need to be fetched from a separate API or calculated
    isUserTeam: false, // This would need to be determined based on current user
    // Mock member data for UI display (if members array is empty)
    mockMembers: backendTeam.members && backendTeam.members.length > 0 ? [] : [
      { id: '1', initials: 'TM', color: 'bg-team-purple' },
      { id: '2', initials: 'TM', color: 'bg-team-blue' },
      { id: '3', initials: 'TM', color: 'bg-team-green' },
      { id: '4', initials: 'TM', color: 'bg-team-yellow' }
    ].slice(0, backendTeam.current_size)
  };
}

/**
 * Convert backend team member to frontend team member format
 */
export function mapBackendTeamMemberToTeamMember(backendMember: BackendTeamMember): TeamMember {
  return {
    id: backendMember.id,
    name: backendMember.user.full_name,
    initials: getInitials(backendMember.user.first_name, backendMember.user.last_name),
    role: mapBackendTeamRoleToFrontendRole(backendMember.role)
  };
}

/**
 * Get initials from first and last name
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Map backend role to frontend role
 */
function mapBackendRoleToFrontendRole(backendRole: string): 'admin' | 'student' {
  switch (backendRole.toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'instructor':
    case 'user':
    default:
      return 'student';
  }
}

/**
 * Map backend team role to frontend team role
 */
function mapBackendTeamRoleToFrontendRole(backendRole: string): 'leader' | 'member' {
  return backendRole.toLowerCase() === 'leader' ? 'leader' : 'member';
}

/**
 * Convert frontend user to backend user format (for updates)
 */
export function mapUserToBackendUser(user: Partial<User>): Partial<BackendUser> {
  return {
    first_name: user.name?.split(' ')[0] || '',
    last_name: user.name?.split(' ').slice(1).join(' ') || '',
    profile: {
      bio: null,
      avatar: null,
      phone: null,
      institution: user.organization || null,
      department: null,
      student_id: null,
      email_notifications: true,
      push_notifications: true
    }
  };
}

/**
 * Convert frontend team to backend team format (for creation/updates)
 */
export function mapTeamToBackendTeam(team: Partial<Team>): Partial<BackendTeam> {
  return {
    name: team.name || '',
    description: '', // Frontend doesn't have description, so empty
    max_size: team.size || 4,
    min_size: 1,
    is_invite_only: false
  };
}

/**
 * Check if user is team leader
 */
export function isTeamLeader(team: BackendTeam, userId: string): boolean {
  return team.leader === userId;
}

/**
 * Get user's role in team
 */
export function getUserTeamRole(team: BackendTeam, userId: string): 'leader' | 'member' | null {
  const member = team.members?.find(m => m.user_id === userId);
  return member ? (member.is_leader ? 'leader' : 'member') : null;
}

/**
 * Check if user can join team
 */
export function canUserJoinTeam(team: BackendTeam, userId: string): boolean {
  // User can't join if already a member
  if (team.members?.some(m => m.user_id === userId)) {
    return false;
  }
  
  // User can't join if team is full
  if (team.is_full) {
    return false;
  }
  
  // User can't join if team is not active
  if (team.status !== 'active') {
    return false;
  }
  
  return team.can_join;
}

/**
 * Format team member count display
 */
export function formatTeamSize(team: BackendTeam): string {
  return `${team.current_size}/${team.max_size}`;
}

/**
 * Format team status for display
 */
export function formatTeamStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
}

/**
 * Format user role for display
 */
export function formatUserRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrator';
    case 'instructor':
      return 'Instructor';
    case 'user':
      return 'Student';
    default:
      return role;
  }
}

/**
 * Format user status for display
 */
export function formatUserStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'inactive':
      return 'Inactive';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
}

/**
 * Map backend challenge detail response to frontend ChallengeDetail format
 */
export function mapBackendChallengeToFrontend(backendChallenge: any): ChallengeDetail {
  const questions: ChallengeQuestion[] = [];

  // Map flag questions (CTF questions)
  if (backendChallenge.flag_questions && Array.isArray(backendChallenge.flag_questions)) {
    backendChallenge.flag_questions.forEach((flagQ: any) => {
      questions.push({
        id: flagQ.id,
        title: flagQ.question_text,
        description: flagQ.context || '',
        points: Number(flagQ.points) || 0,
        type: 'flag',
        flagFormat: flagQ.flag_format,
        whyThisMatters: flagQ.why_matters,
        status: 'Not attempted',
        hints: flagQ.hints && Array.isArray(flagQ.hints) ? flagQ.hints.map((hint: any) => ({
          id: hint.id,
          text: hint.hint_text,
          cost: Number(hint.cost) || 0,
          maxUses: 1
        })) : [],
        attempts: 0,
        hintsUsed: 0,
        solved: false
      });
    });
  }

  // Map MCQ questions
  if (backendChallenge.mcq_questions && Array.isArray(backendChallenge.mcq_questions)) {
    backendChallenge.mcq_questions.forEach((mcqQ: any) => {
      questions.push({
        id: mcqQ.id,
        title: mcqQ.question_text,
        description: '',
        points: Number(mcqQ.points) || 0,
        type: 'mcq',
        explanation: mcqQ.explanation,
        status: 'Not attempted',
        options: mcqQ.options && Array.isArray(mcqQ.options) ? mcqQ.options.map((opt: any) => ({
          id: opt.id,
          text: opt.option_text,
          isCorrect: false // Don't send correct answer to frontend
        })) : [],
        attempts: 0,
        hintsUsed: 0,
        solved: false
      });
    });
  }

  // Map fill-in-the-blank questions
  if (backendChallenge.fillblank_questions && Array.isArray(backendChallenge.fillblank_questions)) {
    backendChallenge.fillblank_questions.forEach((fibQ: any) => {
      // Group accepted answers by blank_index
      const blanksMap: { [key: number]: string[] } = {};
      if (fibQ.accepted_answers && Array.isArray(fibQ.accepted_answers)) {
        fibQ.accepted_answers.forEach((ans: any) => {
          const blankIndex = ans.blank_index || 1;
          if (!blanksMap[blankIndex]) {
            blanksMap[blankIndex] = [];
          }
          // Note: The API doesn't seem to include the actual answer text, just blank_index
          // You might need to adjust this based on your actual API structure
        });
      }

      questions.push({
        id: fibQ.id,
        title: fibQ.question_text,
        description: '',
        points: Number(fibQ.points) || 0,
        type: 'fib',
        explanation: fibQ.explanation,
        status: 'Not attempted',
        blanks: Object.keys(blanksMap).map((blankIndex) => ({
          id: `blank-${blankIndex}`,
          label: `Blank ${blankIndex}`,
          answer: '', // Don't send correct answer to frontend
          variations: []
        })),
        attempts: 0,
        hintsUsed: 0,
        solved: false
      });
    });
  }

  // Map artifacts
  const artifacts: ChallengeArtifact[] = backendChallenge.artifacts && Array.isArray(backendChallenge.artifacts)
    ? backendChallenge.artifacts.map((art: any) => ({
        id: art.id,
        name: art.name || art.file_name || 'Artifact',
        description: art.description || '',
        type: art.type || 'file'
      }))
    : [];

  return {
    tags: false, // Default value for tags property
    id: backendChallenge.id,
    title: backendChallenge.title,
    description: backendChallenge.description || '',
    category: backendChallenge.category,
    difficulty: backendChallenge.difficulty,
    estimatedTime: backendChallenge.time_estimate_minutes 
      ? `${backendChallenge.time_estimate_minutes} minutes` 
      : 'N/A',
    totalPoints: backendChallenge.total_points || backendChallenge.calculated_points || 0,
    timeSpent: '00:00:00',
    scenario: backendChallenge.scenario || '',
    contextNotes: backendChallenge.context_note 
      ? [backendChallenge.context_note] 
      : [],
    artifacts,
    questions,
    tools: [], // Tools are not in the API response - empty array with correct type
    status: backendChallenge.status || 'Not attempted'
  };
}
