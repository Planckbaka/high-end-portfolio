import type {
  NavItem,
  Project,
  SocialLink,
  ContactDetails,
  SelfIntroData,
  Technology,
  UpcomingTopic,
} from "@/types";
export const navItems: NavItem[] = [
  { name: "Writing", path: "/articles" },
  { name: "Projects", path: "/projects" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];
export const projects: Project[] = [
  {
    id: "pi-go",
    title: "pi-go",
    category: "Agent engineering",
    description:
      "Exploring the internals of a terminal coding agent through a Go rewrite: tools, sessions, and explicit failure handling.",
    tags: ["Go", "Agent loops", "Protocol compatibility"],
    problem:
      "An agent coordinates model output, tool execution, and session state. Errors at those boundaries can outlive the request that caused them.",
    contribution:
      "The local pi-go project rewrites the upstream pi agent in Go. This site examines its agent loop and extracts a smaller, independently tested teaching implementation. It does not claim authorship of the upstream design.",
    tradeoff:
      "Behavioral compatibility is more useful than an attractive new abstraction when porting an existing protocol. The lab deliberately reduces the protocol surface so its lifecycle is inspectable.",
    validation:
      "The accompanying agent-loop lab tests tool results, malformed arguments, model errors, cancellation, and bounded termination using a deterministic model substitute.",
    limitations:
      "The teaching lab is not the complete pi-go application. Provider compatibility and production behavior require their own validation.",
    articles: ["go-agent-loop"],
    url: "https://github.com/earendil-works/pi-mono",
  },
  {
    id: "engineering-labs",
    title: "Engineering Labs",
    category: "Executable explanations",
    description:
      "Six small experiments connecting backend reliability, Python concurrency, and the mechanics of model inference.",
    tags: ["Go", "Python", "CPU PyTorch"],
    problem:
      "An explanation is difficult to trust when its code, assumptions, and measurements cannot be inspected together.",
    contribution:
      "A companion lab collection built for these articles: bounded admission, an agent loop, structured concurrency, streaming measurements, causal attention, and a cached decoder.",
    tradeoff:
      "Small, deterministic fixtures make correctness visible. CPU runs keep the first iteration reproducible without paid APIs or downloaded model weights.",
    validation:
      "Behavioral tests cover failure paths; numerical comparisons check attention and cached decoding. Reproduction commands and raw measurement records accompany the labs.",
    limitations:
      "Synthetic streams are not model tokens. Tiny random-weight decoders do not demonstrate language quality, GPU throughput, or a production serving stack.",
    articles: [
      "go-bounded-concurrency",
      "python-structured-concurrency",
      "python-streaming-measurement",
      "causal-attention",
      "kv-cache-tiny-decoder",
    ],
  },
];
export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: "https://github.com/Planckbaka" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/zhang-weihuang-78753b382/" },
];
export const contactDetails: ContactDetails = {
  email: "akiwayne24@gmail.com",
  phone: "+86 13960233985",
  location: "Shanghai, China",
};
// Retained for source compatibility with unused legacy components.
export const selfIntroData: SelfIntroData = {
  heading: { main: "Backend systems", sub: "and model inference" },
  description:
    "I explore Go, Python, and model-serving systems through implementations and reproducible experiments.",
  roles: ["Go", "Python", "LLM systems"],
  stats: [],
};
export const technologies: Technology[] = [
  { id: 1, name: "Go" },
  { id: 2, name: "Python" },
  { id: 3, name: "PyTorch" },
];
export const upcomingTopics: UpcomingTopic[] = [];
