import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ui/ThemeProvider";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";


export const metadata: Metadata = {
  title: "Health Copilot",
  description: "Health and fitness AI assistant",
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
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
        <AppRouterCacheProvider>
            <ThemeProvider>
              <AuthProvider>
                  {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  success: {
                    duration: 3000,
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
