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
  1: "Was ist dein aktueller Beruf?",
  2: "Bist du mit deiner aktuellen Situation zufrieden?",
  3: "Wie alt bist du?",
  4: "Wie viel Zeit hast du am Tag?",
  5: "High Income Skill bewusst?",
  6: "Was ist dir am Wichtigsten?",
  7: "Garantie - Bereit das System zu nutzen?"
};

function formatQuizAnswers(answers?: QuizAnswers): string {
  if (!answers || Object.keys(answers).length === 0) {
    return '';
  }
  
  let result = '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📋 QUIZ-ANTWORTEN\n';
  result += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  
  for (const [questionId, answer] of Object.entries(answers)) {
    const questionText = questionTexts[Number(questionId)] || `Frage ${questionId}`;
    result += `❓ ${questionText}\n`;
    result += `➡️ ${answer}\n\n`;
  }
  return result;
}

export async function sendLeadNotification(lead: LeadData) {
  try {
    const { client, fromEmail } = getResendClient();
    
    const quizSection = formatQuizAnswers(lead.quizAnswers);
    
    const emailContent = `
🎯 NEUER LEAD EINGEGANGEN!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: ${lead.name}

📧 E-Mail: ${lead.email || 'Nicht angegeben'}

📱 Telefon: ${lead.phone || 'Nicht angegeben'}

📍 Quelle: ${lead.source || 'Quiz Funnel'}
${quizSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
