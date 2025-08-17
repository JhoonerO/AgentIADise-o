import React from "react"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider" // ✅ Cambia esta línea

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata = {
  title: "Natal-IA - Tu Asistente Inteligente Premium",
  description: "Asistente de IA moderno con diseño premium estilo Bugatti",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${dmSans.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}