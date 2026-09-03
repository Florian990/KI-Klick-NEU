import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Lead schema for opt-in funnel
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Separate recruitment applications — intentionally isolated from quiz leads.
export const recruitmentApplications = pgTable("recruitment_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  salesExperience: text("sales_experience").notNull(),
  industriesProducts: text("industries_products").notNull(),
  coachingMarketExperience: text("coaching_market_experience").notNull(),
  makeMoneyMarketExperience: text("make_money_market_experience").notNull(),
  fullTimeAvailable: text("full_time_available").notNull(),
  lastYearRevenue: text("last_year_revenue").notNull(),
  softSkills: text("soft_skills").notNull(),
  careerGoals: text("career_goals").notNull(),
  salesTools: text("sales_tools").notNull(),
  fullFocusCommitment: text("full_focus_commitment").notNull(),
  expectations: text("expectations").notNull(),
  evidenceFileNames: text("evidence_file_names"),
  privacyConsent: boolean("privacy_consent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRecruitmentApplicationSchema = createInsertSchema(recruitmentApplications).omit({
  id: true,
  createdAt: true,
});

export type InsertRecruitmentApplication = z.infer<typeof insertRecruitmentApplicationSchema>;
export type RecruitmentApplication = typeof recruitmentApplications.$inferSelect;

// Analytics - Page Views
export const pageViews = pgTable("page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: text("visitor_id").notNull(),
  page: text("page").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;

// Analytics - Events (Quiz tracking, etc.)
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  visitorId: text("visitor_id").notNull(),
  eventType: text("event_type").notNull(),
  eventData: text("event_data"),
  page: text("page"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
