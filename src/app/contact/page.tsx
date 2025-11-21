"use client";

import { GridBackground } from "@/components/ui/GridBackground";
import { motion } from "framer-motion";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { contactDetails, socialLinks } from "@/config/data";

export default function ContactPage() {
    return (
        <main className="relative w-full min-h-screen overflow-hidden pt-32 pb-24 px-4 md:px-12 lg:px-24 flex flex-col justify-between">
            <GridBackground />

            <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-[10vw] md:text-[8vw] leading-[0.85] font-heading font-bold uppercase tracking-tighter mb-16 md:mb-24">
                        Let's <br /> <span className="text-accent">Connect</span>
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-12"
                    >
                        <div>
                            <h3 className="text-sm uppercase tracking-widest text-foreground/60 mb-4">Contact Details</h3>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors duration-300">
                                        <Mail size={18} />
                                    </div>
                                    <span className="text-lg md:text-xl font-light">{contactDetails.email}</span>
                                </li>
                                <li className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors duration-300">
                                        <Phone size={18} />
                                    </div>
                                    <span className="text-lg md:text-xl font-light">{contactDetails.phone}</span>
                                </li>
                                <li className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-accent group-hover:text-black transition-colors duration-300">
                                        <MapPin size={18} />
                                    </div>
                                    <span className="text-lg md:text-xl font-light">{contactDetails.location}</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm uppercase tracking-widest text-foreground/60 mb-4">Socials</h3>
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.map((social) => (
                                    <a key={social.name} href={social.url} className="px-6 py-3 border border-foreground/10 rounded-full hover:bg-foreground hover:text-background transition-all duration-300 uppercase text-xs tracking-widest flex items-center gap-2 group">
                                        {social.name}
                                        <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="bg-foreground/5 border border-foreground/10 p-8 md:p-12"
                    >
                        <h3 className="text-2xl font-heading font-bold uppercase mb-8">Send a Message</h3>
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-foreground/60">Name</label>
                                <input type="text" className="w-full bg-foreground/5 border-b border-foreground/20 py-3 focus:outline-none focus:border-accent transition-colors text-lg font-light" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-foreground/60">Email</label>
                                <input type="email" className="w-full bg-foreground/5 border-b border-foreground/20 py-3 focus:outline-none focus:border-accent transition-colors text-lg font-light" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-foreground/60">Message</label>
                                <textarea rows={4} className="w-full bg-foreground/5 border-b border-foreground/20 py-3 focus:outline-none focus:border-accent transition-colors text-lg font-light resize-none" placeholder="Tell me about your project..." />
                            </div>
                            <button type="button" className="w-full bg-foreground text-background py-4 uppercase tracking-widest text-xs font-bold hover:bg-accent hover:text-white transition-colors duration-300 mt-4">
                                Send Message
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
