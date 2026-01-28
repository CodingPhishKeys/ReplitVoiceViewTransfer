
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
    
    // London Site (North)
    const london = await storage.createSite({
      name: "London",
      region: "North",
      description: "Primary HQ for North region",
      code: "LON"
    });

    await storage.updateConnectivity(london.id, {
      linkType: "Fiber 1Gbps",
      ispName: "British Telecom",
      ispContact: "support@bt.com | +44 800 123 456",
      localItContact: "John Smith | ext 1001"
    });

    await storage.createService({ siteId: london.id, serviceType: "Switchboard", details: "Main Reception Console", status: "Active" });
    await storage.createService({ siteId: london.id, serviceType: "Recording", details: "NICE Engage 6.5", status: "Active" });
    await storage.createService({ siteId: london.id, serviceType: "TMS", details: "Proteus", status: "Active" });

    await storage.createTelephony({
      siteId: london.id,
      platform: "Microsoft Teams",
      numberRanges: ["+44 20 7123 0000 - 0999", "+44 20 7123 5000 - 5099"]
    });
    
    await storage.createTelephony({
      siteId: london.id,
      platform: "Cisco",
      numberRanges: ["+44 20 7999 1000 - 1099"]
    });

    // Cape Town Site (South)
    const capeTown = await storage.createSite({
      name: "Cape Town",
      region: "South",
      description: "Regional Office",
      code: "CPT"
    });

    await storage.updateConnectivity(capeTown.id, {
      linkType: "Microwave",
      ispName: "Vodacom",
      ispContact: "support@vodacom.co.za",
      localItContact: "Sarah Jones"
    });
    
    await storage.createTelephony({
      siteId: capeTown.id,
      platform: "Microsoft Teams",
      numberRanges: ["+27 21 418 0000 - 0999"]
    });

     // Dubai (East)
     const dubai = await storage.createSite({
      name: "Dubai",
      region: "East",
      description: "Middle East Hub",
      code: "DXB"
    });
    
    await storage.createTelephony({
      siteId: dubai.id,
      platform: "Avaya",
      numberRanges: ["+971 4 123 4567"]
    });

     // New York (West)
     const ny = await storage.createSite({
      name: "New York",
      region: "West",
      description: "US Operations",
      code: "NYC"
    });

    console.log("Database seeded!");
  }
}
