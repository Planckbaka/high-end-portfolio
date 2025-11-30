import type { NavItem, Project, Technology, Article, SocialLink, ContactDetails, SelfIntroData } from "@/types";

export const navItems: NavItem[] = [
    { name: "Home", path: "/" },
    { name: "Article", path: "/articles" },
    { name: "Contact", path: "/contact" },
];

export const projects: Project[] = [
    {
        id: "lumina",
        title: "Lumina",
        category: "Web Design",
        year: "2024",
        agency: "Obys Agency",
        grid: "Golden Canon",
        margins: "80 px",
        powerLines: "6",
        paddingsSystem: "Used",
        image: "/images/project-1.svg",
        url: "https://github.com/Planckbaka" // 替换为你的实际项目链接
    },
    {
        id: "apex",
        title: "Apex",
        category: "Branding",
        year: "2024",
        agency: "Obys Agency",
        grid: "12 Column",
        margins: "60 px",
        powerLines: "4",
        paddingsSystem: "Used",
        image: "/images/project-2.svg",
        url: "https://github.com/Planckbaka" // 替换为你的实际项目链接
    },
    {
        id: "vortex",
        title: "Vortex",
        category: "Development",
        year: "2023",
        agency: "Obys Agency",
        grid: "Modular",
        margins: "40 px",
        powerLines: "5",
        paddingsSystem: "Used",
        image: "/images/project-3.svg",
        url: "https://github.com/Planckbaka/go-shortenUrl" // 替换为你的实际项目链接
    },
    {
        id: "echo",
        title: "Echo",
        category: "Art Direction",
        year: "2023",
        agency: "Obys Agency",
        grid: "Baseline",
        margins: "100 px",
        powerLines: "3",
        paddingsSystem: "Used",
        image: "/images/project-4.svg",
        url: "https://github.com/Planckbaka" // 替换为你的实际项目链接
    },
];
export const technologies: Technology[] = [
    { id: 1, name: "Go" },
    { id: 2, name: "Cobra" },
    { id: 3, name: "Kubernetes" },
    { id: 4, name: "go-micro" },
    { id: 5, name: "React" },
    { id: 6, name: "Next.js" },
    { id: 7, name: "Tailwind" },
    { id: 8, name: "Git" },
    { id: 9, name: "Docker" },
    { id: 10, name: "Nginx" },
    { id: 11, name: "CloudFlare" },
];

export const articles: Article[] = [
    {
        id: 1,
        title: "The Future of Digital Interfaces",
        date: "Oct 24, 2024",
        category: "Design",
        excerpt: "exploring how spatial computing and AI are reshaping the way we interact with digital products.",
        slug: "future-of-digital-interfaces",
        content: `
            <p>The digital landscape is on the brink of a revolutionary shift. As spatial computing technologies mature and Artificial Intelligence becomes more deeply integrated into our daily workflows, the traditional screen-based interface is being reimagined.</p>
            
            <h3>Beyond the Screen</h3>
            <p>Spatial computing frees us from the constraints of 2D displays. It allows digital content to coexist with the physical world, creating immersive experiences that are more intuitive and engaging. Imagine manipulating data with your hands or walking through a 3D model of a building before it's even constructed.</p>
            
            <h3>AI as a Collaborator</h3>
            <p>Artificial Intelligence is no longer just a tool; it's becoming a collaborator. Generative AI can help designers iterate faster, developers write cleaner code, and users find information more efficiently. The challenge lies in designing interfaces that facilitate this collaboration seamlessly.</p>
            
            <p>As we move forward, the focus must remain on human-centric design. Technology should enhance our capabilities, not replace them. The future of digital interfaces is not just about pixels and code; it's about creating meaningful connections between people and the digital world.</p>
        `
    },
    {
        id: 2,
        title: "Mastering Framer Motion",
        date: "Sep 12, 2024",
        category: "Development",
        excerpt: "A deep dive into creating complex animations with React and Framer Motion for high-performance web apps.",
        slug: "mastering-framer-motion",
        content: `
            <p>Animation is a powerful tool in web design. It guides the user's attention, provides feedback, and adds a layer of polish that distinguishes a good app from a great one. Framer Motion has emerged as the go-to library for React developers looking to implement complex animations with ease.</p>
            
            <h3>Declarative Animations</h3>
            <p>One of the key strengths of Framer Motion is its declarative nature. Instead of imperatively managing animation states, you simply define the target state, and the library handles the rest. This makes code easier to read and maintain.</p>
            
            <h3>Performance Matters</h3>
            <p>Animations should never come at the cost of performance. Framer Motion is optimized to run animations off the main thread whenever possible, ensuring a smooth 60fps experience even on lower-end devices.</p>
            
            <p>Whether you're building a simple micro-interaction or a complex page transition, mastering Framer Motion will elevate your frontend development skills to the next level.</p>
        `
    },
    {
        id: 3,
        title: "Minimalism in 2025",
        date: "Aug 05, 2024",
        category: "Trends",
        excerpt: "Why the 'less is more' philosophy is making a comeback in a world of information overload.",
        slug: "minimalism-in-2025",
        content: `
            <p>In an age where we are constantly bombarded with notifications, ads, and information, minimalism offers a breath of fresh air. It's not just about aesthetic simplicity; it's about clarity of purpose.</p>
            
            <h3>Focus on Content</h3>
            <p>Minimalist design strips away the unnecessary, leaving only what is essential. This forces designers to prioritize content and functionality. Every element on the page must have a reason for being there.</p>
            
            <h3>The Return of Typography</h3>
            <p>With fewer graphical elements to hide behind, typography takes center stage. Bold, expressive typefaces are being used to convey emotion and hierarchy, turning text into a visual element in its own right.</p>
            
            <p>Minimalism in 2025 is not about being boring. It's about being bold, direct, and respectful of the user's time and attention.</p>
        `
    },
    {
        id: 4,
        title: "Building Accessible Web Apps",
        date: "Jul 18, 2024",
        category: "Engineering",
        excerpt: "Practical tips and strategies for ensuring your applications are usable by everyone.",
        slug: "building-accessible-web-apps",
        content: `
            <p>The web was designed to be universal. It is our responsibility as developers to ensure that the applications we build are accessible to everyone, regardless of their abilities or disabilities.</p>
            
            <h3>Semantic HTML</h3>
            <p>Accessibility starts with semantic HTML. Using the correct tags for the job (buttons for actions, links for navigation, headings for structure) provides a solid foundation that assistive technologies can rely on.</p>
            
            <h3>Color and Contrast</h3>
            <p>Visual impairments are common, so ensuring sufficient color contrast is crucial. Tools like the WCAG contrast checker can help you verify that your design meets the necessary standards.</p>
            
            <p>Building accessible web apps is not just a legal requirement; it's a moral one. By designing for inclusivity, we create a better web for everyone.</p>
        `
    }
];

export const socialLinks: SocialLink[] = [
    { name: 'Twitter', url: '#' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/zhang-weihuang-78753b382/' },
    { name: 'Instagram', url: '#' },
    { name: 'GitHub', url: 'https://github.com/Planckbaka' }
];

export const contactDetails: ContactDetails = {
    email: "akiwayne24@gmail.com",
    phone: "+86 13960233985",
    location: "Shanghai, China"
};

export const selfIntroData: SelfIntroData = {
    heading: {
        main: "Crafting Digital",
        sub: "Perfection"
    },
    description: "I'm a creative developer obsessed with the intersection of design and engineering. I build pixel-perfect, performant, and accessible interfaces that delight users. My goal is to turn complex problems into simple, beautiful solutions.",
    roles: ["Creative Dev", "Backend Dev", "Microservices", "Distributed System"],
    stats: [
        { id: 1, value: "01", accent: "+", label: "Years Exp." },
        { id: 2, value: "5", accent: "+", label: "Projects" }
    ]
};
