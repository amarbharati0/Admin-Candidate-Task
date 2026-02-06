import { z } from 'zod';
import { insertUserSchema, insertTaskSchema, insertSubmissionSchema, users, tasks, submissions } from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.void(),
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users', // Admin only
      input: z.object({ role: z.enum(['admin', 'candidate']).optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks', // Candidates see assigned, Admins see all
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect & { assignedTo?: typeof users.$inferSelect | null }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  submissions: {
    list: {
      method: 'GET' as const,
      path: '/api/submissions', // Candidates see theirs, Admins see all
      input: z.object({ taskId: z.coerce.number().optional(), candidateId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof submissions.$inferSelect & { candidate?: typeof users.$inferSelect, task?: typeof tasks.$inferSelect }>()),
      },
    },
    // Note: Create submission is handled via multipart/form-data, input validation happens manually in the handler for files
    create: {
      method: 'POST' as const,
      path: '/api/submissions', 
      responses: {
        201: z.custom<typeof submissions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/submissions/:id', // For grading/feedback
      input: z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        feedback: z.string().optional(),
        score: z.number().optional(),
      }),
      responses: {
        200: z.custom<typeof submissions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
