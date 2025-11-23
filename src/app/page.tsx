import Image from "next/image";
import { GridBackground } from "@/components/ui/GridBackground";
import { Hero } from "@/components/ui/Hero";
import { ProjectList } from "@/components/ui/ProjectList";
import { SelfIntro } from "@/components/ui/SelfIntro";
import { projects } from "@/config/data";

export default function Home() {
  return (
    <main className="relative w-full overflow-hidden">
      <GridBackground />

      <Hero />

      <SelfIntro />

      <section className="px-4 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24">
          <h2 className="text-[10vw] md:text-[6vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter">
            Selected <br /> <span className="text-accent">Works</span>
          </h2>
          <p className="text-sm uppercase tracking-widest text-foreground/60 max-w-xs mt-8 md:mt-0">
            A collection of projects that define my style and approach to digital design.
          </p>
        </div>

        <ProjectList projects={projects} />
      </section>

      <footer className="px-4 md:px-12 lg:px-24 py-12 border-t border-foreground/10 flex justify-between items-center text-sm uppercase tracking-widest text-foreground/60">
        <span>© 2025 Portfolio</span>
        <span>Scroll to top</span>
      </footer>
    </main>
  );
}
