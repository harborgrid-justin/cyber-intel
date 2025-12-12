
import { z } from 'zod';

/**
 * Common validation schemas used across the API
 */

// Pagination schema
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

// Search schema
export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    fields: z.string().optional(),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  }),
});

// Filter schema
export const filterSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    severity: z.string().optional(),
    priority: z.string().optional(),
    assignedTo: z.string().optional(),
    createdBy: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    tags: z.string().optional(),
  }),
});

// Bulk operation schema
export const bulkIdsSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one ID is required').max(100, 'Maximum 100 IDs allowed'),
  }),
});

// Bulk delete schema
export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one ID is required').max(100, 'Maximum 100 IDs allowed'),
    permanent: z.boolean().optional().default(false),
  }),
});

// Export schema
export const exportSchema = z.object({
  query: z.object({
    format: z.enum(['csv', 'json', 'pdf']),
    fields: z.string().optional(),
    filters: z.string().optional(),
  }),
});

// ID parameter schema
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

// Date range schema
export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().datetime({ message: 'Invalid start date format' }),
    endDate: z.string().datetime({ message: 'Invalid end date format' }),
  }),
});
