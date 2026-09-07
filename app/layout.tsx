import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import BG from '@/components/Background'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/ModeToggle'

import localFont from 'next/font/local'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
    <html lang="en" data-theme="light" suppressHydrationWarning>
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
        <BG />
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
        {children}
      </ThemeProvider>
      </body>
    </html>
  );
}
