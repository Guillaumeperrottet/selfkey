import { Resend } from "resend";

// Lazy initialization - ne crée le client que lors du premier appel
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  html: string;
  bcc?: string[];
}

export async function sendEmail(
  data: EmailData
): Promise<{ success: boolean; error?: string; data?: { id: string } }> {
  try {
    const client = getResendClient();

    const result = await client.emails.send({
      from: data.from,
      to: data.to,
      subject: data.subject,
      html: data.html,
      bcc: data.bcc,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log("Email sent successfully:", result.data?.id);
    return {
      success: true,
      data: result.data ? { id: result.data.id } : undefined,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
