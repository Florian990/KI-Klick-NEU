import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertPageViewSchema, insertAnalyticsEventSchema } from "@shared/schema";
import { z } from "zod";
import { sendLeadNotification } from "./email";

// Basic Auth middleware for admin routes (without WWW-Authenticate header to prevent browser popup)
const basicAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  
  const validUsername = process.env.ADMIN_USERNAME || 'Admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'Erfolg2026!';
  
  if (username === validUsername && password === validPassword) {
    next();
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Lead capture endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      // Extract only the fields we need for the database
      const { name, email, phone, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, source, quizAnswers } = req.body;
      
      const validatedData = {
        name: name || '',
        email: email || null,
        phone: phone || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmContent: utmContent || null,
        utmTerm: utmTerm || null,
      };
      
      // Check if email already exists (only if email provided)
      if (validatedData.email) {
        const existingLead = await storage.getLeadByEmail(validatedData.email);
        if (existingLead) {
          // Still send email notification for existing leads
          const leadSource = source || 'Quiz Funnel';
          sendLeadNotification({
            name: existingLead.name,
            email: existingLead.email,
            phone: existingLead.phone,
            source: leadSource + ' (Wiederholung)',
            quizAnswers: quizAnswers
          });
          
          return res.status(200).json({ 
            success: true, 
            message: "Lead registered",
            leadId: existingLead.id 
          });
        }
      }
      
      const lead = await storage.createLead(validatedData);
      
      console.log("New lead captured:", {
        id: lead.id,
        email: lead.email,
        utmSource: lead.utmSource,
        utmMedium: lead.utmMedium,
        utmCampaign: lead.utmCampaign,
        utmContent: lead.utmContent,
      });
      
      console.log("Quiz answers received:", JSON.stringify(quizAnswers));
      
      // Send email notification
      const leadSource = source || (lead.utmSource ? `UTM: ${lead.utmSource}` : 'Quiz Funnel');
      sendLeadNotification({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: leadSource,
        quizAnswers: quizAnswers
      });
      
      res.status(201).json({ 
        success: true, 
        message: "Lead created successfully",
        leadId: lead.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Error creating lead:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get all leads (for admin purposes - could be protected later)
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Analytics: Track page view
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const validatedData = insertPageViewSchema.parse(req.body);
      await storage.createPageView(validatedData);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      console.error("Error tracking page view:", error);
      res.status(500).json({ success: false });
    }
  });

  // Analytics: Track event
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const validatedData = insertAnalyticsEventSchema.parse(req.body);
      await storage.createAnalyticsEvent(validatedData);
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      console.error("Error tracking event:", error);
      res.status(500).json({ success: false });
    }
  });

  // Analytics: Get stats for date range (protected with Basic Auth)
  app.get("/api/analytics/stats", basicAuth, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: "startDate and endDate are required" 
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);

      const [pageViews, events, uniqueVisitors, returningVisitors, leads] = await Promise.all([
        storage.getPageViews(start, end),
        storage.getAnalyticsEvents(start, end),
        storage.getUniqueVisitors(start, end),
        storage.getReturningVisitors(start, end),
        storage.getLeads()
      ]);

      const leadsInRange = leads.filter(l => l.createdAt >= start && l.createdAt <= end);

      const quizStarted = events.filter(e => e.eventType === 'quiz_start').length;
      const quizCompleted = events.filter(e => e.eventType === 'quiz_complete').length;
      const quizDisqualified = events.filter(e => e.eventType === 'quiz_disqualified').length;

      const quizStepCounts: Record<string, number> = {};
      events.filter(e => e.eventType.startsWith('quiz_step_')).forEach(e => {
        quizStepCounts[e.eventType] = (quizStepCounts[e.eventType] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          totalPageViews: pageViews.length,
          uniqueVisitors,
          returningVisitors,
          newVisitors: uniqueVisitors - returningVisitors,
          quizStarted,
          quizCompleted,
          quizDisqualified,
          quizStepCounts,
          leadsGenerated: leadsInRange.length,
        }
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  return httpServer;
}
