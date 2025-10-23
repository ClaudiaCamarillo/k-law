import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./mobile-force.css";
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
  initialScale: 0.3,
  maximumScale: 2.0,
  userScalable: true,
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
        <meta name="viewport" content="width=device-width, initial-scale=0.3, maximum-scale=2.0, user-scalable=yes" />
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
