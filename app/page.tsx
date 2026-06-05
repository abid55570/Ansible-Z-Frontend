import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import ProductPreview from "@/components/landing/ProductPreview";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TemplatesShowcase from "@/components/landing/TemplatesShowcase";
import BuildingBlocks from "@/components/landing/BuildingBlocks";
import Benefits from "@/components/landing/Benefits";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <ProductPreview />
      <Features />
      <HowItWorks />
      <TemplatesShowcase />
      <BuildingBlocks />
      <Benefits />
      <CTA />
      <Footer />
    </main>
  );
}
