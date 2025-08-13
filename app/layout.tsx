import type { Metadata } from "next";
import "./globals.css";
import Header from '@/components/Header'
import BG from '@/components/Background'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/theme-provider'
import localFont from 'next/font/local'


const geistSans = localFont({
  src: '../public/fonts/Sans/Geist-Regular.woff2',
  variable: '--font-geist-sans',
})

const geistMono = localFont({
  src: '../public/fonts/Mono/GeistMono-Regular.woff2',
  variable: '--font-geist-mono',
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
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary overflow-x-hidden `}
      >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header />

        <BG />
          {children}
        <Footer/>
      </ThemeProvider>
      </body>
    </html>
  );
}
