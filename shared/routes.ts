
import { z } from 'zod';
import { 
  insertSiteSchema, 
  insertConnectivitySchema, 
  insertServiceSchema, 
  insertTelephonySchema, 
  insertDiagramSchema,
  sites,
  siteConnectivity,
  siteServices,
  siteTelephony,
  siteDiagrams
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
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

// ============================================
// API CONTRACT
// ============================================
export const api = {
  sites: {
    list: {
      method: 'GET' as const,
      path: '/api/sites',
      responses: {
        200: z.array(z.custom<typeof sites.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sites/:id',
      responses: {
        200: z.custom<typeof sites.$inferSelect & { 
          connectivity: typeof siteConnectivity.$inferSelect | null,
          services: typeof siteServices.$inferSelect[],
          telephony: typeof siteTelephony.$inferSelect[],
          diagrams: typeof siteDiagrams.$inferSelect[]
        }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sites',
      input: insertSiteSchema,
      responses: {
        201: z.custom<typeof sites.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  // Sub-resources could be nested or flat. Flat is often easier for simple CRUD.
  connectivity: {
    update: { // Upsert semantics usually best for 1:1 relations
      method: 'POST' as const,
      path: '/api/sites/:siteId/connectivity',
      input: insertConnectivitySchema.omit({ siteId: true }),
      responses: {
        200: z.custom<typeof siteConnectivity.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  services: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/services',
      input: insertServiceSchema.omit({ siteId: true }),
      responses: {
        201: z.custom<typeof siteServices.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id',
      responses: {
        204: z.void(),
      }
    }
  },
  telephony: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/telephony',
      input: insertTelephonySchema.omit({ siteId: true }),
      responses: {
        201: z.custom<typeof siteTelephony.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  diagrams: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/diagrams',
      input: insertDiagramSchema.omit({ siteId: true }),
      responses: {
        201: z.custom<typeof siteDiagrams.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
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
