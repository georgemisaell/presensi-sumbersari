import "./globals.css";

export const metadata = {
  title: "Presensi Sumbersari",
  description: "Aplikasi Presensi Online Sumbersari",
  icons: {
    icon: '/logo-kabupaten-madiun.webp',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <div style={{
          position: 'fixed',
          bottom: '15px',
          left: '0',
          width: '100%',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'rgba(100, 116, 139, 0.8)',
          pointerEvents: 'none',
          zIndex: 9999,
          fontWeight: '500',
          letterSpacing: '0.05em'
        }}>
          Dibuat oleh BBK 8 UNAIR 2026
        </div>
      </body>
    </html>
  );
}
