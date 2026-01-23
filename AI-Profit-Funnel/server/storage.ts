import { type User, type InsertUser, type Lead, type InsertLead, type PageView, type InsertPageView, type AnalyticsEvent, type InsertAnalyticsEvent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  
  // Analytics operations
  createPageView(pageView: InsertPageView): Promise<PageView>;
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getPageViews(startDate: Date, endDate: Date): Promise<PageView[]>;
  getAnalyticsEvents(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]>;
  getUniqueVisitors(startDate: Date, endDate: Date): Promise<number>;
  getReturningVisitors(startDate: Date, endDate: Date): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private pageViews: Map<string, PageView>;
  private analyticsEvents: Map<string, AnalyticsEvent>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.pageViews = new Map();
    this.analyticsEvents = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      id,
      name: insertLead.name,
      email: insertLead.email ?? null,
      phone: insertLead.phone ?? null,
      utmSource: insertLead.utmSource ?? null,
      utmMedium: insertLead.utmMedium ?? null,
      utmCampaign: insertLead.utmCampaign ?? null,
      utmContent: insertLead.utmContent ?? null,
      utmTerm: insertLead.utmTerm ?? null,
      createdAt: new Date(),
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    return Array.from(this.leads.values()).find(
      (lead) => lead.email === email,
    );
  }

  async createPageView(insertPageView: InsertPageView): Promise<PageView> {
    const id = randomUUID();
    const pageView: PageView = {
      id,
      visitorId: insertPageView.visitorId,
      page: insertPageView.page,
      referrer: insertPageView.referrer ?? null,
      userAgent: insertPageView.userAgent ?? null,
      createdAt: new Date(),
    };
    this.pageViews.set(id, pageView);
    return pageView;
  }

  async createAnalyticsEvent(insertEvent: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const id = randomUUID();
    const event: AnalyticsEvent = {
      id,
      visitorId: insertEvent.visitorId,
      eventType: insertEvent.eventType,
      eventData: insertEvent.eventData ?? null,
      page: insertEvent.page ?? null,
      createdAt: new Date(),
    };
    this.analyticsEvents.set(id, event);
    return event;
  }

  async getPageViews(startDate: Date, endDate: Date): Promise<PageView[]> {
    return Array.from(this.pageViews.values()).filter(
      (pv) => pv.createdAt >= startDate && pv.createdAt <= endDate
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAnalyticsEvents(startDate: Date, endDate: Date): Promise<AnalyticsEvent[]> {
    return Array.from(this.analyticsEvents.values()).filter(
      (ev) => ev.createdAt >= startDate && ev.createdAt <= endDate
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUniqueVisitors(startDate: Date, endDate: Date): Promise<number> {
    const pageViewsInRange = await this.getPageViews(startDate, endDate);
    const uniqueVisitors = new Set(pageViewsInRange.map(pv => pv.visitorId));
    return uniqueVisitors.size;
  }

  async getReturningVisitors(startDate: Date, endDate: Date): Promise<number> {
    const pageViewsInRange = await this.getPageViews(startDate, endDate);
    const visitorCounts = new Map<string, number>();
    
    pageViewsInRange.forEach(pv => {
      visitorCounts.set(pv.visitorId, (visitorCounts.get(pv.visitorId) || 0) + 1);
    });
    
    let returningCount = 0;
    visitorCounts.forEach((count) => {
      if (count > 1) returningCount++;
    });
    
    return returningCount;
  }
}

export const storage = new MemStorage();
