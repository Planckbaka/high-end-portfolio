import type { NavItem, Project, Technology, SocialLink, ContactDetails, SelfIntroData, UpcomingTopic } from "@/types";

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

export const upcomingTopics: UpcomingTopic[] = [
    {
        id: "transformer-scratch",
        title: "从零构建 Transformer Decoder：PyTorch 手写与 Tensor 维度流转艺术",
        category: "Transformer & Deep Learning",
        status: "drafting",
        estimatedDate: "2026-06-15",
        description: "沿着 Karpathy 的 2026 教程，用 PyTorch 纯手写多头自注意力机制（MHA），深度拆解序列长度、通道与头数在计算过程中的三维 Tensor 变换拓扑结构。"
    },
    {
        id: "agent-dag",
        title: "多 Agent 协同编排引擎：基于 Python 状态机与并发 DAG 的调度设计",
        category: "Agent Orchestration",
        status: "outline",
        estimatedDate: "2026-07-05",
        description: "结合 Python 后端并发与状态机设计，拆解多 Agent 协同中的拓扑执行图（DAG）、记忆切片共享机制，以及异步任务调度器（Scheduler）的设计模式。"
    },
    {
        id: "go-harness",
        title: "大模型评测基准设计：基于 Go 高并发的吞吐量与准确率评测架构",
        category: "AI Harness Systems",
        status: "planning",
        estimatedDate: "2026-07-25",
        description: "如何利用 Go 语言的高并发性能（Goroutine/Channel），构建支持数万 Token/s 并发打分、Prompt 动态渲染、精度对齐与自动化回归的 LLM Harness 评测系统。"
    },
    {
        id: "vllm-mem",
        title: "AI Infra 极速探索：vLLM 核心技术（PagedAttention）原理与显存优化",
        category: "AI Infrastructure",
        status: "planning",
        estimatedDate: "2026-08-15",
        description: "解密大模型推理优化核心。分析虚拟内存管理（Paging）如何应用在 KV Cache 显存分配中，彻底消除碎片，将显存吞吐量压榨至极限。"
    },
    {
        id: "autograd-go-py",
        title: "零依赖手写自动求导：计算图反向传播的 Go 与 Python 跨界实现",
        category: "AI Fundamentals",
        status: "planning",
        estimatedDate: "2026-09-05",
        description: "对比 Python 的“运算符重载”与 Go 的“链式方法链”，手写最精简的 Autograd 自动求导引擎，彻底讲清动态计算图、拓扑排序与链式法则求偏导的本质。"
    }
];


