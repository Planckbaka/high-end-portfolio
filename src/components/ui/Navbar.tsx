"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { navItems } from "@/config/data";

/**
 * 共享导航链接组件 - 消除桌面端和移动端的代码重复
 */
const NavLinks = memo(function NavLinks({ className, linkClassName }: { 
    className?: string; 
    linkClassName?: string;
}) {
    const pathname = usePathname();
    
    return (
        <>
            {navItems.map((item, index) => (
                <div key={item.path} className={cn("flex items-center gap-2", className)}>
                    <Link
                        href={item.path}
                        className={cn(
                            "transition-colors",
                            pathname === item.path ? "text-foreground" : "text-foreground/60 hover:text-foreground",
                            linkClassName
                        )}
                    >
                        {item.name}
                    </Link>
                    {index < navItems.length - 1 && (
                        <span className="text-foreground/20">/</span>
                    )}
                </div>
            ))}
        </>
    );
});

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 w-full z-50 px-4 md:px-12 lg:px-24 py-6 backdrop-blur-xl bg-background/40 border-b border-foreground/5"
        >
            <div className="flex justify-between items-center pb-4">

                {/* Logo / Brand */}
                <Link href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
                    <Image
                        src="/avatar.jpeg"
                        alt="Portfolio Logo"
                        width={32}
                        height={32}
                        className="rounded-full object-cover border border-foreground/10 group-hover:scale-105 transition-transform"
                    />
                    <span className="font-heading font-bold uppercase tracking-widest text-sm md:text-base text-foreground">
                        Portfolio
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav
                    className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 text-sm uppercase tracking-widest font-medium"
                    aria-label="Main navigation"
                >
                    <NavLinks linkClassName="text-foreground/60 hover:text-foreground" />
                </nav>

                {/* Right Side: Theme Toggle & Copyright */}
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <span className="hidden md:inline-block text-xs uppercase tracking-widest text-foreground/50">© 2025</span>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex justify-center mt-4 gap-4 text-xs uppercase tracking-widest">
                <NavLinks linkClassName="text-foreground/60 hover:text-foreground" />
            </div>
        </motion.header>
    );
}
