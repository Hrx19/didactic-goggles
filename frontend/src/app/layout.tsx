import type { Metadata } from "next";
import { Space_Grotesk, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingSocial from "@/components/FloatingSocial";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-head",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalchakra Learning Academy - Learn Coding Online",
  description: "Master programming with expert-led courses",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://frontend-chi-eosin-36.vercel.app'),
  openGraph: {
    title: "Kalchakra Learning Academy",
    description: "Master programming with expert-led courses",
    url: "/",
    siteName: "Kalchakra Learning Academy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <FloatingSocial />
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </body>
    </html>
  );
}
