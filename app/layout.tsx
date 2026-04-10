import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/hooks/use-language';
import { ThemeProvider } from '@/hooks/use-theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Twosung | Automated Maritime Welding',
  description: 'Revolutionizing ship manufacturing with AI vision and robotic precision.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      <body className="bg-white text-black dark:bg-black dark:text-white antialiased transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ErrorBoundary>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                </div>
              </ErrorBoundary>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
