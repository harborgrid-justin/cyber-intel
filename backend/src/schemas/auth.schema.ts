import { z } from 'zod';

/**
 * Authentication Validation Schemas
 * Using Zod for runtime type validation and schema validation
 */

/**
 * Login schema
 */
export const loginSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters'),
    password: z.string()
      .min(1, 'Password is required')
  })
});

/**
 * Registration schema
 */
export const registerSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must not exceed 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters'),
    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password must not exceed 128 characters'),
    roleId: z.string().optional(),
    organizationId: z.string().optional()
  })
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional() // Optional because it can come from cookie
  })
});

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
  })
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string()
      .min(1, 'Reset token is required'),
    newPassword: z.string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password must not exceed 128 characters')
  })
});

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters')
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password must not exceed 128 characters')
      .optional()
  }).refine(
    (data) => {
      // If newPassword is provided, currentPassword must also be provided
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Current password is required when changing password',
      path: ['currentPassword']
    }
  )
});

/**
 * MFA disable schema
 */
export const disableMFASchema = z.object({
  body: z.object({
    password: z.string()
      .min(1, 'Password is required')
  })
});

/**
 * Status update schema (for admin use)
 */
export const statusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'DISABLED', 'LOCKED'], {
      errorMap: () => ({ message: 'Status must be ACTIVE, DISABLED, or LOCKED' })
    })
  })
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string()
      .min(1, 'Current password is required'),
    newPassword: z.string()
      .min(12, 'New password must be at least 12 characters')
      .max(128, 'Password must not exceed 128 characters'),
    confirmPassword: z.string()
      .min(1, 'Password confirmation is required')
  }).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    }
  )
});
