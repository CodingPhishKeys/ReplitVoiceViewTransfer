
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
      "Reading", "Ireland", "London", "Jersey", "Isle of Man", 
      "Mann Island", "Guernsey", "Zurich", "Amsterdam"
    ];
    for (const name of northSites) {
      await storage.createSite({ name, region: "North", code: name.substring(0, 3).toUpperCase() });
    }

    // East Sites
    const eastSites = ["Mumbai", "Mauritius"];
    for (const name of eastSites) {
      await storage.createSite({ name, region: "East", code: name.substring(0, 3).toUpperCase() });
    }

    // West Sites
    const westSites = ["New York"];
    for (const name of westSites) {
      await storage.createSite({ name, region: "West", code: name.substring(0, 3).toUpperCase() });
    }

    // South Sites
    const southSites = [
      "Sandton", "Pretoria", "Cape Town", "Tyger Valley", "Stellenbosch",
      "Paarl", "George", "Knysna", "East London", "Port Elizabeth",
      "Durban", "Pietermaritzburg", "Bloemfontein", "Nelspruit"
    ];
    for (const name of southSites) {
      await storage.createSite({ name, region: "South", code: name.substring(0, 3).toUpperCase() });
    }

    console.log("Database seeded!");
  }
}
