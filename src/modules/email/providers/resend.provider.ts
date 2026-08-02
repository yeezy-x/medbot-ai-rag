import { env } from "@/config/env";
import type { EmailMessage, EmailProvider } from "./email-provider";

export class ResendEmailProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string = env.AUTH_RESEND_KEY!,
    private readonly from: string = env.EMAIL_FROM!
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!res.ok) {
      throw new Error(`Resend error: ${JSON.stringify(await res.json())}`);
    }
  }
}
