import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({ 
  weight: ["400", "700"], 
  subsets: ["latin"],
  variable: '--font-space-mono'
});

export const metadata = {
  title: "Layr | AI Overlay Tool",
  description: "AI text writer on images",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceMono.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}