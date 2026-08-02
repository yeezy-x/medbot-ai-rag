import { logger } from "@/lib/logger";
import type { EmailMessage, EmailProvider } from "./email-provider";

export class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    logger.info({
      event: "EMAIL_CONSOLE",
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
