import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniSphere - your day, in one place",
  description:
    "A calm, local-first workspace that brings your tasks, students, projects, and money into one readable dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
