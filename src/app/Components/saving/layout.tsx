// app/layout.tsx
import type { Metadata } from "next";
import Navbar from "../navbar";
import Footer from "../footer";

export const metadata: Metadata = {
  title: "เครื่องคำนวณเงินออม - ธนาคารออมสิน",
  description: "คำนวณการออมเงินเพื่อให้ถึงเป้าหมายทางการเงินของคุณ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased">
        <div className="bg-[#f6fcff] min-h-screen flex flex-col font-bold font-sans">
          <Navbar />
          <main className="flex-1 max-w-6xl mx-auto px-6 py-10">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}