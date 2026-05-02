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
import MarketPulseTicker from "@/components/MarketPulseTicker";
import QuickToolsFAB from "@/components/QuickToolsFAB";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LuxuryLand | Premium Real Estate & Land Marketplace",
    template: "%s | LuxuryLand"
  },
  description: "Discover the world's most innovative high-end real estate platform. Find untouched lands, luxury houses, and premium commercial properties in Tamil Nadu with an unparalleled user experience.",
  keywords: ["real estate", "buy land", "sell land", "luxury real estate", "agricultural land", "commercial property", "premium houses", "Tamil Nadu land", "plots for sale"],
  authors: [{ name: "LuxuryLand" }],
  robots: { index: true, follow: true },
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
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// JSON-LD structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://luxuryland.com/#organization",
      "name": "LuxuryLand",
      "url": "https://luxuryland.com",
      "description": "Premium real estate and land marketplace in Tamil Nadu.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-7094055969",
        "email": "landmarket@gmail.com",
        "contactType": "customer support",
        "availableLanguage": ["English", "Tamil"]
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://luxuryland.com/#website",
      "url": "https://luxuryland.com",
      "name": "LuxuryLand",
      "publisher": { "@id": "https://luxuryland.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://luxuryland.com/?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} min-h-full antialiased`} data-scroll-behavior="smooth">
      <head>
        {/* Structured Data — Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* ★ Flash-prevention: apply theme BEFORE first paint */}
        <script
          dangerouslySetInnerHTML={{ __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('luxuryland-ui');if(s){var p=JSON.parse(s);var t=(p.state&&p.state.theme)||'system';if(t==='system'){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}d.setAttribute('data-theme',t);}else{var m=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';d.setAttribute('data-theme',m);}}catch(e){d.setAttribute('data-theme','light');}})();` }}
        />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        {/* CDN pre-connections for faster image load */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-brand-primary/10">
        <Providers>
          <NextTopLoader
            color="#6366F1"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #6366F1,0 0 5px #6366F1"
          />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '16px',
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid var(--toast-border)',
              },
            }}
          />
          <PWARegistration />
          <Navbar />
          <MarketPulseTicker />

          <main className="flex-1 flex flex-col relative z-10 pb-[100px] md:pb-0">
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
          <QuickToolsFAB />
        </Providers>
      </body>
    </html>
  );
}
