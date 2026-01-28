
import { db } from "./db";
import {
  sites, siteConnectivity, siteServices, siteTelephony, siteDiagrams,
  type Site, type InsertSite,
  type SiteConnectivity, type InsertConnectivity,
  type SiteService, type InsertService,
  type SiteTelephony, type InsertTelephony,
  type SiteDiagram, type InsertDiagram
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Sites
  getSites(): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  getSiteWithDetails(id: number): Promise<Site & {
    connectivity: SiteConnectivity | null,
    services: SiteService[],
    telephony: SiteTelephony[],
    diagrams: SiteDiagram[]
  } | undefined>;
  createSite(site: InsertSite): Promise<Site>;

  // Connectivity
  updateConnectivity(siteId: number, data: Omit<InsertConnectivity, "siteId">): Promise<SiteConnectivity>;
  
  // Services
  createService(service: InsertService): Promise<SiteService>;
  deleteService(id: number): Promise<void>;

  // Telephony
  createTelephony(telephony: InsertTelephony): Promise<SiteTelephony>;

  // Diagrams
  createDiagram(diagram: InsertDiagram): Promise<SiteDiagram>;
}

export class DatabaseStorage implements IStorage {
  async getSites(): Promise<Site[]> {
    return await db.select().from(sites);
  }

  async getSite(id: number): Promise<Site | undefined> {
    const [site] = await db.select().from(sites).where(eq(sites.id, id));
    return site;
  }

  async getSiteWithDetails(id: number) {
    const site = await this.getSite(id);
    if (!site) return undefined;

    const [connectivity] = await db.select().from(siteConnectivity).where(eq(siteConnectivity.siteId, id));
    const services = await db.select().from(siteServices).where(eq(siteServices.siteId, id));
    const telephony = await db.select().from(siteTelephony).where(eq(siteTelephony.siteId, id));
    const diagrams = await db.select().from(siteDiagrams).where(eq(siteDiagrams.siteId, id));

    return {
      ...site,
      connectivity: connectivity || null,
      services,
      telephony,
      diagrams
    };
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const [site] = await db.insert(sites).values(insertSite).returning();
    return site;
  }

  async updateConnectivity(siteId: number, data: Omit<InsertConnectivity, "siteId">): Promise<SiteConnectivity> {
    // Check if exists
    const existing = await db.select().from(siteConnectivity).where(eq(siteConnectivity.siteId, siteId));
    
    if (existing.length > 0) {
      const [updated] = await db.update(siteConnectivity)
        .set(data)
        .where(eq(siteConnectivity.siteId, siteId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(siteConnectivity)
        .values({ ...data, siteId })
        .returning();
      return created;
    }
  }

  async createService(service: InsertService): Promise<SiteService> {
    const [newService] = await db.insert(siteServices).values(service).returning();
    return newService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(siteServices).where(eq(siteServices.id, id));
  }

  async createTelephony(telephony: InsertTelephony): Promise<SiteTelephony> {
    const [newTelephony] = await db.insert(siteTelephony).values(telephony).returning();
    return newTelephony;
  }

  async createDiagram(diagram: InsertDiagram): Promise<SiteDiagram> {
    const [newDiagram] = await db.insert(siteDiagrams).values(diagram).returning();
    return newDiagram;
  }
}

export const storage = new DatabaseStorage();
