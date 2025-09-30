import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'PolicyPulse - 智能政策分析平台',
    template: '%s | PolicyPulse'
  },
  description: '基于AI的政策和招标信息智能分析SaaS平台，为您提供精准的政策洞察和商机发现服务',
  keywords: ['政策分析', '招标信息', 'AI智能', '商机发现', '政策洞察'],
  authors: [{ name: 'PolicyPulse Team' }],
  creator: 'PolicyPulse',
  publisher: 'PolicyPulse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://policypulse.com'),
  openGraph: {
    title: 'PolicyPulse - 智能政策分析平台',
    description: '基于AI的政策和招标信息智能分析SaaS平台',
    url: 'https://policypulse.com',
    siteName: 'PolicyPulse',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PolicyPulse',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PolicyPulse - 智能政策分析平台',
    description: '基于AI的政策和招标信息智能分析SaaS平台',
    images: ['/twitter-image.png'],
    creator: '@policypulse',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}