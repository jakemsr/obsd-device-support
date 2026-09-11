import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";


const customFont = localFont({
  src: '../public/fonts/Geist-VariableFont_wght.ttf',
  variable: '--font-custom',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "OpenBSD Device Support Database",
  description: "A searchable database of OpenBSD supported devices, including links to driver man pages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${customFont.variable} h-full antialiased`}
    >
      <body className="min-h-svh flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
