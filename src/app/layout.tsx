import type { Metadata } from "next";
import { Special_Elite, Plus_Jakarta_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";

const special = Special_Elite({
  variable: "--font-special",
  subsets: ["latin"],
  weight: ["400"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Manifesto Generator — print your beliefs",
  description: "Type 3 things you believe. We'll write the broadsheet.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${special.variable} ${jakarta.variable} ${courier.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
