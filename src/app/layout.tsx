import "./globals.css";
import { AuthProvider } from "@/lib/contexts/SimpleAuthContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: 'Relait Dashboard',
  description: 'Business analytics and insights dashboard',
  icons: {
    icon: '/favicon.ico',
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
