"use client";
import Navbar from "./Components/pageLayout/navbar";
import Footer from "./Components/pageLayout/footer";
import Article from "./Components/article/page";
import HeroSection from "./Components/pageLayout/herosection";
import FeatureSection from "./Components/pageLayout/featuresection";
import CTASection from "./Components/pageLayout/ctasection";

export default function MyTaxPage() {
  return (
    <div className="bg-[#f6fcff] min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Section */}
      <FeatureSection />

      {/* บทความล่าสุด */}
      <Article />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
