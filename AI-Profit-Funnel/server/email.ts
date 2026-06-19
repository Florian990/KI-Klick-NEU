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
  4: "Wie viel Zeit kannst du täglich investieren?",
  5: "Warum möchtest du dir ein zweites Standbein aufbauen?",
  6: "Wärst du bereit, 200€/Monat für Umsetzungskosten einzuplanen?",
  7: "Ist dir bewusst, dass es ein High Income Skill ist (kein Job-Angebot)?",
  8: "Würdest du das System bei schriftlicher Garantie nutzen?",
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
  const apiKey = process.env.BREVO_SMTP_KEY;
  if (!apiKey) {
    console.warn('⚠️  BREVO_SMTP_KEY nicht gesetzt — E-Mail wird übersprungen');
    return false;
  }

  const quizSection = formatQuizAnswers(lead.quizAnswers);

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

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'KI-Klick Methode', email: 'noreply@geheime-ki-klickmethode.de' },
        to: [{ email: 'agenturmehler@gmail.com' }],
        subject: `🎯 Neuer Lead: ${lead.name}`,
        textContent,
      }),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      console.error('❌ Brevo API Fehler:', JSON.stringify(data));
      return false;
    }

    console.log(`✅ Lead-Mail gesendet für: ${lead.name} (ID: ${data.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Fehler beim E-Mail-Versand:', error);
    return false;
  }
}
