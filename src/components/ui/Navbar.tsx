"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
    { name: "Home", path: "/" },
    { name: "Article", path: "/articles" },
    { name: "Contact", path: "/contact" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 w-full z-50 px-4 md:px-12 lg:px-24 py-6 mix-blend-difference text-white"
        >
            <div className="flex justify-between items-center border-b border-white/20 pb-4">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white" />
                    <span className="font-heading font-bold uppercase tracking-widest text-sm">
                        Portfolio
                    </span>
                </div>

                {/* Navigation - Breadcrumb Style */}
                <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 text-sm uppercase tracking-widest font-medium">
                    {navItems.map((item, index) => (
                        <div key={item.path} className="flex items-center gap-2">
                            <Link
                                href={item.path}
                                className={cn(
                                    "hover:text-white/70 transition-colors",
                                    pathname === item.path ? "text-white" : "text-white/60"
                                )}
                            >
                                {item.name}
                            </Link>
                            {index < navItems.length - 1 && (
                                <span className="text-white/20">/</span>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Right Side: Theme Toggle & Copyright */}
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <span className="hidden md:inline-block text-xs uppercase tracking-widest text-white/60">© 2025</span>
                </div>
            </div>

            {/* Mobile Nav (Simple Stack) */}
            <div className="md:hidden flex justify-center mt-4 gap-4 text-xs uppercase tracking-widest">
                {navItems.map((item, index) => (
                    <div key={item.path} className="flex items-center gap-2">
                        <Link
                            href={item.path}
                            className={cn(
                                pathname === item.path ? "text-white" : "text-white/60"
                            )}
                        >
                            {item.name}
                        </Link>
                        {index < navItems.length - 1 && (
                            <span className="text-white/20">/</span>
                        )}
                    </div>
                ))}
            </div>
        </motion.header>
    );
}
