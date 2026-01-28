
import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === Enums ===
export const regions = ["North", "South", "East", "West"] as const;
export const telephonySystems = ["Microsoft Teams", "Avaya", "Cisco", "CX One", "IP Trade", "eFax", "Other"] as const;

// === Tables ===

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region", { enum: regions }).notNull(),
  description: text("description"), // General Site Info
  code: text("code"), // e.g. "LON"
});

export const siteConnectivity = pgTable("site_connectivity", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  linkType: text("link_type").notNull(), // e.g., "Fiber", "MPLS"
  ispName: text("isp_name").notNull(),
  ispContact: text("isp_contact").notNull(), // JSON or text details
  localItContact: text("local_it_contact").notNull(),
});

export const siteServices = pgTable("site_services", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  serviceType: text("service_type").notNull(), // "Switchboard", "Recording", "TMS"
  details: text("details"),
  status: text("status").default("Active"),
});

export const siteTelephony = pgTable("site_telephony", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  platform: text("platform", { enum: telephonySystems }).notNull(),
  numberRanges: text("number_ranges").array().notNull(), // ["+44 123...", "+44 456..."]
});

export const siteDiagrams = pgTable("site_diagrams", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
});

// === Relations ===

export const sitesRelations = relations(sites, ({ one, many }) => ({
  connectivity: one(siteConnectivity), // Assuming one main connectivity record per site for simplicity, or could be many
  services: many(siteServices),
  telephony: many(siteTelephony),
  diagrams: many(siteDiagrams),
}));

export const connectivityRelations = relations(siteConnectivity, ({ one }) => ({
  site: one(sites, {
    fields: [siteConnectivity.siteId],
    references: [sites.id],
  }),
}));

export const servicesRelations = relations(siteServices, ({ one }) => ({
  site: one(sites, {
    fields: [siteServices.siteId],
    references: [sites.id],
  }),
}));

export const telephonyRelations = relations(siteTelephony, ({ one }) => ({
  site: one(sites, {
    fields: [siteTelephony.siteId],
    references: [sites.id],
  }),
}));

export const diagramsRelations = relations(siteDiagrams, ({ one }) => ({
  site: one(sites, {
    fields: [siteDiagrams.siteId],
    references: [sites.id],
  }),
}));

// === Schemas ===

export const insertSiteSchema = createInsertSchema(sites).omit({ id: true });
export const insertConnectivitySchema = createInsertSchema(siteConnectivity).omit({ id: true });
export const insertServiceSchema = createInsertSchema(siteServices).omit({ id: true });
export const insertTelephonySchema = createInsertSchema(siteTelephony).omit({ id: true });
export const insertDiagramSchema = createInsertSchema(siteDiagrams).omit({ id: true });

// === Types ===

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export type SiteConnectivity = typeof siteConnectivity.$inferSelect;
export type InsertConnectivity = z.infer<typeof insertConnectivitySchema>;

export type SiteService = typeof siteServices.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type SiteTelephony = typeof siteTelephony.$inferSelect;
export type InsertTelephony = z.infer<typeof insertTelephonySchema>;

export type SiteDiagram = typeof siteDiagrams.$inferSelect;
export type InsertDiagram = z.infer<typeof insertDiagramSchema>;

export type Region = typeof regions[number];
