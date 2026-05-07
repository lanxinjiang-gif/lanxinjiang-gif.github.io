'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { CardPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';

const markdownComponents = {
  p: ({ children }: React.ComponentProps<'p'>) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }: React.ComponentProps<'ul'>) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
  ol: ({ children }: React.ComponentProps<'ol'>) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
  li: ({ children }: React.ComponentProps<'li'>) => <li className="mb-1">{children}</li>,
  a: ({ ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer"
      className="text-accent font-medium transition-all duration-200 rounded hover:bg-accent/10 hover:shadow-sm" />
  ),
  strong: ({ children }: React.ComponentProps<'strong'>) => <strong className="font-semibold text-primary">{children}</strong>,
  em: ({ children }: React.ComponentProps<'em'>) => <em className="italic">{children}</em>,
  code: ({ children }: React.ComponentProps<'code'>) => (
    <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[0.95em]">{children}</code>
  ),
  blockquote: ({ children }: React.ComponentProps<'blockquote'>) => (
    <blockquote className="border-l-2 border-accent/40 pl-4 italic text-neutral-500 dark:text-neutral-400 my-2">
      {children}
    </blockquote>
  ),
};

function splitAtStudentQuotes(content: string): { main: string; quotesHeader: string | null; quotesBody: string | null } {
  const match = content.match(/^([\s\S]*?)\n\n(\*\*What Students Are Saying\*\*[^\n]*)\n\n([\s\S]*)$/);
  if (!match) return { main: content, quotesHeader: null, quotesBody: null };
  return { main: match[1], quotesHeader: match[2], quotesBody: match[3] };
}

const inlineMarkdownComponents = {
  ...markdownComponents,
  p: ({ children }: React.ComponentProps<'p'>) => <span>{children}</span>,
};

export default function CardPage({ config, embedded = false }: { config: CardPageConfig; embedded?: boolean }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className={embedded ? "mb-4" : "mb-8"}>
        {config.description && (
          <div className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl leading-relaxed`}>
            <ReactMarkdown components={markdownComponents}>{config.description}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {config.items.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const hasDetails = !!item.content;
          const isQuotesExpanded = expandedQuotes.has(index);
          const { main: mainContent, quotesHeader, quotesBody } = item.content
            ? splitAtStudentQuotes(item.content)
            : { main: '', quotesHeader: null, quotesBody: null };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              className={cn(
                "bg-white dark:bg-neutral-900 rounded-xl border transition-all duration-200",
                isExpanded
                  ? "shadow-lg border-accent/40 dark:border-accent/40"
                  : "shadow-sm border-neutral-200 dark:border-neutral-800 hover:shadow-md"
              )}
            >
              {/* Collapsed row */}
              <div
                className={cn("flex items-start gap-4 p-5", hasDetails && "cursor-pointer select-none")}
                onClick={() => hasDetails && setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex-grow min-w-0">
                  <h3 className={`${embedded ? "text-base" : "text-lg"} font-semibold text-primary leading-snug mb-1`}>
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-sm text-accent font-medium">{item.subtitle}</p>
                  )}
                  {/* Date + tags inline */}
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {item.date && (
                      <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">{item.date}</span>
                    )}
                    {item.tags && item.tags.map(tag => (
                      <span key={tag} className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-0.5 rounded border border-neutral-100 dark:border-neutral-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {hasDetails && (
                  <div className="flex-shrink-0 self-center ml-2">
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDownIcon className="h-5 w-5 text-neutral-400" />
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Expanded panel */}
              <AnimatePresence initial={false}>
                {isExpanded && hasDetails && (
                  <motion.div
                    key="expanded"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                      <div className={`${embedded ? "text-sm" : "text-base"} text-neutral-600 dark:text-neutral-400 leading-relaxed`}>
                        <ReactMarkdown components={markdownComponents}>{mainContent}</ReactMarkdown>

                        {quotesHeader && (
                          <div className="mt-4">
                            <div
                              className="flex items-center gap-2 cursor-pointer select-none group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedQuotes(prev => {
                                  const next = new Set(prev);
                                  if (next.has(index)) next.delete(index); else next.add(index);
                                  return next;
                                });
                              }}
                            >
                              <div className="text-sm font-semibold text-primary">
                                <ReactMarkdown components={inlineMarkdownComponents}>{quotesHeader}</ReactMarkdown>
                              </div>
                              <motion.div animate={{ rotate: isQuotesExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDownIcon className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                              </motion.div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isQuotesExpanded && (
                                <motion.div
                                  key="quotes"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3">
                                    <ReactMarkdown components={markdownComponents}>{quotesBody ?? ''}</ReactMarkdown>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
