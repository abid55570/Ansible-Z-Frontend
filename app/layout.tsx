import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ansible-Z — Ship production infrastructure from templates",
  description:
    "Pick a battle-tested infrastructure template, fill guided variables, and export a complete, runnable Ansible project in minutes — not weeks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
