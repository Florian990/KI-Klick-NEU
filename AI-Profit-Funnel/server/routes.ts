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

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/27941795/43ic4lx/";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Zapier proxy — forwards quiz answers + contact data server-side to avoid CORS
  app.post("/api/quiz-complete", async (req, res) => {
    try {
      // Also save lead to DB
      const { name, email, phone } = req.body;
      if (name || email || phone) {
        try {
          await storage.createLead({ name: name || "", email: email || null, phone: phone || null });
        } catch {}
      }
      const response = await fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      return res.status(response.ok ? 200 : 502).json({ success: response.ok });
    } catch (err) {
      console.error("Zapier webhook error:", err);
      return res.status(502).json({ success: false });
    }
  });

  // Partial save — stores contact data even if quiz not fully completed
  app.post("/api/quiz-partial", async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      if (!email && !phone) return res.status(200).json({ success: true });
      try {
        await storage.createLead({ name: name || "", email: email || null, phone: phone || null });
      } catch {}
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false });
    }
  });

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

  // CSV Export: Download all leads as CSV (protected with Basic Auth)
  app.get("/api/leads/export-csv", basicAuth, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      
      const csvHeader = "ID,Name,Email,Telefon,UTM Source,UTM Medium,UTM Campaign,UTM Content,UTM Term,Erstellt am\n";
      const csvRows = leads.map(lead => {
        const createdAt = lead.createdAt ? new Date(lead.createdAt).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }) : '';
        return [
          lead.id,
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          `"${(lead.email || '').replace(/"/g, '""')}"`,
          `"${(lead.phone || '').replace(/"/g, '""')}"`,
          `"${(lead.utmSource || '').replace(/"/g, '""')}"`,
          `"${(lead.utmMedium || '').replace(/"/g, '""')}"`,
          `"${(lead.utmCampaign || '').replace(/"/g, '""')}"`,
          `"${(lead.utmContent || '').replace(/"/g, '""')}"`,
          `"${(lead.utmTerm || '').replace(/"/g, '""')}"`,
          `"${createdAt}"`
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"');
      res.send('\uFEFF' + csv);
    } catch (error) {
      console.error("Error exporting leads:", error);
      res.status(500).json({ success: false, message: "Export fehlgeschlagen" });
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

      const count = (type: string) => events.filter(e => e.eventType === type).length;

      res.json({
        success: true,
        data: {
          // Traffic
          totalPageViews: pageViews.length,
          uniqueVisitors,
          returningVisitors,
          newVisitors: uniqueVisitors - returningVisitors,
          // Video
          videoStart: count('video_start'),
          video25: count('video_25'),
          video50: count('video_50'),
          video75: count('video_75'),
          video100: count('video_100'),
          // CTA
          ctaShown: count('cta_shown'),
          ctaClick: count('cta_click'),
          // Funnel
          funnelStart: count('funnel_start'),
          funnelQ1: count('funnel_q1'),
          funnelQ2: count('funnel_q2'),
          funnelQ3: count('funnel_q3'),
          funnelDisqualified: count('funnel_disqualified'),
          funnelQualified: count('funnel_qualified'),
          // Sales
          calendlyOpen: count('calendly_open'),
          // Legacy support
          leadsGenerated: leadsInRange.length,
        }
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  // Reset all analytics data (protected with Basic Auth)
  app.delete("/api/analytics/reset", basicAuth, async (req, res) => {
    try {
      await storage.clearAllAnalyticsData();
      res.json({ success: true, message: "Alle Tracking-Daten wurden gelöscht." });
    } catch (error) {
      console.error("Error resetting analytics:", error);
      res.status(500).json({ success: false, message: "Fehler beim Zurücksetzen" });
    }
  });

  return httpServer;
}
