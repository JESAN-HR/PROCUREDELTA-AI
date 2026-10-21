import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ProcureDelta AI — Making Public Procurement Understandable",
  description:
    "Local, source-linked procurement document comparison. No API key required.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
