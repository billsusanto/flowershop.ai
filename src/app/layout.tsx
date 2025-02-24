import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowershop.ai",
  description: "Flowershop.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body className={`flex justfiy-center p-6 bg-white {inter.className}`}>
        {children}
      </body>
    </html>
  );
}
