import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AlgoSpace — Visual Algorithm Lab",
  description:
    "Understand algorithms by watching them work. An interactive Design and Analysis of Algorithms laboratory.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
