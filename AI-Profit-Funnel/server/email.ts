interface QuizAnswers {
  [questionId: number]: string;
}

interface LeadData {
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
  quizAnswers?: QuizAnswers;
}

const questionTexts: { [key: number]: string } = {
  // Legacy quiz (kept so historical lead mails stay readable)
  1: "Was ist dein aktueller Beruf?",
  2: "Bist du mit deiner aktuellen Situation zufrieden?",
  3: "Wie alt bist du?",
  4: "Wie viel Zeit kannst du täglich investieren?",
  5: "Warum möchtest du dir ein zweites Standbein aufbauen?",
  6: "Wärst du bereit, 200€/Monat für Umsetzungskosten einzuplanen?",
  7: "Ist dir bewusst, dass es ein High Income Skill ist (kein Job-Angebot)?",
  8: "Würdest du das System bei schriftlicher Garantie nutzen?",
  // Current quiz (4 Fragen + Folgefrage)
  11: "Wie alt bist du?",
  12: "In welcher beruflichen Situation bist du?",
  13: "Hand aufs Herz: Wie zufrieden bist du mit deinem aktuellen Einkommen?",
  14: "Ist dir bewusst, dass das ein lernbarer Skill ist und KEIN fertiges Job-Angebot?",
  15: "Wenn du einen Mehrwert erkennst + eine schriftliche Garantie bekommst, könntest du es dir vorstellen, das System zu nutzen?",
};

function formatQuizAnswers(answers?: QuizAnswers): string {
  if (!answers || Object.keys(answers).length === 0) return '';

  let result = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📋 QUIZ-ANTWORTEN\n';
  result += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  for (const [questionId, answer] of Object.entries(answers)) {
    const questionText = questionTexts[Number(questionId)] || `Frage ${questionId}`;
    result += `❓ ${questionText}\n`;
    result += `➡️  ${answer}\n\n`;
  }
  return result;
}

const NOTIFY_TO = 'agenturmehler@gmail.com';

// Resend "send-only" key works without a verified domain when sending from
// onboarding@resend.dev. Override via env if a custom verified domain exists.
const RESEND_FROM = process.env.RESEND_FROM || 'KI-Klick Methode <onboarding@resend.dev>';
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'noreply@geheime-ki-klickmethode.de';

async function sendViaResend(subject: string, textContent: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [NOTIFY_TO],
        subject,
        text: textContent,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      console.error('❌ Resend API Fehler:', JSON.stringify(data));
      return false;
    }
    console.log(`✅ Lead-Mail via Resend gesendet (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Resend-Versand:', error);
    return false;
  }
}

async function sendViaBrevo(subject: string, textContent: string): Promise<boolean> {
  const apiKey = process.env.BREVO_SMTP_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'KI-Klick Methode', email: BREVO_FROM_EMAIL },
        to: [{ email: NOTIFY_TO }],
        subject,
        textContent,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      console.error('❌ Brevo API Fehler:', JSON.stringify(data));
      return false;
    }
    console.log(`✅ Lead-Mail via Brevo gesendet (ID: ${data.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Fehler beim Brevo-Versand:', error);
    return false;
  }
}

export async function sendLeadNotification(lead: LeadData) {
  const quizSection = formatQuizAnswers(lead.quizAnswers);
  const subject = `🎯 Neuer Lead: ${lead.name}`;

  const textContent = `
🎯 NEUER LEAD EINGEGANGEN!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name:    ${lead.name}
📧 E-Mail:  ${lead.email || 'Nicht angegeben'}
📱 Telefon: ${lead.phone || 'Nicht angegeben'}
📍 Quelle:  ${lead.source || 'Quiz Funnel'}
${quizSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Automatisch gesendet von deinem KI-Klick Methode Funnel
  `.trim();

  // Primary: Resend (reliable, sends from onboarding@resend.dev without a
  // verified domain). Fallback: Brevo (kept for redundancy).
  if (await sendViaResend(subject, textContent)) return true;

  console.warn('⚠️  Resend fehlgeschlagen oder nicht konfiguriert — versuche Brevo als Fallback');
  if (await sendViaBrevo(subject, textContent)) return true;

  console.error(`❌ Lead-Mail KONNTE NICHT gesendet werden für: ${lead.name} (Resend + Brevo fehlgeschlagen)`);
  return false;
}
