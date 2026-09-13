import { Theme } from '@astryxdesign/core';
import { butterTheme } from '@astryxdesign/theme-butter/built';
import { Outfit, Sarina } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const sarina = Sarina({ weight: '400', subsets: ['latin'], variable: '--font-sarina' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${outfit.variable} ${sarina.variable}`}>
      <body>
        <Theme theme={butterTheme} mode="system">
          {children}
        </Theme>
      </body>
    </html>
  );
}
