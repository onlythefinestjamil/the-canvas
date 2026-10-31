import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Canvas — AI Creative Studio",
  description: "Self-hosted AI creative generation platform. Images, video, voiceover, and compositing — all in one pipeline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-gray-100 antialiased">{children}</body>
    </html>
  );
}
