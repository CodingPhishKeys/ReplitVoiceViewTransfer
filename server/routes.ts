
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Sites ===
  app.get(api.sites.list.path, async (req, res) => {
    const sites = await storage.getSites();
    res.json(sites);
  });

  app.get(api.sites.get.path, async (req, res) => {
    const site = await storage.getSiteWithDetails(Number(req.params.id));
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(site);
  });

  app.put(api.sites.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const site = await storage.getSite(id);
      if (!site) return res.status(404).json({ message: "Site not found" });
      const input = api.sites.update.input.parse(req.body);
      const updated = await storage.updateSite(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.sites.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const site = await storage.getSite(id);
    if (!site) return res.status(404).json({ message: "Site not found" });
    await storage.deleteSite(id);
    res.status(204).send();
  });

  app.post(api.sites.create.path, async (req, res) => {
    try {
      const input = api.sites.create.input.parse(req.body);
      const site = await storage.createSite(input);
      res.status(201).json(site);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Connectivity ===
  app.post(api.connectivity.update.path, async (req, res) => {
    try {
      const input = api.connectivity.update.input.parse(req.body);
      const siteId = Number(req.params.siteId);
      const connectivity = await storage.updateConnectivity(siteId, input);
      res.json(connectivity);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Services ===
  app.post(api.services.create.path, async (req, res) => {
    try {
      const input = api.services.create.input.parse(req.body);
      const siteId = Number(req.params.siteId);
      const service = await storage.createService({ ...input, siteId });
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.services.update.path, async (req, res) => {
    try {
      const input = api.services.update.input.parse(req.body);
      const service = await storage.updateService(Number(req.params.id), input);
      res.json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.services.delete.path, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.status(204).send();
  });

  // === Telephony ===
  app.get(api.telephony.byPlatform.path, async (req, res) => {
    const platform = decodeURIComponent(req.params.platform);
    const records = await storage.getTelephonyByPlatform(platform);
    res.json(records);
  });

  app.post(api.telephony.create.path, async (req, res) => {
    try {
      const input = api.telephony.create.input.parse(req.body);
      const siteId = Number(req.params.siteId);
      const telephony = await storage.createTelephony({ ...input, siteId });
      res.status(201).json(telephony);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.telephony.update.path, async (req, res) => {
    try {
      const input = api.telephony.update.input.parse(req.body);
      const telephony = await storage.updateTelephony(Number(req.params.id), input);
      res.json(telephony);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.telephony.delete.path, async (req, res) => {
    await storage.deleteTelephony(Number(req.params.id));
    res.status(204).send();
  });

  // === Diagrams ===
  app.post(api.diagrams.create.path, async (req, res) => {
    try {
      const input = api.diagrams.create.input.parse(req.body);
      const siteId = Number(req.params.siteId);
      const diagram = await storage.createDiagram({ ...input, siteId });
      res.status(201).json(diagram);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.diagrams.update.path, async (req, res) => {
    try {
      const input = api.diagrams.update.input.parse(req.body);
      const diagram = await storage.updateDiagram(Number(req.params.id), input);
      res.json(diagram);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.diagrams.delete.path, async (req, res) => {
    await storage.deleteDiagram(Number(req.params.id));
    res.status(204).send();
  });

  // === Info ===
  app.post(api.info.create.path, async (req, res) => {
    try {
      const input = api.info.create.input.parse(req.body);
      const siteId = Number(req.params.siteId);
      const info = await storage.createSiteInfo({ ...input, siteId });
      res.status(201).json(info);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.info.update.path, async (req, res) => {
    try {
      const input = api.info.update.input.parse(req.body);
      const info = await storage.updateSiteInfo(Number(req.params.id), input);
      res.json(info);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.info.delete.path, async (req, res) => {
    await storage.deleteSiteInfo(Number(req.params.id));
    res.status(204).send();
  });


  // === Documents ===
  app.post(api.documents.create.path, async (req, res) => {
    try {
      const input = api.documents.create.input.parse(req.body);
      const siteId = Number(req.params.siteId);
      const doc = await storage.createDocument({ ...input, siteId });
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.documents.update.path, async (req, res) => {
    try {
      const input = api.documents.update.input.parse(req.body);
      const doc = await storage.updateDocument(Number(req.params.id), input);
      res.json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.documents.delete.path, async (req, res) => {
    await storage.deleteDocument(Number(req.params.id));
    res.status(204).send();
  });

  // === Phone Numbers ===
  app.get('/api/phone-numbers', async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(10, Number(req.query.limit) || 50));
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const platform = typeof req.query.platform === 'string' ? req.query.platform : undefined;
    const siteId = req.query.siteId ? Number(req.query.siteId) : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const result = await storage.getPhoneNumbers({ page, limit, search, platform, siteId, status });
    res.json({
      data: result.data,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    });
  });

  app.post('/api/phone-numbers', async (req, res) => {
    try {
      const { insertPhoneNumberSchema } = await import('@shared/schema');
      const input = insertPhoneNumberSchema.parse(req.body);
      const num = await storage.createPhoneNumber(input);
      res.status(201).json(num);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post('/api/phone-numbers/bulk', async (req, res) => {
    try {
      const rows = z.array(z.object({
        number: z.string(),
        platform: z.string().optional(),
        siteId: z.number().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
      })).parse(req.body);
      const result = await storage.bulkCreatePhoneNumbers(rows.map(r => ({
        number: r.number,
        platform: r.platform ?? null,
        siteId: r.siteId ?? null,
        description: r.description ?? null,
        status: r.status ?? 'Active',
      })));
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put('/api/phone-numbers/:id', async (req, res) => {
    try {
      const { insertPhoneNumberSchema } = await import('@shared/schema');
      const input = insertPhoneNumberSchema.partial().parse(req.body);
      const num = await storage.updatePhoneNumber(Number(req.params.id), input);
      res.json(num);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete('/api/phone-numbers/:id', async (req, res) => {
    await storage.deletePhoneNumber(Number(req.params.id));
    res.status(204).send();
  });

  app.delete('/api/phone-numbers', async (req, res) => {
    const count = await storage.deleteAllPhoneNumbers();
    res.json({ deleted: count });
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingSites = await storage.getSites();
  if (existingSites.length === 0) {
    console.log("Seeding database...");
    
    // North Sites
    const northSites = [
      { name: "Reading", region: "North" as const },
      { name: "Ireland", region: "North" as const },
      { name: "London", region: "North" as const },
      { name: "Jersey", region: "North" as const },
      { name: "Isle of Man", region: "North" as const },
      { name: "Mann Island", region: "North" as const },
      { name: "Guernsey", region: "North" as const },
      { name: "Zurich", region: "North" as const },
      { name: "Amsterdam", region: "North" as const }
    ];
    for (const site of northSites) {
      await storage.createSite({ ...site, code: site.name.substring(0, 3).toUpperCase() });
    }

    // East Sites
    const eastSites = [
      { name: "Mumbai", region: "East" as const },
      { name: "Mauritius", region: "East" as const }
    ];
    for (const site of eastSites) {
      await storage.createSite({ ...site, code: site.name.substring(0, 3).toUpperCase() });
    }

    // West Sites
    const westSites = [
      { name: "New York", region: "West" as const }
    ];
    for (const site of westSites) {
      await storage.createSite({ ...site, code: site.name.substring(0, 3).toUpperCase() });
    }

    // South Sites
    const southSites = [
      { name: "Sandton", region: "South" as const },
      { name: "Pretoria", region: "South" as const },
      { name: "Cape Town", region: "South" as const },
      { name: "Stellenbosch", region: "South" as const },
      { name: "Paarl", region: "South" as const },
      { name: "Tyger Valley", region: "South" as const },
      { name: "Knysna", region: "South" as const },
      { name: "George", region: "South" as const },
      { name: "Port Elizabeth", region: "South" as const },
      { name: "East London", region: "South" as const },
      { name: "Durban", region: "South" as const },
      { name: "Pietermaritzburg", region: "South" as const },
      { name: "Bloemfontein", region: "South" as const },
      { name: "Nelspruit", region: "South" as const }
    ];
    for (const site of southSites) {
      await storage.createSite({ ...site, code: site.name.substring(0, 3).toUpperCase() });
    }

    console.log("Database seeded!");
  }
}
