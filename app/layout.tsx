import React from 'react';
import { AppStoreProvider } from '../src/store/appStore';
import './globals.css';

export const metadata = {
  title: 'Quiz library',
  description: 'A quiz study app for focused practice and memorization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppStoreProvider>
          {children}
        </AppStoreProvider>
      </body>
    </html>
  );
}
