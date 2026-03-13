import { db } from "./db";
import {
  sites, siteInfo, siteConnectivity, siteServices, siteTelephony, siteDiagrams,
  type Site, type InsertSite,
  type SiteInfo, type InsertSiteInfo,
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
    info: SiteInfo[],
    connectivity: SiteConnectivity | null,
    services: SiteService[],
    telephony: SiteTelephony[],
    diagrams: SiteDiagram[]
  } | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, data: InsertSite): Promise<Site>;
  deleteSite(id: number): Promise<void>;

  // Info
  createSiteInfo(info: InsertSiteInfo): Promise<SiteInfo>;
  updateSiteInfo(id: number, data: Omit<InsertSiteInfo, "siteId">): Promise<SiteInfo>;
  deleteSiteInfo(id: number): Promise<void>;

  // Connectivity
  updateConnectivity(siteId: number, data: Omit<InsertConnectivity, "siteId">): Promise<SiteConnectivity>;
  
  // Services
  createService(service: InsertService): Promise<SiteService>;
  updateService(id: number, data: Omit<InsertService, "siteId">): Promise<SiteService>;
  deleteService(id: number): Promise<void>;

  // Telephony
  getTelephonyByPlatform(platform: string): Promise<Array<SiteTelephony & { site: Site }>>;
  createTelephony(telephony: InsertTelephony): Promise<SiteTelephony>;
  updateTelephony(id: number, data: Omit<InsertTelephony, "siteId">): Promise<SiteTelephony>;
  deleteTelephony(id: number): Promise<void>;

  // Diagrams
  createDiagram(diagram: InsertDiagram): Promise<SiteDiagram>;
  updateDiagram(id: number, data: Omit<InsertDiagram, "siteId">): Promise<SiteDiagram>;
  deleteDiagram(id: number): Promise<void>;
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

    const info = await db.select().from(siteInfo).where(eq(siteInfo.siteId, id));
    const [connectivity] = await db.select().from(siteConnectivity).where(eq(siteConnectivity.siteId, id));
    const services = await db.select().from(siteServices).where(eq(siteServices.siteId, id));
    const telephony = await db.select().from(siteTelephony).where(eq(siteTelephony.siteId, id));
    const diagrams = await db.select().from(siteDiagrams).where(eq(siteDiagrams.siteId, id));

    return {
      ...site,
      info,
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

  async updateSite(id: number, data: InsertSite): Promise<Site> {
    const [updated] = await db.update(sites).set(data).where(eq(sites.id, id)).returning();
    return updated;
  }

  async deleteSite(id: number): Promise<void> {
    // Cascade delete all related records
    await db.delete(siteInfo).where(eq(siteInfo.siteId, id));
    await db.delete(siteConnectivity).where(eq(siteConnectivity.siteId, id));
    await db.delete(siteServices).where(eq(siteServices.siteId, id));
    await db.delete(siteTelephony).where(eq(siteTelephony.siteId, id));
    await db.delete(siteDiagrams).where(eq(siteDiagrams.siteId, id));
    await db.delete(sites).where(eq(sites.id, id));
  }

  async createSiteInfo(info: InsertSiteInfo): Promise<SiteInfo> {
    const [newInfo] = await db.insert(siteInfo).values(info).returning();
    return newInfo;
  }

  async updateSiteInfo(id: number, data: Omit<InsertSiteInfo, "siteId">): Promise<SiteInfo> {
    const [updated] = await db.update(siteInfo).set(data).where(eq(siteInfo.id, id)).returning();
    return updated;
  }

  async deleteSiteInfo(id: number): Promise<void> {
    await db.delete(siteInfo).where(eq(siteInfo.id, id));
  }

  async updateConnectivity(siteId: number, data: Omit<InsertConnectivity, "siteId">): Promise<SiteConnectivity> {
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

  async updateService(id: number, data: Omit<InsertService, "siteId">): Promise<SiteService> {
    const [updated] = await db.update(siteServices).set(data).where(eq(siteServices.id, id)).returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(siteServices).where(eq(siteServices.id, id));
  }

  async getTelephonyByPlatform(platform: string): Promise<Array<SiteTelephony & { site: Site }>> {
    const results = await db
      .select()
      .from(siteTelephony)
      .innerJoin(sites, eq(siteTelephony.siteId, sites.id))
      .where(eq(siteTelephony.platform, platform));
    return results.map(r => ({ ...r.site_telephony, site: r.sites }));
  }

  async createTelephony(telephony: InsertTelephony): Promise<SiteTelephony> {
    const [newTelephony] = await db.insert(siteTelephony).values(telephony).returning();
    return newTelephony;
  }

  async updateTelephony(id: number, data: Omit<InsertTelephony, "siteId">): Promise<SiteTelephony> {
    const [updated] = await db.update(siteTelephony).set(data).where(eq(siteTelephony.id, id)).returning();
    return updated;
  }

  async deleteTelephony(id: number): Promise<void> {
    await db.delete(siteTelephony).where(eq(siteTelephony.id, id));
  }

  async createDiagram(diagram: InsertDiagram): Promise<SiteDiagram> {
    const [newDiagram] = await db.insert(siteDiagrams).values(diagram).returning();
    return newDiagram;
  }

  async updateDiagram(id: number, data: Omit<InsertDiagram, "siteId">): Promise<SiteDiagram> {
    const [updated] = await db.update(siteDiagrams).set(data).where(eq(siteDiagrams.id, id)).returning();
    return updated;
  }

  async deleteDiagram(id: number): Promise<void> {
    await db.delete(siteDiagrams).where(eq(siteDiagrams.id, id));
  }
}

export const storage = new DatabaseStorage();
