import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});




export const metadata: Metadata = {
  title: "Store It",
  description: "StoreIt - the only storage solution you need",
};

const RootLayout=({
  children,
}: Readonly<{
  children: ReactNode;
}>) =>{
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}
export default RootLayout;