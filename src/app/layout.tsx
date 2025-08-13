import "./globals.css";
import { AuthProvider } from "@/lib/contexts/SimpleAuthContext";
import ClientLayout from "@/components/ClientLayout";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Relait Dashboard',
  description: 'Business analytics and insights dashboard',
  icons: {
    icon: [
      { url: './icon.svg', type: 'image/svg+xml' },
      { url: './icon.ico', type: 'image/x-icon' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: [
      { url: './icon.svg', type: 'image/svg+xml' },
      { url: './icon.ico', type: 'image/x-icon' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    apple: [
      { url: './icon.svg', type: 'image/svg+xml' },
      { url: './icon.ico', type: 'image/x-icon' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#F7F5FF' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
