import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthInit from "@/components/AuthInit";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareBar from "@/components/CompareBar";
import PWARegistration from "@/components/PWARegistration";
import MobileBottomNav from "@/components/MobileBottomNav";
import PageTransitionProvider from "@/components/PageTransitionProvider";
import InstallAppBanner from "@/components/InstallAppBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuxuryLand | Premium Real Estate Marketplace",
  description: "High-end, innovative real estate marketplace for premium properties and land.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LandApp",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} min-h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-primary/10">
        <Providers>
          <Toaster position="top-right" />
          <PWARegistration />
          <Navbar />
          
          {/* Ultra-Luxurious Decorative Orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[100px]" />
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-brand-secondary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] bg-brand-gold/10 rounded-full blur-[140px]" />
          </div>

          <main className="flex-1 flex flex-col relative z-10 pb-[160px] md:pb-0">
            <AuthInit>
              <ProtectedRoute>
                <PageTransitionProvider>
                  {children}
                </PageTransitionProvider>
              </ProtectedRoute>
            </AuthInit>
          </main>
          <Footer />
          <MobileBottomNav />
          <CompareBar />
          <InstallAppBanner />
        </Providers>
      </body>
    </html>
  );
}
