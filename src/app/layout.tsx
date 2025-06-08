import "./globals.css";
import { AuthProvider } from "@/lib/contexts/SimpleAuthContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: 'Relait Dashboard',
  description: 'Business analytics and insights dashboard',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.ico?v=1', type: 'image/x-icon' }, // Force cache refresh
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=1" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico?v=1" type="image/x-icon" />
      </head>
      <body style={{ backgroundColor: '#F7F5FF' }}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
