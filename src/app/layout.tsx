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
  title: {
    default: "LuxuryLand | Premium Real Estate & Land Marketplace",
    template: "%s | LuxuryLand"
  },
  description: "Discover the world's most innovative high-end real estate platform. Find untouched lands, luxury houses, and premium commercial properties with an unparalleled user experience.",
  keywords: ["real estate", "buy land", "sell land", "luxury real estate", "agricultural land", "commercial property", "premium houses"],
  authors: [{ name: "LuxuryLand" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://luxuryland.com",
    title: "LuxuryLand | Premium Real Estate & Land",
    description: "Discover the world's most innovative high-end real estate platform. Find untouched lands and premium properties.",
    siteName: "LuxuryLand"
  },
  twitter: {
    card: "summary_large_image",
    title: "LuxuryLand | Premium Real Estate",
    description: "Discover the world's most innovative high-end real estate platform."
  },
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
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} min-h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-primary/10">
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '16px',
                background: '#fff',
                color: '#1C1C1E',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.04)',
              },
            }}
          />
          <PWARegistration />
          <Navbar />

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
