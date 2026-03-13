import { z } from 'zod';
import { 
  insertSiteSchema, 
  insertSiteInfoSchema,
  insertConnectivitySchema, 
  insertServiceSchema, 
  insertTelephonySchema, 
  insertDiagramSchema,
  sites,
  siteInfo,
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
          info: typeof siteInfo.$inferSelect[],
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
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sites/:id',
      input: insertSiteSchema,
      responses: {
        200: z.custom<typeof sites.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sites/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  info: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/info',
      input: insertSiteInfoSchema.omit({ siteId: true }),
      responses: {
        201: z.custom<typeof siteInfo.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/info/:id',
      input: insertSiteInfoSchema.omit({ siteId: true }),
      responses: {
        200: z.custom<typeof siteInfo.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/info/:id',
      responses: {
        204: z.void(),
      }
    }
  },
  connectivity: {
    update: { 
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
    update: {
      method: 'PUT' as const,
      path: '/api/services/:id',
      input: insertServiceSchema.omit({ siteId: true }),
      responses: {
        200: z.custom<typeof siteServices.$inferSelect>(),
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
    byPlatform: {
      method: 'GET' as const,
      path: '/api/telephony/platform/:platform',
      responses: {
        200: z.array(z.custom<typeof siteTelephony.$inferSelect & { site: typeof sites.$inferSelect }>()),
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/telephony',
      input: insertTelephonySchema.omit({ siteId: true }),
      responses: {
        201: z.custom<typeof siteTelephony.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/telephony/:id',
      input: insertTelephonySchema.omit({ siteId: true }),
      responses: {
        200: z.custom<typeof siteTelephony.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/telephony/:id',
      responses: {
        204: z.void(),
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
    },
    update: {
      method: 'PUT' as const,
      path: '/api/diagrams/:id',
      input: insertDiagramSchema.omit({ siteId: true }),
      responses: {
        200: z.custom<typeof siteDiagrams.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/diagrams/:id',
      responses: {
        204: z.void(),
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
