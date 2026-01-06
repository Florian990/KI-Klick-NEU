import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface LeadData {
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
}

export async function sendLeadNotification(lead: LeadData) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const emailContent = `
Neuer Lead eingegangen!

Name: ${lead.name}
${lead.email ? `E-Mail: ${lead.email}` : ''}
${lead.phone ? `Telefon: ${lead.phone}` : ''}
Quelle: ${lead.source || 'Unbekannt'}

---
Automatisch gesendet von deinem KI-Klick Methode Funnel
    `.trim();

    const result = await client.emails.send({
      from: fromEmail || 'onboarding@resend.dev',
      to: 'ki-klick-leads@web.de',
      subject: `Neuer Lead: ${lead.name}`,
      text: emailContent,
    });

    console.log(`Lead notification email result:`, JSON.stringify(result, null, 2));
    console.log(`Lead notification email sent for: ${lead.name}`);
    return true;
  } catch (error) {
    console.error('Error sending lead notification email:', error);
    return false;
  }
}
