import Image from "next/image";
import { GridBackground } from "@/components/ui/GridBackground";
import { Hero } from "@/components/ui/Hero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { SelfIntro } from "@/components/ui/SelfIntro";

const projects = [
  { title: "Lumina", category: "Web Design", year: "2024" },
  { title: "Apex", category: "Branding", year: "2024" },
  { title: "Vortex", category: "Development", year: "2023" },
  { title: "Echo", category: "Art Direction", year: "2023" },
];

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={i} index={i} {...project} />
          ))}
        </div>
      </section>

      <footer className="px-4 md:px-12 lg:px-24 py-12 border-t border-foreground/10 flex justify-between items-center text-sm uppercase tracking-widest text-foreground/60">
        <span>© 2025 Portfolio</span>
        <span>Scroll to top</span>
      </footer>
    </main>
  );
}
