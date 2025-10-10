import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import { ThemeProvider } from '@/contexts/theme-context';
import { GtmPageView } from '@/components/analytics/gtm-pageview';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://valupro.lat'),
  applicationName: 'ValuPro',
  title: {
    default: 'ValuPro — Valuación de empresas',
    template: '%s — ValuPro',
  },
  description: 'Valora tu empresa en minutos con DCF, múltiplos y comparables. Gratis y listo para compartir.',
  keywords: [
    'valuación de empresas',
    'valoración empresarial',
    'DCF',
    'múltiplos',
    'comparables',
    'finanzas corporativas',
    'startup',
    'valuación gratis',
  ],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'ValuPro',
    title: 'ValuPro — Valuación de empresas',
    description: 'Valora tu empresa en minutos con DCF, múltiplos y comparables. Gratis y listo para compartir.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'ValuPro',
      },
    ],
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ValuPro — Valuación de empresas',
    description: 'Valora tu empresa en minutos con DCF, múltiplos y comparables. Gratis y listo para compartir.',
    images: ['/opengraph-image.png'],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = 'https://valupro.lat';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ValuPro',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ValuPro',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <ClerkProvider localization={esES}>
      <html lang="es" className={'min-h-full'}>
        <head>
          <Script id="ld-organization" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify(organizationJsonLd)}
          </Script>
          <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify(websiteJsonLd)}
          </Script>
        </head>
        <body className={inter.className}>
          {isProduction && gtmId ? (
            <>
              <Script
                id="gtm-script"
                strategy="afterInteractive"
              >{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode&&f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}</Script>
              <noscript>
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                  height="0"
                  width="0"
                  style={{ display: 'none', visibility: 'hidden' }}
                />
              </noscript>
              <GtmPageView />
            </>
          ) : null}
          <ThemeProvider simpleMode={true}>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
