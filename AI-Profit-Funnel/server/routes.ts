import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import { sendLeadNotification } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Lead capture endpoint
  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      
      // Check if email already exists (only if email provided)
      if (validatedData.email) {
        const existingLead = await storage.getLeadByEmail(validatedData.email);
        if (existingLead) {
          // Return success even if lead exists (don't reveal this to frontend)
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
      
      // Send email notification
      const source = req.body.source || (lead.utmSource ? `UTM: ${lead.utmSource}` : 'Quiz Funnel');
      sendLeadNotification({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: source
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

  return httpServer;
}
