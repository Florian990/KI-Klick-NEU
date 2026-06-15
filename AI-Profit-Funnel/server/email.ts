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
        to: [{ email: 'ki.klick.methode@gmail.com' }],
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
