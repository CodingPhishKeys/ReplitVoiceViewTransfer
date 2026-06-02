import { z } from 'zod';
import { 
  insertSiteSchema, 
  insertSiteInfoSchema,
  insertConnectivitySchema, 
  insertServiceSchema, 
  insertTelephonySchema, 
  insertDiagramSchema,
  insertDocumentSchema,
  sites,
  siteInfo,
  siteConnectivity,
  siteServices,
  siteTelephony,
  siteDiagrams,
  siteDocuments,
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  sites: {
    list: {
      method: 'GET' as const,
      path: '/api/sites',
      responses: { 200: z.array(z.custom<typeof sites.$inferSelect>()) },
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
          diagrams: typeof siteDiagrams.$inferSelect[],
          documents: typeof siteDocuments.$inferSelect[],
        }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sites',
      input: insertSiteSchema,
      responses: { 201: z.custom<typeof sites.$inferSelect>(), 400: errorSchemas.validation },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sites/:id',
      input: insertSiteSchema,
      responses: { 200: z.custom<typeof sites.$inferSelect>(), 404: errorSchemas.notFound },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/sites/:id',
      responses: { 204: z.void(), 404: errorSchemas.notFound },
    }
  },
  info: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/info',
      input: insertSiteInfoSchema.omit({ siteId: true }),
      responses: { 201: z.custom<typeof siteInfo.$inferSelect>(), 404: errorSchemas.notFound }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/info/:id',
      input: insertSiteInfoSchema.omit({ siteId: true }),
      responses: { 200: z.custom<typeof siteInfo.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/info/:id',
      responses: { 204: z.void() }
    }
  },
  connectivity: {
    update: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/connectivity',
      input: insertConnectivitySchema.omit({ siteId: true }),
      responses: { 200: z.custom<typeof siteConnectivity.$inferSelect>(), 404: errorSchemas.notFound },
    }
  },
  services: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/services',
      input: insertServiceSchema.omit({ siteId: true }),
      responses: { 201: z.custom<typeof siteServices.$inferSelect>(), 404: errorSchemas.notFound }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/services/:id',
      input: insertServiceSchema.omit({ siteId: true }),
      responses: { 200: z.custom<typeof siteServices.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id',
      responses: { 204: z.void() }
    }
  },
  telephony: {
    byPlatform: {
      method: 'GET' as const,
      path: '/api/telephony/platform/:platform',
      responses: { 200: z.array(z.custom<typeof siteTelephony.$inferSelect & { site: typeof sites.$inferSelect }>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/telephony',
      input: insertTelephonySchema.omit({ siteId: true }),
      responses: { 201: z.custom<typeof siteTelephony.$inferSelect>(), 404: errorSchemas.notFound }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/telephony/:id',
      input: insertTelephonySchema.omit({ siteId: true }),
      responses: { 200: z.custom<typeof siteTelephony.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/telephony/:id',
      responses: { 204: z.void() }
    }
  },
  diagrams: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/diagrams',
      input: insertDiagramSchema.omit({ siteId: true }),
      responses: { 201: z.custom<typeof siteDiagrams.$inferSelect>(), 404: errorSchemas.notFound }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/diagrams/:id',
      input: insertDiagramSchema.omit({ siteId: true }),
      responses: { 200: z.custom<typeof siteDiagrams.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/diagrams/:id',
      responses: { 204: z.void() }
    }
  },
  phoneNumbers: {
    list: {
      method: 'GET' as const,
      path: '/api/phone-numbers',
      responses: { 200: z.object({
        data: z.array(z.custom<any>()),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/phone-numbers',
      responses: { 201: z.custom<any>() },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/phone-numbers/:id',
      responses: { 200: z.custom<any>() },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/phone-numbers/:id',
      responses: { 204: z.void() },
    },
    bulk: {
      method: 'POST' as const,
      path: '/api/phone-numbers/bulk',
      responses: { 200: z.object({ inserted: z.number(), skipped: z.number() }) },
    },
  },
  documents: {
    create: {
      method: 'POST' as const,
      path: '/api/sites/:siteId/documents',
      input: insertDocumentSchema.omit({ siteId: true }),
      responses: { 201: z.custom<typeof siteDocuments.$inferSelect>(), 404: errorSchemas.notFound }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/documents/:id',
      input: insertDocumentSchema.omit({ siteId: true }),
      responses: { 200: z.custom<typeof siteDocuments.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/documents/:id',
      responses: { 204: z.void() }
    }
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
