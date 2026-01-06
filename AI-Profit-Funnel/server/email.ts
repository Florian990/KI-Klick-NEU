import { Resend } from 'resend';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return {
    client: new Resend(apiKey),
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@geheime-ki-klickmethode.de'
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
    const { client, fromEmail } = getResendClient();
    
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
