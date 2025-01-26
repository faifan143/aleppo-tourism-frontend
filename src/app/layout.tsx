import type { Metadata } from "next";
import "./globals.css";
import LayoutProviders from "@/components/providers/LayoutProviders";

export const metadata: Metadata = {
  title: "Tourism",
  description: "Tourism Places",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
