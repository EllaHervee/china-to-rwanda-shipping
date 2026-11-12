import "./globals.css";

export const metadata = {
  title: "CHI-RWA Cargo | China to Rwanda shipping",
  description: "China to Rwanda shipping, cargo quotes, parcel tracking, and booking.",
  icons: {
    icon: "/chi-rwa-logo.jpg",
    shortcut: "/chi-rwa-logo.jpg",
    apple: "/chi-rwa-logo.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
