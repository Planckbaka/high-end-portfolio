import { GridBackground } from "@/components/ui/GridBackground";
import { Hero } from "@/components/ui/Hero";
import { ProjectList } from "@/components/ui/ProjectList";
import { SelfIntro } from "@/components/ui/SelfIntro";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { WritingBacklog } from "@/components/ui/WritingBacklog";
import { projects } from "@/config/data";

export default function Home() {
  return (
    <div className="relative w-full overflow-x-clip">
      <GridBackground />

      <Hero />

      <SelfIntro />

      {/* id is the scroll target for the hero cue */}
      <section
        id="work"
        className="gutter section-y scroll-mt-32"
        aria-labelledby="work-heading"
        style={{ contentVisibility: "auto", containIntrinsicSize: "auto 1000px" }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 md:mb-24">
          <h2
            id="work-heading"
            className="text-display-lg font-heading uppercase"
          >
            Selected <br /> <span className="text-accent">Works</span>
          </h2>
          <p className="text-sm leading-relaxed text-foreground/60 max-w-xs md:text-right">
            A collection of projects that define my style and approach to digital design.
          </p>
        </div>

        <ProjectList projects={projects} />
      </section>

      <section
        className="gutter pb-24 md:pb-32"
        aria-labelledby="backlog-heading"
        style={{ contentVisibility: "auto", containIntrinsicSize: "auto 1000px" }}
      >
        <WritingBacklog />
      </section>

      <SiteFooter />
    </div>
  );
}
