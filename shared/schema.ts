import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === Enums ===
export const regions = ["North", "South", "East", "West"] as const;
export const telephonySystems = ["Microsoft Teams", "Avaya", "Cisco", "CX One", "IP Trade", "eFax", "Other"] as const;
export const documentCategories = ["SOP", "Runbook", "Architecture", "Policy", "Guide", "Reference", "Other"] as const;

// Opening/closing time options (30-min increments)
export const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

// Operating days dropdown options
export const operatingDaysOptions = [
  "Monday - Friday",
  "Monday - Saturday",
  "Monday - Sunday",
  "Tuesday - Saturday",
  "Saturday - Sunday",
  "7 Days",
] as const;

// Contact entry used in connectivity
export const contactEntrySchema = z.object({
  name: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
});
export type ContactEntry = z.infer<typeof contactEntrySchema>;

// Number range entry used in telephony (start + end)
export const numberRangeSchema = z.object({
  start: z.string().default(""),
  end: z.string().default(""),
});
export type NumberRange = z.infer<typeof numberRangeSchema>;

// === Tables ===

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region", { enum: regions }).notNull(),
  code: text("code"),
});

export const siteInfo = pgTable("site_info", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  address: text("address"),
  mainNumber: text("main_number"),
  itManager: text("it_manager"),
  numberOfUsers: text("number_of_users"),
  openingTime: text("opening_time"),
  closingTime: text("closing_time"),
  operatingDays: text("operating_days"),
  otherInfo: text("other_info"),
});

export const siteConnectivity = pgTable("site_connectivity", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  linkType: text("link_type").notNull(),
  ispName: text("isp_name").notNull(),
  ispContacts: jsonb("isp_contacts").$type<ContactEntry[]>().default([]),
  localItContacts: jsonb("local_it_contacts").$type<ContactEntry[]>().default([]),
});

export const siteServices = pgTable("site_services", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  serviceType: text("service_type").notNull(),
  details: text("details"),
  status: text("status").default("Active"),
});

export const siteTelephony = pgTable("site_telephony", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  platform: text("platform", { enum: telephonySystems }).notNull(),
  numberRanges: jsonb("number_ranges").$type<NumberRange[]>().default([]),
  blockSize: text("block_size"),
  voiceServiceProvider: text("voice_service_provider"),
  typeOfRouting: text("type_of_routing"),
});

export const siteDiagrams = pgTable("site_diagrams", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  uploadedBy: text("uploaded_by"),
  uploadedAt: text("uploaded_at"),
  fileName: text("file_name"),
});

export const siteDocuments = pgTable("site_documents", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  category: text("category"),
  addedBy: text("added_by"),
  addedAt: text("added_at"),
});

// === Relations ===

export const sitesRelations = relations(sites, ({ one, many }) => ({
  info: many(siteInfo),
  connectivity: one(siteConnectivity),
  services: many(siteServices),
  telephony: many(siteTelephony),
  diagrams: many(siteDiagrams),
  documents: many(siteDocuments),
}));

export const siteInfoRelations = relations(siteInfo, ({ one }) => ({
  site: one(sites, { fields: [siteInfo.siteId], references: [sites.id] }),
}));

export const connectivityRelations = relations(siteConnectivity, ({ one }) => ({
  site: one(sites, { fields: [siteConnectivity.siteId], references: [sites.id] }),
}));

export const servicesRelations = relations(siteServices, ({ one }) => ({
  site: one(sites, { fields: [siteServices.siteId], references: [sites.id] }),
}));

export const telephonyRelations = relations(siteTelephony, ({ one }) => ({
  site: one(sites, { fields: [siteTelephony.siteId], references: [sites.id] }),
}));

export const diagramsRelations = relations(siteDiagrams, ({ one }) => ({
  site: one(sites, { fields: [siteDiagrams.siteId], references: [sites.id] }),
}));

export const documentsRelations = relations(siteDocuments, ({ one }) => ({
  site: one(sites, { fields: [siteDocuments.siteId], references: [sites.id] }),
}));

// === Schemas ===

export const insertSiteSchema = createInsertSchema(sites).omit({ id: true });
export const insertSiteInfoSchema = createInsertSchema(siteInfo).omit({ id: true });

export const insertConnectivitySchema = createInsertSchema(siteConnectivity).omit({ id: true }).extend({
  ispContacts: z.array(contactEntrySchema).optional().default([]),
  localItContacts: z.array(contactEntrySchema).optional().default([]),
});

export const insertServiceSchema = createInsertSchema(siteServices).omit({ id: true });

export const insertTelephonySchema = createInsertSchema(siteTelephony).omit({ id: true }).extend({
  numberRanges: z.array(numberRangeSchema).optional().default([]),
});

export const insertDiagramSchema = createInsertSchema(siteDiagrams).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(siteDocuments).omit({ id: true });

// === Types ===

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export type SiteInfo = typeof siteInfo.$inferSelect;
export type InsertSiteInfo = z.infer<typeof insertSiteInfoSchema>;

export type SiteConnectivity = typeof siteConnectivity.$inferSelect;
export type InsertConnectivity = z.infer<typeof insertConnectivitySchema>;

export type SiteService = typeof siteServices.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type SiteTelephony = typeof siteTelephony.$inferSelect;
export type InsertTelephony = z.infer<typeof insertTelephonySchema>;

export type SiteDiagram = typeof siteDiagrams.$inferSelect;
export type InsertDiagram = z.infer<typeof insertDiagramSchema>;

export type SiteDocument = typeof siteDocuments.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Region = typeof regions[number];
