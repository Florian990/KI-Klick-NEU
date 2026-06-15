import nodemailer from 'nodemailer';

function getTransporter() {
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY;
  if (!user || !pass) {
    throw new Error('BREVO_SMTP_USER oder BREVO_SMTP_KEY nicht konfiguriert');
  }
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
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
  1: "Wie alt bist du?",
  2: "Was ist deine aktuelle Situation?",
  3: "Was möchtest du mit der KI-Klick Methode erreichen?",
  4: "Was ist dein finanzielles Ziel pro Monat?",
  5: "Wie viel Zeit kannst du täglich investieren?",
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

export async function sendLeadNotification(lead: LeadData) {
  try {
    const transporter = getTransporter();
    const quizSection = formatQuizAnswers(lead.quizAnswers);

    const emailContent = `
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

    await transporter.sendMail({
      from: 'KI-Klick Methode <noreply@geheime-ki-klickmethode.de>',
      to: 'ki.klick.methode@gmail.com',
      subject: `🎯 Neuer Lead: ${lead.name}`,
      text: emailContent,
    });

    console.log(`✅ Lead-Mail gesendet für: ${lead.name}`);
    return true;
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error);
    return false;
  }
}
