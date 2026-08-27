/**
 * Site metadata & social links for the public marketing site.
 * Update `social` with your real profiles.
 */
export const siteConfig = {
  name: "MedBot",
  tagline: "Grounded medical answers with citations",
  description:
    "Retrieval-augmented medical assistant over the Gale Encyclopedia of Medicine — pgvector, Ollama, and page-level sources.",
  author: "MedBot Team",
  social: {
    github: "https://github.com/yeezy-x",
    linkedin: "https://www.linkedin.com/in/sudhir31",
    twitter: "https://x.com/",
    devto: "https://dev.to/",
    email: "rihdus3110@gmail.com",
  },
  links: {
    register: "/sign-up",
    login: "/sign-in",
    dashboard: "/dashboard",
    chat: "/chat",
  },
} as const;

export type SiteConfig = typeof siteConfig;
