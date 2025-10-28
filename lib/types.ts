// Import constants for better type safety
import { USER_ROLES, CHALLENGE_STATUS, CHALLENGE_DIFFICULTY, CHALLENGE_CATEGORIES, TEAM_ROLES, QUESTION_STATUS, ARTIFACT_TYPES, SCOREBOARD_HIGHLIGHTS, TREND_DIRECTIONS, COURSE_ICONS } from './constants/app';

// Legacy User interface (for backward compatibility)
export interface User {
  id: string;
  name: string;
  initials: string;
  role: typeof USER_ROLES[keyof typeof USER_ROLES];
  organization: string;
  // Events data for navigation logic
  events?: any[];
  total_events?: number;
  // Team data for admin management
  teams?: any[];
  current_team?: {
    team_id: string;
    team_name: string;
    role: string;
  };
}

// New User interface matching backend API
export interface BackendUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  status: string;
  is_mfa_enabled: boolean;
  created_at: string;
  last_login_at: string | null;
  profile: {
    bio: string | null;
    avatar: string | null;
    phone: string | null;
    institution: string | null;
    department: string | null;
    student_id: string | null;
    email_notifications: boolean;
    push_notifications: boolean;
  };
}

export interface UserStats {
  points: number;
  challengesSolved: number;
  rank: number;
  enrolledCourses: number;
}

export interface QuestionProgress {
  id: string;
  title: string;
  difficulty: typeof CHALLENGE_DIFFICULTY[keyof typeof CHALLENGE_DIFFICULTY];
  description: string;
  progress?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface ScoreboardEntry {
  id: string;
  rank: number;
  teamName: string;
  points: number;
  trend: typeof TREND_DIRECTIONS[keyof typeof TREND_DIRECTIONS];
  highlight?: typeof SCOREBOARD_HIGHLIGHTS[keyof typeof SCOREBOARD_HIGHLIGHTS];
}

export interface QuestionProgress {
  id: string;
  title: string;
  difficulty: typeof CHALLENGE_DIFFICULTY[keyof typeof CHALLENGE_DIFFICULTY];
  description: string;
  points: number;
  status: typeof QUESTION_STATUS[keyof typeof QUESTION_STATUS];
  progress?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  icon: typeof COURSE_ICONS[keyof typeof COURSE_ICONS];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: typeof CHALLENGE_CATEGORIES[keyof typeof CHALLENGE_CATEGORIES];
  status: typeof CHALLENGE_STATUS[keyof typeof CHALLENGE_STATUS];
  points: number;
  difficulty: typeof CHALLENGE_DIFFICULTY[keyof typeof CHALLENGE_DIFFICULTY];
  solves: number;
  timeSpent?: string;
  vmAvailable?: boolean;
  vmStatus?: string;
  // User progress fields
  userProgress?: ChallengeUserProgress;
  isStarted?: boolean;
  isCompleted?: boolean;
  completedAt?: string;
  hint_cost?: number;
  point_value?: number;
  // Backend fields
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  created_by_name?: string;
  solves_count?: number;
  submissions_count?: number;
  total_questions?: number;
}

export interface ChallengeUserProgress {
  challengeId: string;
  attemptId?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  questionsAnswered: number;
  totalQuestions: number;
  pointsEarned: number;
  totalPoints: number;
  progressPercentage: number;
  lastActivityAt?: string;
  questionProgress?: {
    [questionId: string]: {
      status: 'not_attempted' | 'in_progress' | 'solved' | 'failed';
      attempts: number;
      hintsUsed: number;
      solved: boolean;
      solvedAt?: string;
    };
  };
}

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  role: typeof TEAM_ROLES[keyof typeof TEAM_ROLES];
}

// Legacy Team interface (for backward compatibility)
export interface Team {
  id: string;
  name: string;
  size: number;
  members: TeamMember[];
  isLeader?: boolean;
  // Use same keys as API response
  description?: string;
  max_size?: number;
  min_size?: number;
  invite_code?: string;
  is_invite_only?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  current_size?: number;
  is_full?: boolean;
  can_join?: boolean;
  leader?: string;
  leader_name?: string;
  created_at?: string;
  updated_at?: string;
  // UI-specific properties
  memberCount?: number;
  rank?: string;
  isUserTeam?: boolean;
  mockMembers?: Array<{ id: string; initials: string; color: string }>;
}

// New Team interface matching backend API
export interface BackendTeam {
  id: string;
  name: string;
  description: string;
  max_size: number;
  min_size: number;
  invite_code: string;
  is_invite_only: boolean;
  status: 'active' | 'inactive' | 'suspended';
  current_size: number;
  is_full: boolean;
  can_join: boolean;
  leader: string;
  leader_name: string;
  members?: BackendTeamMember[];
  created_at: string;
  updated_at: string;
}

export interface BackendTeamMember {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    status: string;
    is_mfa_enabled: boolean;
    created_at: string;
    last_login_at: string | null;
    profile: any;
  };
  user_id: string;
  role: 'leader' | 'member';
  status: 'active' | 'inactive';
  is_leader: boolean;
  joined_at: string;
  left_at: string | null;
  updated_at: string;
}

export interface JoinRequest {
  id: string;
  user: {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    status: string;
    profile: {
      institution?: string;
      department?: string;
    };
  };
  team: {
    id: string;
    name: string;
    current_size: number;
    max_size: number;
    is_full: boolean;
  };
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ChallengeArtifact {
  id: string;
  name: string;
  description: string;
  type: typeof ARTIFACT_TYPES[keyof typeof ARTIFACT_TYPES];
}

export interface ChallengeQuestion {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'flag' | 'mcq' | 'fib';
  flagFormat?: string;
  instructions?: string[];
  whyThisMatters?: string;
  status: typeof QUESTION_STATUS[keyof typeof QUESTION_STATUS];
  // For CTF/Flag questions
  correctAnswer?: string;
  // For MCQ questions
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  // For Fill in the Blank questions
  blanks?: Array<{
    id: string;
    label: string;
    answer: string;
    variations?: string[];
  }>;
  hints?: Array<{
    id: string;
    text: string;
    cost: number;
    maxUses: number;
  }>;
  // Submission tracking
  attempts?: number;
  hintsUsed?: number;
  solved?: boolean;
}

export interface ChallengeDetail {
  tags: boolean;
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: typeof CHALLENGE_DIFFICULTY[keyof typeof CHALLENGE_DIFFICULTY];
  estimatedTime: string;
  totalPoints: number;
  timeSpent: string;
  scenario: string;
  contextNotes: string[];
  artifacts: ChallengeArtifact[];
  questions: ChallengeQuestion[];
  tools: {
    id: string;
    name: string;
    icon: string;
  }[];
  status?: string;
}
