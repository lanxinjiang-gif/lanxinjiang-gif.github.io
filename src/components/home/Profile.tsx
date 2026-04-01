'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    EnvelopeIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { Github, Linkedin } from 'lucide-react';
import type { SiteConfig } from '@/lib/config';
import { useMessages } from '@/lib/i18n/useMessages';

const OrcidIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
    </svg>
);

interface ProfileProps {
    author: SiteConfig['author'];
    social: SiteConfig['social'];
    features: SiteConfig['features'];
    researchInterests?: string[];
}

export default function Profile({ author, social, features, researchInterests }: ProfileProps) {
    const messages = useMessages();
    const [showEmail, setShowEmail] = useState(false);

    useEffect(() => {
        if (!features.enable_likes) return;
    }, [features.enable_likes]);

    const socialLinks = [
        ...(social.email ? [{ name: 'Email', href: 'mailto:' + social.email, icon: EnvelopeIcon, isEmail: true }] : []),
        ...(social.google_scholar ? [{ name: 'Google Scholar', href: social.google_scholar, icon: AcademicCapIcon }] : []),
        ...(social.orcid ? [{ name: 'ORCID', href: social.orcid, icon: OrcidIcon }] : []),
        ...(social.github ? [{ name: 'GitHub', href: social.github, icon: Github }] : []),
        ...(social.linkedin ? [{ name: 'LinkedIn', href: social.linkedin, icon: Linkedin }] : []),
    ];

    return (
        <div className="sticky top-24">
            {/* Profile Image */}
            <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Image
                    src={author.avatar}
                    alt={author.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover object-[32%_center]"
                    priority
                />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
                <p className="text-lg text-accent font-medium mb-1">{author.title}</p>
                <p className="text-neutral-600 mb-2">{author.institution}</p>
            </div>

            {/* Contact Links */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 relative px-2">
                {socialLinks.map((link) => {
                    const IconComponent = link.icon;
                    if (link.isEmail) {
                        return (
                            <div key={link.name} className="relative">
                                <button
                                    onMouseEnter={() => setShowEmail(true)}
                                    onMouseLeave={() => setShowEmail(false)}
                                    className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-accent transition-colors duration-200"
                                    aria-label="Email"
                                >
                                    <EnvelopeIcon className="h-5 w-5" />
                                </button>
                                <AnimatePresence>
                                    {showEmail && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-800 text-white px-4 py-3 rounded-lg text-sm shadow-lg whitespace-nowrap z-20"
                                            onMouseEnter={() => setShowEmail(true)}
                                            onMouseLeave={() => setShowEmail(false)}
                                        >
                                            <p className="text-xs text-neutral-300 mb-2 text-center">{social.email}</p>
                                            <a
                                                href={'mailto:' + social.email}
                                                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 w-full"
                                            >
                                                <EnvelopeIcon className="h-3.5 w-3.5" />
                                                <span>Send Email</span>
                                            </a>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }
                    return (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-accent transition-colors duration-200"
                            aria-label={link.name}
                        >
                            <IconComponent className="h-5 w-5" />
                        </a>
                    );
                })}
            </div>

            {/* Research Interests */}
            {researchInterests && researchInterests.length > 0 && (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mb-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <h3 className="font-semibold text-primary mb-3">{messages.profile.researchInterests}</h3>
                    <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-500">
                        {researchInterests.map((interest, index) => (
                            <div key={index}>{interest}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
