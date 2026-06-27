import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VoiceOps", template: "%s — VoiceOps" },
  description: "AI Voice Agent Mission Control. Real-time browser automation powered by Groq + Playwright.",
  keywords: ["voice agent", "AI", "mission control", "automation", "LLM", "Groq", "Playwright"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
