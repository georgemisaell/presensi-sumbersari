import "./globals.css";

export const metadata = {
  title: "Presensi Sumbersari",
  description: "Aplikasi Presensi Online Sumbersari",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
