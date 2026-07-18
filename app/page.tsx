import Hero from "@/components/Hero";
import Pillars from "@/components/Pillars";
import Events from "@/components/Events";
import News from "@/components/News";
import Resources from "@/components/Resources";
import JoinSection from "@/components/JoinSection";
import Footer from "@/components/Footer";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <main className="relative z-10">
        <div className="mx-auto px-6" style={{ maxWidth: "1080px" }}>
          <Hero />
          <Pillars />
          <Events />
          <News />
          <Resources />
          <JoinSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
