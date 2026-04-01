'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CardPageConfig } from '@/types/page';

const markdownComponents = {
    p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
    a: ({ ...props }) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm"
        />
    ),
    blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
        <blockquote className="border-l-4 border-accent/50 pl-4 italic my-4 text-neutral-600 dark:text-neutral-500">
            {children}
        </blockquote>
    ),
    strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
    em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
    code: ({ children }: React.ComponentProps<'code'>) => (
        <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
    ),
};

function CollapsibleCard({ item, index, embedded }: { item: CardPageConfig['items'][number]; index: number; embedded: boolean }) {
    const [open, setOpen] = useState(false);
    const hasCollapsible = !!(item.content || item.tags);

    return (
        <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className={`bg-white dark:bg-neutral-900 ${embedded ? "p-4" : "p-6"} rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200`}
        >
            <button
                className="w-full text-left"
                onClick={() => hasCollapsible && setOpen(!open)}
                style={{ cursor: hasCollapsible ? 'pointer' : 'default' }}
            >
                <div className="flex justify-between items-start">
                    <h3 className={`${embedded ? "text-lg" : "text-xl"} font-semibold text-primary flex-1 pr-2`}>{item.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {item.date && (
                            <span className="text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                                {item.date}
                            </span>
                        )}
                        {hasCollapsible && (
                            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                            </motion.div>
                        )}
                    </div>
                </div>
                {item.subtitle && (
                    <p className={`${embedded ? "text-sm" : "text-base"} text-accent font-medium mt-1`}>{item.subtitle}</p>
                )}
            </button>

            <AnimatePresence initial={false}>
                {open && hasCollapsible && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3">
                            {item.content && (
                                <div className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-500 leading-relaxed`}>
                                    <ReactMarkdown components={markdownComponents}>
                                        {item.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                            {item.tags && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1 rounded border border-neutral-100 dark:border-neutral-800">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className={embedded ? "mb-4" : "mb-8"}>
                <h1 className={`${embedded ? "text-2xl" : "text-4xl"} font-serif font-bold text-primary mb-4`}>{config.title}</h1>
                {config.description && (
                    <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>
                            {config.description}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <div className={`grid ${embedded ? "gap-4" : "gap-6"}`}>
                {config.items.map((item, index) => (
                    <CollapsibleCard key={index} item={item} index={index} embedded={embedded} />
                ))}
            </div>
        </motion.div>
    );
}
