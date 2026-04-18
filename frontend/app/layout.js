import '@/styles/globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'StreamVault',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Your video streaming platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a26',
                color: '#e8e8f0',
                border: '1px solid rgba(255,255,255,0.08)',
              },
              success: { iconTheme: { primary: '#ff3d24', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
