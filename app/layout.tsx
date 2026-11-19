import type { Metadata } from "next";
import "./globals.css";
import "./narrative.css";
import "highlight.js/styles/github-dark.css";
import { ThemeProvider } from '@/components/theme-provider'
import GlobalControls from '@/components/GlobalControls'

import localFont from 'next/font/local'

const inter = localFont({
  src: '../public/fonts/Inter/web/InterVariable.woff2',
  variable: '--font-inter',
})

const firaCode = localFont({
  src: '../public/fonts/FiraCode/woff2/FiraCode-VF.woff2',
  variable: '--font-fira-code',
})

export const metadata: Metadata = {
  title: "Benjamin | Next.js Portfolio",
  description: "A portfolio built with Next.js, showcasing my projects and skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (window.location.pathname.startsWith('/fr')) {
              document.documentElement.lang = 'fr';
            }
          } catch (e) {}
        `}} />
      </head>
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <GlobalControls />
        {children}
      </ThemeProvider>
      </body>
    </html>
  );
}
