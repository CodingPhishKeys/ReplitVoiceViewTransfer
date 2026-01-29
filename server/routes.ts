
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

  app.delete(api.services.delete.path, async (req, res) => {
    await storage.deleteService(Number(req.params.id));
    res.status(204).send();
  });

  // === Telephony ===
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
      { name: "London", region: "North" as const, description: "Address: 30 Gresham Street, London, EC2V 7QP\nMain Telephone: +44 (0) 20 7597 4000" },
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
      { name: "Sandton", region: "South" as const, description: "Address: 100 Grayston Drive, Sandown, Sandton, 2196, South Africa\nMain Telephone: +27 (11) 286 7000" },
      { name: "Pretoria", region: "South" as const, description: "Address: Cnr Atterbury and Klarinet Streets, Menlo Park, Pretoria 0081\nMain Telephone: +27 (12) 427 8300" },
      { name: "Cape Town", region: "South" as const, description: "Address: 14 Dock Road, Victoria & Alfred Waterfront, Cape Town, 8001, South Africa\nMain Telephone: +27 (21) 416 1000" },
      { name: "Stellenbosch", region: "South" as const, description: "Address: Office 401, Mill Square, 4th floor, 12 Plein Street, Stellenbosch\nMain Telephone: +27 (21) 809 0700" },
      { name: "Paarl", region: "South" as const, description: "Address: Polo Family Offices, Polo Way, Val de Vie Estate, Paarl, 7646\nMain Telephone: +27 (21) 809 0770" },
      { name: "Tyger Valley", region: "South" as const, description: "Address: Avanti Towers North Block, 4th floor, 35 Carl Cronje Drive, Tyger Falls Blvd, Bellville, 7530\nMain Telephone: +27 (21) 416 1100" },
      { name: "Knysna", region: "South" as const, description: "Address: TH24/25 Long Street Ext, Thesen Harbour Town, Knysna, 6571\nMain Telephone: +27 (44) 302 1800" },
      { name: "George", region: "South" as const, description: "Address: 27 York Street, George, 6529\nMain Telephone: +27 (44) 803 6300" },
      { name: "Port Elizabeth", region: "South" as const, description: "Address: Waterfront Business Park, Pommern Street, Humerail, Gqeberha, 6045\nMain Telephone: +27 (41) 396 6700" },
      { name: "East London", region: "South" as const, description: "Address: Cube 1, Cedar Square, Bonza Bay Road, Beacon Bay, East London, 5241\nMain Telephone: +27 (43) 709 5700" },
      { name: "Durban", region: "South" as const, description: "Address: 5 Richefond Circle, Ridgeside Office Park, Umhlanga, 4319\nMain Telephone: +27 (31) 575 4000" },
      { name: "Pietermaritzburg", region: "South" as const, description: "Address: 48 Bush Shrike Close, Victoria Country Club Estate, Montrose, Pietermartzburg, 3201\nMain Telephone: +27 (33) 264 5800" },
      { name: "Bloemfontein", region: "South" as const, description: "Address: 42 Louw Wepener Street, Dan Pienaar, Bloemfontein, 9301\nMain Telephone: +27 (51) 400 9000" },
      { name: "Nelspruit", region: "South" as const, description: "Address: De Blok, 10 Wilhelm Street, Mbombela, Ext. 4, 1201\nMain Telephone: +27 (12) 427 8300" }
    ];
    for (const site of southSites) {
      await storage.createSite({ ...site, code: site.name.substring(0, 3).toUpperCase() });
    }

    console.log("Database seeded!");
  }
}
