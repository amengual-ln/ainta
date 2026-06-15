import Hero from "@/components/Hero";
import Pillars from "@/components/Pillars";
import Events from "@/components/Events";
import Resources from "@/components/Resources";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <main className="relative z-10">
        <div className="mx-auto px-6" style={{ maxWidth: "1080px" }}>
          <Hero />
          <Pillars />
          <Events />
          <Resources />
          <JoinSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
