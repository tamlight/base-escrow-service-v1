import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "./components/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Base Escrow",
  description: "Secure On-Chain P2P Trading",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
