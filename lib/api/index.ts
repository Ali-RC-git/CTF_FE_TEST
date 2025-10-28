/**
 * API module exports
 * Centralized exports for all API services
 */

export { apiClient, TokenManager, APIError } from './client';
export { authAPI } from './auth';
export { teamsAPI } from './teams';
export { challengesAPI } from './challenges';
export { usersAPI } from './users';
export { eventsAPI } from './events';
export { systemSettingsAPI } from './system-settings';

// Re-export types
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  EnableMFARequest,
  User,
  UsersListResponse,
  AuditLog,
  AuditLogsResponse,
  VerifyAccountRequest,
  VerifyAccountResponse,
  SendVerificationEmailRequest,
  SendVerificationEmailResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse
} from './auth';

export type {
  Team,
  TeamMember,
  TeamsListResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  JoinTeamRequest,
  JoinTeamResponse,
  TeamStats,
  TeamInvitation,
  TeamInvitationsResponse,
  SendInvitationRequest,
  RespondToInvitationRequest,
  UpdateInvitationRequest,
  AvailableTeam,
  RequestStats,
  AdminDashboardStats,
  TeamRequest
} from './teams';

export type {
  User as AdminUser,
  UsersListResponse as AdminUsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  BulkUpdateRequest,
  UserTeam
} from './users';

export type {
  ChallengeListResponse,
  StartChallengeResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  UserProgressResponse,
  CreateChallengeRequest,
  UpdateChallengeRequest,
  BulkUpdateRequest as ChallengeBulkUpdateRequest,
  ChallengeSubmissionsResponse,
  ChallengeAnalytics,
} from './challenges';

// Re-export Challenge type from types.ts for convenience
export type { Challenge, ChallengeDetail, ChallengeUserProgress } from '@/lib/types';

export type {
  EventData,
  Participant,
  EventStats,
  EventResponse,
  UpdateEventRequest
} from './events';

export type {
  SystemSettings,
  PasswordPolicyOption,
  SessionTimeoutOption,
  PublicSettings,
  UpdateSystemSettingsRequest
} from './system-settings';
