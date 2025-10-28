import { z } from "zod";
import { createDynamicPasswordSchema, createDynamicPasswordConfirmSchema } from "./utils/dynamic-validation";

// Legacy signup schema (for backward compatibility)
export const signupSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organization: z.string().min(1, "Organization name is required"),
  email: z.string().email("Invalid email address")
});
export type SignupData = z.infer<typeof signupSchema>;

// New signup schema matching backend API
export const backendSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be less than 30 characters"),
  first_name: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  password: createDynamicPasswordSchema(),
  password_confirm: createDynamicPasswordConfirmSchema(),
  role: z.enum(["user", "instructor", "admin"]).optional().default("user"),
  institution: z.string().optional(),
  department: z.string().optional()
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});
export type BackendSignupData = z.infer<typeof backendSignupSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
export type LoginData = z.infer<typeof loginSchema>;

// Team creation schema (for regular users)
export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  max_size: z.number().min(1, "Max size must be at least 1").max(10, "Max size cannot exceed 10"),
  min_size: z.number().min(1, "Min size must be at least 1").max(10, "Min size cannot exceed 10"),
  is_invite_only: z.boolean(),
  event_code: z.string().min(1, "Event code is required")
});
export type CreateTeamData = z.infer<typeof createTeamSchema>;

// Admin team creation schema (with captain_email and member_emails)
export const adminCreateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  max_size: z.number().min(1, "Max size must be at least 1").max(10, "Max size cannot exceed 10").default(4),
  min_size: z.number().min(1, "Min size must be at least 1").max(10, "Min size cannot exceed 10").default(1),
  is_invite_only: z.boolean().default(false),
  event_code: z.string().min(1, "Event code is required"),
  captain_email: z.string().email("Invalid captain email address").optional(),
  member_emails: z.array(z.string().email("Invalid member email address")).optional().default([])
});
export type AdminCreateTeamData = z.infer<typeof adminCreateTeamSchema>;

// Team update schema (without event_code requirement)
export const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  max_size: z.number().min(1, "Max size must be at least 1").max(10, "Max size cannot exceed 10").optional(),
  min_size: z.number().min(1, "Min size must be at least 1").max(10, "Min size cannot exceed 10").optional(),
  is_invite_only: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'disbanded', 'pending']).optional(),
  leader: z.string().optional(),
  event: z.string().optional()
});
export type UpdateTeamData = z.infer<typeof updateTeamSchema>;

// Join team schema
export const joinTeamSchema = z.object({
  invite_code: z.string().min(1, "Invite code is required").max(20, "Invite code must be less than 20 characters")
});
export type JoinTeamData = z.infer<typeof joinTeamSchema>;

// Update profile schema
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters").optional(),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters").optional(),
  profile: z.object({
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
    institution: z.string().max(100, "Institution must be less than 100 characters").optional(),
    department: z.string().max(100, "Department must be less than 100 characters").optional(),
    student_id: z.string().max(50, "Student ID must be less than 50 characters").optional(),
    email_notifications: z.boolean().optional(),
    push_notifications: z.boolean().optional()
  }).optional()
});
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: createDynamicPasswordSchema(),
  new_password_confirm: z.string()
}).refine((data) => data.new_password === data.new_password_confirm, {
  message: "New passwords don't match",
  path: ["new_password_confirm"],
});
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// Challenge creation schema
export const createChallengeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard", "Expert"]),
  points: z.number().optional(), // Points are now calculated automatically based on question count
  timeEstimate: z.number().min(1, "Time estimate must be at least 1 minute").max(1440, "Time estimate cannot exceed 1440 minutes (24 hours)").optional(),
  scenario: z.string().optional(),
  contextNotes: z.string().optional(),
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
  tags: z.array(z.string()).optional(), // Tags support
});

export type CreateChallengeData = z.infer<typeof createChallengeSchema>;