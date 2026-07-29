import Link from "next/link";

import { siteConfig } from "@/config/site";
import { LogoWordmark } from "@/components/marketing/logo-wordmark";

function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function IconDev({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.42 10.05 3.05 14.42l4.37 4.37 1.06-1.06-3.31-3.31 3.31-3.31-1.06-1.06zm9.16 0-1.06 1.06 3.31 3.31-3.31 3.31 1.06 1.06 4.37-4.37-4.37-4.37zM8.84 4.5l-1.06 1.06L14.89 12l-7.11 6.44 1.06 1.06L17.11 12 8.84 4.5z" />
    </svg>
  );
}

const SOCIAL = [
  { href: siteConfig.social.github, label: "GitHub", icon: IconGithub },
  { href: siteConfig.social.linkedin, label: "LinkedIn", icon: IconLinkedIn },
  { href: siteConfig.social.twitter, label: "X", icon: IconX },
  { href: siteConfig.social.devto, label: "Dev.to", icon: IconDev },
  { href: siteConfig.social.email, label: "Email", icon: IconMail },
] as const;

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 py-14 sm:px-6" data-testid="marketing-footer">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <LogoWordmark />

        <p className="mt-4 max-w-md text-[0.82rem] leading-relaxed text-muted-foreground">
          {siteConfig.description}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SOCIAL.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              aria-label={label}
              data-testid={`footer-social-${label.toLowerCase().replace(/\W/g, "-")}`}
              className="flex size-10 items-center justify-center rounded-lg border border-border-subtle bg-surface-3 text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.8rem] text-muted-foreground">
          <li>
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
          </li>
          <li>
            <Link href={siteConfig.links.register} className="hover:text-foreground">
              Start
            </Link>
          </li>
          <li>
            <Link href={siteConfig.links.login} className="hover:text-foreground">
              Sign in
            </Link>
          </li>
        </ul>

        <p className="mt-10 text-[0.72rem] text-muted-foreground">
          © {year} {siteConfig.author}. Not for clinical use — always consult a
          licensed healthcare provider.
        </p>
      </div>
    </footer>
  );
}
