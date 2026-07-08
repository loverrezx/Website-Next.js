import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "./components/Navbar";
import OfflineOverlay from "./components/OfflineOverlay";
import DynamicTitle from "./components/DynamicTitle";
import DiscordSessionHandler from "./components/DiscordSessionHandler";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NextStore",
  description: "พบกับสินค้ายอดนิยม บริการเติมเงินที่สะดวกรวดเร็ว และบริการช่วยเหลือระดับมืออาชีพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={ibmPlexSansThai.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='dark'){d.setAttribute('data-theme','dark');d.classList.add('dark');}else if(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches){d.setAttribute('data-theme','dark');d.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextTopLoader color="var(--primary)" showSpinner={false} height={3} />
        <DynamicTitle />
        <Suspense><DiscordSessionHandler /></Suspense>
        <Navbar />
        <OfflineOverlay />
        {children}
        <Toaster closeButton richColors position="top-right" />
      </body>
    </html>
  );
}
