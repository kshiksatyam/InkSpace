import { z } from "zod";
import {
  MIN_TITLE_LENGTH,
  MIN_CONTENT_LENGTH,
  MAX_TAGS,
  MIN_USERNAME_LENGTH,
  MAX_BIO_LENGTH,
} from "@/lib/constants";

/**
 * Validation schema for user registration.
 * Enforces lowercase alphanumeric usernames, strong passwords, and valid emails.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username must be lowercase and contain only letters, numbers, and underscores"
    ),
});

/** Validation schema for login credentials */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/**
 * Validation schema for creating or updating a blog post.
 * Title and content have minimum lengths; tags are limited to MAX_TAGS.
 */
export const postSchema = z.object({
  title: z
    .string()
    .min(MIN_TITLE_LENGTH, `Title must be at least ${MIN_TITLE_LENGTH} characters`),
  content: z
    .string()
    .min(MIN_CONTENT_LENGTH, `Content must be at least ${MIN_CONTENT_LENGTH} characters`),
  summary: z.string().optional(),
  tags: z
    .array(z.string())
    .max(MAX_TAGS, `Maximum ${MAX_TAGS} tags allowed`),
  published: z.boolean(),
});

/** Validation schema for updating user profile settings */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH, `Username must be at least ${MIN_USERNAME_LENGTH} characters`)
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username must be lowercase and contain only letters, numbers, and underscores"
    ),
  bio: z
    .string()
    .max(MAX_BIO_LENGTH, `Bio must be at most ${MAX_BIO_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

/** Validation schema for changing password */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/** Validation schema for onboarding profile setup */
export const onboardingSchema = z.object({
  bio: z
    .string()
    .max(MAX_BIO_LENGTH, `Bio must be at most ${MAX_BIO_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  interests: z
    .array(z.string())
    .min(3, "Please select at least 3 interests"),
});

/** Validation schema for comments */
export const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be at most 1000 characters"),
});

/** Type inference helpers — use these instead of manually typing form data */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
