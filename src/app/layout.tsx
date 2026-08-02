import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "./providers";
import { ThemedToaster } from "@/components/themed-toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedBot — Grounded medical answers",
  description:
    "A retrieval-augmented medical assistant with cited answers powered by the Gale Encyclopedia of Medicine.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark text-scale-md ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme/font-size before first paint so there's
            no flash of the wrong theme. Runs before React hydrates; the
            resulting className mismatch is intentionally covered by
            suppressHydrationWarning on <html> above. Defaults preserved
            (dark, medium font) when nothing is stored or JS is disabled. */}
        <script suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var root=document.documentElement;
              var theme=localStorage.getItem('medbot:theme');
              if(theme==='light'){root.classList.remove('dark');}else{root.classList.add('dark');}
              var size=localStorage.getItem('medbot:font-size');
              root.classList.remove('text-scale-sm','text-scale-md','text-scale-lg');
              root.classList.add('text-scale-'+((size==='sm'||size==='lg')?size:'md'));
            }catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <QueryProvider>
          {children}
          <ThemedToaster />
        </QueryProvider>
      </body>
    </html>
  );
}