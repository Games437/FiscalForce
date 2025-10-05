import Navbar from "../pageLayout/navbar";
import Footer from "../pageLayout/footer";

export default function TaxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f6fcff] min-h-screen flex flex-col font-bold font-sans">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-10">{children}</main>
      <Footer />
    </div>
  );
}
