import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: "IQPLAY — The Ultimate Quiz Battle Platform",
  description: "Challenge your friends to custom quiz battles across sports, games, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}