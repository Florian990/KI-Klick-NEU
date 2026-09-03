interface RecruitmentApplicationEmail {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salesExperience: string;
  industriesProducts: string;
  coachingMarketExperience: string;
  makeMoneyMarketExperience: string;
  fullTimeAvailable: string;
  lastYearRevenue: string;
  softSkills: string;
  careerGoals: string;
  salesTools: string;
  fullFocusCommitment: string;
  expectations: string;
}

export interface RecruitmentEmailAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
}

const NOTIFY_TO = "agenturmehler@gmail.com";
const RESEND_FROM = process.env.RESEND_FROM || "KI-Klick Methode <onboarding@resend.dev>";
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "noreply@geheime-ki-klickmethode.de";

function answer(label: string, value: string): string {
  return `\n${label}\n${value}`;
}

function buildMessage(application: RecruitmentApplicationEmail, attachments: RecruitmentEmailAttachment[]): string {
  const evidence = attachments.length
    ? attachments.map((file) => `- ${file.filename}`).join("\n")
    : "Keine Nachweise angehängt";

  return `
NEUE VERTRIEBSBEWERBUNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KONTAKTDATEN
Vorname: ${application.firstName}
Nachname: ${application.lastName}
E-Mail: ${application.email}
Telefon: ${application.phone}

BEWERBUNG
${answer("Jahre im Vertrieb:", application.salesExperience)}
${answer("Branchen oder Produkte:", application.industriesProducts)}
${answer("Erfahrung im Coaching-Markt:", application.coachingMarketExperience)}
${answer("Erfahrung im Make-Money-Markt:", application.makeMoneyMarketExperience)}
${answer("Vollzeit verfügbar:", application.fullTimeAvailable)}
${answer("Umsatz im letzten Jahr:", application.lastYearRevenue)}
${answer("Persönliche Eigenschaften / Soft Skills:", application.softSkills)}
${answer("Langfristige berufliche Ziele:", application.careerGoals)}
${answer("Vertrieb- und CRM-Tools:", application.salesTools)}
${answer("Vollzeit- und Fokus-Zusammenarbeit:", application.fullFocusCommitment)}
${answer("Erwartungen an das Unternehmen:", application.expectations)}

TRACK-RECORD-NACHWEISE
${evidence}

Die Nachweise wurden vom Bewerber für die interne Prüfung hochgeladen.
  `.trim();
}

async function sendViaResend(
  subject: string,
  text: string,
  attachments: RecruitmentEmailAttachment[],
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [NOTIFY_TO],
        subject,
        text,
        attachments: attachments.map((file) => ({
          filename: file.filename,
          content: file.content.toString("base64"),
        })),
      }),
    });

    const data = await response.json() as { id?: string };
    if (!response.ok) {
      console.error("❌ Resend Fehler bei Vertriebsbewerbung:", JSON.stringify(data));
      return false;
    }
    console.log(`✅ Vertriebsbewerbung via Resend gesendet (ID: ${data.id || "unbekannt"})`);
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Resend-Versand der Vertriebsbewerbung:", error);
    return false;
  }
}

async function sendViaBrevo(
  subject: string,
  text: string,
  attachments: RecruitmentEmailAttachment[],
): Promise<boolean> {
  const apiKey = process.env.BREVO_SMTP_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "KI-Klick Methode", email: BREVO_FROM_EMAIL },
        to: [{ email: NOTIFY_TO }],
        subject,
        textContent: text,
        attachment: attachments.map((file) => ({
          name: file.filename,
          content: file.content.toString("base64"),
        })),
      }),
    });

    const data = await response.json() as { messageId?: string };
    if (!response.ok) {
      console.error("❌ Brevo Fehler bei Vertriebsbewerbung:", JSON.stringify(data));
      return false;
    }
    console.log(`✅ Vertriebsbewerbung via Brevo gesendet (ID: ${data.messageId || "unbekannt"})`);
    return true;
  } catch (error) {
    console.error("❌ Fehler beim Brevo-Versand der Vertriebsbewerbung:", error);
    return false;
  }
}

export async function sendRecruitmentApplicationNotification(
  application: RecruitmentApplicationEmail,
  attachments: RecruitmentEmailAttachment[],
): Promise<boolean> {
  const subject = `Neue Vertriebsbewerbung: ${application.firstName} ${application.lastName}`;
  const text = buildMessage(application, attachments);

  if (await sendViaResend(subject, text, attachments)) return true;

  console.warn("⚠️ Resend fehlgeschlagen — versuche Brevo für die Vertriebsbewerbung");
  return sendViaBrevo(subject, text, attachments);
}