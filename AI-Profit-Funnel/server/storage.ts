import { type User, type InsertUser, type Lead, type InsertLead, type PageView, type InsertPageView, type AnalyticsEvent, type InsertAnalyticsEvent, users, leads, pageViews, analyticsEvents } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  
  createPageView(pageView: InsertPageView): Promise<PageView>;
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getPageViews(startDate: Date, endDate: Date): Promise<PageView[]>;
  getAnalyticsEvents(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]>;
  getUniqueVisitors(startDate: Date, endDate: Date): Promise<number>;
  getReturningVisitors(startDate: Date, endDate: Date): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values({
      name: insertLead.name,
      email: insertLead.email ?? null,
      phone: insertLead.phone ?? null,
      utmSource: insertLead.utmSource ?? null,
      utmMedium: insertLead.utmMedium ?? null,
      utmCampaign: insertLead.utmCampaign ?? null,
      utmContent: insertLead.utmContent ?? null,
      utmTerm: insertLead.utmTerm ?? null,
    }).returning();
    return result[0];
  }

  async getLeads(): Promise<Lead[]> {
    return db.select().from(leads).orderBy(sql`${leads.createdAt} DESC`);
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.email, email));
    return result[0];
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const result = await db.insert(pageViews).values({
      visitorId: insertPageView.visitorId,
      page: insertPageView.page,
      referrer: insertPageView.referrer ?? null,
      userAgent: insertPageView.userAgent ?? null,
    }).returning();
    return result[0];
  }

  async createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const result = await db.insert(analyticsEvents).values({
      visitorId: insertEvent.visitorId,
      eventType: insertEvent.eventType,
      eventData: insertEvent.eventData ?? null,
      page: insertEvent.page ?? null,
    }).returning();
    return result[0];
  }

  async getPageViews(startDate: Date, endDate: Date): Promise<PageView[]> {
    return db.select().from(pageViews).where(
      and(
        gte(pageViews.createdAt, startDate),
        lte(pageViews.createdAt, endDate)
      )
    ).orderBy(sql`${pageViews.createdAt} DESC`);
  }

  async getAnalyticsEvents(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return db.select().from(analyticsEvents).where(
      and(
        gte(analyticsEvents.createdAt, startDate),
        lte(analyticsEvents.createdAt, endDate)
      )
    ).orderBy(sql`${analyticsEvents.createdAt} DESC`);
  }

  async getUniqueVisitors(startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({
      count: sql<number>`COUNT(DISTINCT ${pageViews.visitorId})`
    }).from(pageViews).where(
      and(
        gte(pageViews.createdAt, startDate),
        lte(pageViews.createdAt, endDate)
      )
    );
    return Number(result[0]?.count || 0);
  }

  async getReturningVisitors(startDate: Date, endDate: Date): Promise<number> {
    const result = await db.select({
      visitorId: pageViews.visitorId,
      count: sql<number>`COUNT(*)`
    }).from(pageViews).where(
      and(
        gte(pageViews.createdAt, startDate),
        lte(pageViews.createdAt, endDate)
      )
    ).groupBy(pageViews.visitorId);
    
    return result.filter(r => Number(r.count) > 1).length;
  }
}

export const storage = new DatabaseStorage();
