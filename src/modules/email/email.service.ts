import { env, hasResendAuth } from "@/config/env";
import { ConsoleEmailProvider } from "./providers/console.provider";
import { ResendEmailProvider } from "./providers/resend.provider";
import type { EmailProvider } from "./providers/email-provider";
import * as templates from "./templates";

export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    if (provider) {
      this.provider = provider;
    } else if (hasResendAuth) {
      this.provider = new ResendEmailProvider();
    } else {
      this.provider = new ConsoleEmailProvider();
    }
  }

  async sendVerification(to: string, name: string, verifyUrl: string) {
    const t = templates.verificationEmail({ name, verifyUrl });
    await this.provider.send({ to, ...t });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const host = new URL(resetUrl).host;
    const t = templates.passwordResetEmail({ resetUrl, host });
    await this.provider.send({ to, ...t });
  }

  async sendPasswordChanged(to: string, name: string) {
    const t = templates.passwordChangedEmail({ name });
    await this.provider.send({ to, ...t });
  }

  async sendMfaEnabled(to: string, name: string) {
    const t = templates.mfaEnabledEmail({ name });
    await this.provider.send({ to, ...t });
  }

  async sendMfaDisabled(to: string, name: string) {
    const t = templates.mfaDisabledEmail({ name });
    await this.provider.send({ to, ...t });
  }

  async sendNewLogin(
    to: string,
    name: string,
    meta?: { deviceLabel?: string; ip?: string }
  ) {
    const t = templates.newLoginEmail({ name, ...meta });
    await this.provider.send({ to, ...t });
  }

  async sendNewDevice(to: string, name: string, deviceLabel?: string) {
    const t = templates.newDeviceEmail({ name, deviceLabel });
    await this.provider.send({ to, ...t });
  }

  async sendAccountLinked(to: string, name: string, provider: string) {
    const t = templates.accountLinkedEmail({ name, provider });
    await this.provider.send({ to, ...t });
  }

  async sendEmailChanged(to: string, name: string, newEmail: string) {
    const t = templates.emailChangedEmail({ name, newEmail });
    await this.provider.send({ to, ...t });
  }

  async sendSuspiciousActivity(to: string, name: string, detail: string) {
    const t = templates.suspiciousActivityEmail({ name, detail });
    await this.provider.send({ to, ...t });
  }

  get isConfigured(): boolean {
    return hasResendAuth || env.NODE_ENV === "development";
  }
}

export const emailService = new EmailService();
