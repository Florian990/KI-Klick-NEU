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

// Quiz questions in funnel order (ids skip 6 by design). Labels must match the wording
// in client/src/components/Quiz.tsx verbatim. `disqualifyAnswers` lists the answer texts
// that disqualify a lead at that question, so per-question disqualification can be
// computed retroactively from the stored `quiz_step_<id>` answers.
const QUIZ_QUESTIONS: { id: number; label: string; disqualifyAnswers: string[] }[] = [
  { id: 1, label: "Was ist dein aktueller Beruf?", disqualifyAnswers: ["Schüler/in", "aktuell arbeitslos"] },
  { id: 2, label: "Bist du mit deiner aktuellen Situation zufrieden?", disqualifyAnswers: [] },
  { id: 3, label: "Wie alt bist du?", disqualifyAnswers: ["Unter 18"] },
  { id: 4, label: "Wie viel Zeit hast du am Tag um sie in dein zweites Standbein zu investieren?", disqualifyAnswers: [] },
  { id: 5, label: "Warum möchtest du dir ein zweites Standbein aufbauen?", disqualifyAnswers: [] },
  { id: 7, label: "Ist dir bewusst, dass es sich hier um einen High Income Skill handelt den du lernen kannst und NICHT um ein Job Angebot?", disqualifyAnswers: [] },
  { id: 8, label: "Wenn du einen Mehrwert erkennen würdest + eine schriftliche Garantie von uns bekommst, könntest du es dir dann vorstellen das System zu nutzen?", disqualifyAnswers: ["Nein"] },
];

// Secret that authorizes "test mode" (skips DB + CRM writes for the admin's own runs).
// Fail-safe: if it is not configured, NO request can ever suppress a real lead.
const ADMIN_TEST_TOKEN = process.env.ADMIN_TEST_TOKEN || "";
function isAuthorizedTest(body: any): boolean {
  return (
    body?.test === true &&
    ADMIN_TEST_TOKEN.length > 0 &&
    typeof body?.testToken === "string" &&
    body.testToken === ADMIN_TEST_TOKEN
  );
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Zapier proxy — forwards quiz answers + contact data server-side to avoid CORS
  app.post("/api/quiz-complete", async (req, res) => {
    try {
      const { name, email, phone, answers,
        frage_1_alter, frage_2_situation, frage_3_ziel,
        frage_4_finanzielles_ziel, frage_5_zeitaufwand } = req.body;

      // Reconstruct answers object from either format the frontend may send
      const quizAnswers = answers ?? {
        ...(frage_1_alter       && { 1: frage_1_alter }),
        ...(frage_2_situation   && { 2: frage_2_situation }),
        ...(frage_3_ziel        && { 3: frage_3_ziel }),
        ...(frage_4_finanzielles_ziel && { 4: frage_4_finanzielles_ziel }),
        ...(frage_5_zeitaufwand && { 5: frage_5_zeitaufwand }),
      };

      // TEST MODE (admin only, token-verified): still send the notification email so the
      // funnel can be verified, but never write to the DB or forward to the CRM.
      if (isAuthorizedTest(req.body)) {
        sendLeadNotification({
          name: name || "Unbekannt",
          email: email || null,
          phone: phone || null,
          source: "Quiz Funnel (TEST)",
          quizAnswers,
        }).catch((err) => console.error("Email notification error:", err));
        return res.status(200).json({ success: true, test: true });
      }

      // Save lead to DB (include UTM attribution so reporting/CSV keep campaign source)
      if (name || email || phone) {
        try {
          await storage.createLead({
            name: name || "",
            email: email || null,
            phone: phone || null,
            utmSource: req.body.utmSource || null,
            utmMedium: req.body.utmMedium || null,
            utmCampaign: req.body.utmCampaign || null,
            utmContent: req.body.utmContent || null,
            utmTerm: req.body.utmTerm || null,
          });
        } catch {}
      }

      // Forward to Zapier (Close CRM) — best-effort, strip internal test fields.
      // Never block the funnel on CRM availability: the lead is already saved + emailed.
      const { test: _omitTest, testToken: _omitTestToken, ...zapierPayload } = req.body || {};
      fetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zapierPayload),
      }).catch((err) => console.error("Zapier webhook error:", err));

      // Send email notification independently — never blocks or breaks the main flow
      sendLeadNotification({
        name: name || "Unbekannt",
        email: email || null,
        phone: phone || null,
        source: "Quiz Funnel (Vollständig)",
        quizAnswers,
      }).catch((err) => console.error("Email notification error:", err));

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error("Zapier webhook error:", err);
      return res.status(502).json({ success: false });
    }
  });

  // Partial save — stores contact data even if quiz not fully completed
  app.post("/api/quiz-partial", async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      if (isAuthorizedTest(req.body)) return res.status(200).json({ success: true, test: true });
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

  // Get all leads (admin only — returns lead PII, must stay behind Basic Auth)
  app.get("/api/leads", basicAuth, async (req, res) => {
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

  // Returns the admin test token to an authenticated admin, so the dashboard toggle
  // can activate test mode on this device. Returns null when not configured.
  app.get("/api/test-token", basicAuth, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ token: ADMIN_TEST_TOKEN || null });
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

      // Answers recorded for a given quiz question (quiz_step_<id> stores the answer
      // BEFORE the disqualify check, so disqualifying answers are captured too).
      const stepAnswers = (id: number): string[] =>
        events
          .filter(e => e.eventType === `quiz_step_${id}`)
          .map(e => {
            try {
              return e.eventData ? String(JSON.parse(e.eventData).answer ?? "") : "";
            } catch {
              return "";
            }
          });

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
          // Quiz funnel (all 5 questions)
          funnelStart: count('funnel_start'),
          funnelQ1: count('funnel_q1'),
          funnelQ2: count('funnel_q2'),
          funnelQ3: count('funnel_q3'),
          funnelQ4: count('funnel_q4'),
          funnelQ5: count('funnel_q5'),
          funnelDisqualified: count('funnel_disqualified'),
          funnelQualified: count('funnel_qualified'),
          // Per-question drop-off + disqualification, labelled with the real question text.
          // Computed from stored quiz_step answers so it also works for past data.
          questionFunnel: QUIZ_QUESTIONS.map((q) => {
            const answers = stepAnswers(q.id);
            return {
              id: q.id,
              label: q.label,
              reached: answers.length,
              disqualified: q.disqualifyAnswers.length
                ? answers.filter((a) => q.disqualifyAnswers.includes(a)).length
                : 0,
            };
          }),
          // Opt-in / contact form (drop-off analysis)
          contactViewName: count('contact_view_name'),
          contactViewPhone: count('contact_view_phone'),
          contactViewEmail: count('contact_view_email'),
          contactSubmitted: count('funnel_contact_submitted'),
          // Leads actually saved to the database (source of truth)
          leadsGenerated: leadsInRange.length,
          // Legacy (kept for backward compatibility; no longer featured)
          calendlyOpen: count('calendly_open'),
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
