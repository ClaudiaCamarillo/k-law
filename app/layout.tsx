import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: "LegalCompute Pro",
  description: "Calculadora de plazos jurídicos",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F4EFE8'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="320" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
      >
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
