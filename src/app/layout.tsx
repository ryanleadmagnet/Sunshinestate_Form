import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"]
});

export const metadata: Metadata = {
  title: "Sunshine State Solar - Quote Form",
  description: "Get a free solar quote for your home in just a few minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${roboto.className} text-white min-h-screen selection:bg-[#fdb236]/30`}>
        <div className="flex min-h-[100dvh] flex-col items-center justify-start pt-8 sm:pt-12 px-4 sm:px-8">
          <main className="w-full max-w-[500px] mx-auto overflow-hidden relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
