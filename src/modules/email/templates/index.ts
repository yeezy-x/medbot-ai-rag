function layout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>${title}</title></head>
<body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#171717;border:1px solid #262626;border-radius:12px;padding:28px;">
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#14b8a6;">MedBot</p>
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#fafafa;">${title}</h1>
    ${bodyHtml}
    <p style="margin:24px 0 0;font-size:12px;color:#737373;">If you did not request this, you can ignore this email.</p>
  </div>
</body>
</html>`;
}

export function verificationEmail(params: {
  name: string;
  verifyUrl: string;
}) {
  const subject = "Verify your MedBot email";
  const text = `Hi ${params.name},\n\nVerify your email: ${params.verifyUrl}\n\nThis link expires in 24 hours.`;
  const html = layout(
    "Verify your email",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, confirm your email to secure your account.</p>
     <p style="margin:24px 0;"><a href="${params.verifyUrl}" style="display:inline-block;background:#14b8a6;color:#042f2e;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Verify email</a></p>
     <p style="font-size:12px;color:#737373;word-break:break-all;">${params.verifyUrl}</p>`
  );
  return { subject, html, text };
}

export function passwordResetEmail(params: { resetUrl: string; host: string }) {
  const subject = "Reset your MedBot password";
  const text = `Reset your MedBot password for ${params.host}: ${params.resetUrl}\n\nThis link expires in 1 hour.`;
  const html = layout(
    "Reset your password",
    `<p style="color:#a3a3a3;line-height:1.5;">Choose a new password for <strong style="color:#fafafa;">${params.host}</strong>.</p>
     <p style="margin:24px 0;"><a href="${params.resetUrl}" style="display:inline-block;background:#14b8a6;color:#042f2e;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;">Choose new password</a></p>
     <p style="font-size:12px;color:#737373;word-break:break-all;">${params.resetUrl}</p>`
  );
  return { subject, html, text };
}

export function passwordChangedEmail(params: { name: string }) {
  const subject = "Your MedBot password was changed";
  const text = `Hi ${params.name}, your MedBot password was changed. If this wasn't you, reset it immediately.`;
  const html = layout(
    "Password changed",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, your password was changed successfully. If you did not do this, reset your password and contact support.</p>`
  );
  return { subject, html, text };
}

export function mfaEnabledEmail(params: { name: string }) {
  const subject = "Two-factor authentication enabled";
  const text = `Hi ${params.name}, MFA is now enabled on your MedBot account.`;
  const html = layout(
    "MFA enabled",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, two-factor authentication is now active on your account.</p>`
  );
  return { subject, html, text };
}

export function mfaDisabledEmail(params: { name: string }) {
  const subject = "Two-factor authentication disabled";
  const text = `Hi ${params.name}, MFA was disabled on your MedBot account.`;
  const html = layout(
    "MFA disabled",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, two-factor authentication was disabled. If this wasn't you, secure your account immediately.</p>`
  );
  return { subject, html, text };
}

export function newLoginEmail(params: {
  name: string;
  deviceLabel?: string;
  ip?: string;
}) {
  const subject = "New sign-in to MedBot";
  const device = params.deviceLabel ?? "Unknown device";
  const ip = params.ip ?? "Unknown IP";
  const text = `Hi ${params.name}, new sign-in from ${device} (${ip}).`;
  const html = layout(
    "New sign-in",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, we noticed a new sign-in.</p>
     <ul style="color:#a3a3a3;"><li>Device: ${device}</li><li>IP: ${ip}</li></ul>`
  );
  return { subject, html, text };
}

export function newDeviceEmail(params: {
  name: string;
  deviceLabel?: string;
}) {
  const subject = "New trusted device on MedBot";
  const device = params.deviceLabel ?? "Unknown device";
  const text = `Hi ${params.name}, a new device was trusted: ${device}.`;
  const html = layout(
    "New trusted device",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, device <strong style="color:#fafafa;">${device}</strong> can skip MFA for 30 days.</p>`
  );
  return { subject, html, text };
}

export function accountLinkedEmail(params: {
  name: string;
  provider: string;
}) {
  const subject = `${params.provider} linked to MedBot`;
  const text = `Hi ${params.name}, your ${params.provider} account was linked.`;
  const html = layout(
    "Account linked",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, <strong style="color:#fafafa;">${params.provider}</strong> is now linked to your MedBot account.</p>`
  );
  return { subject, html, text };
}

export function emailChangedEmail(params: {
  name: string;
  newEmail: string;
}) {
  const subject = "Your MedBot email was changed";
  const text = `Hi ${params.name}, your email was changed to ${params.newEmail}.`;
  const html = layout(
    "Email changed",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, your account email is now <strong style="color:#fafafa;">${params.newEmail}</strong>.</p>`
  );
  return { subject, html, text };
}

export function suspiciousActivityEmail(params: {
  name: string;
  detail: string;
}) {
  const subject = "Suspicious activity on MedBot";
  const text = `Hi ${params.name}, ${params.detail}`;
  const html = layout(
    "Suspicious activity",
    `<p style="color:#a3a3a3;line-height:1.5;">Hi ${params.name}, ${params.detail}</p>`
  );
  return { subject, html, text };
}
