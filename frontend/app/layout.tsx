import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import PWARegistration from "@/components/pwa/PWARegistration";
import Script from "next/script";


export const metadata: Metadata = {
  title: "Health Copilot",
  description: "Health and fitness AI assistant",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/health-copilot-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Health Copilot",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#087f8c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <AppRouterCacheProvider>
            <ThemeProvider>
              <AuthProvider>
                  <PWARegistration />
                  {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  success: {
                    duration: 5000,
                  },
                  error: {
                    duration: 7000,
                  },
                }}
              />
              </AuthProvider>
            </ThemeProvider>
        </AppRouterCacheProvider>
        </body>
    </html>
  );
}
