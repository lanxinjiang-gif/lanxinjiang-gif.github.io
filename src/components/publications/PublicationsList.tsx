'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    CalendarIcon,
    BookOpenIcon,
    ClipboardDocumentIcon,
    ChevronDownIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { Publication } from '@/types/publication';
import { PublicationPageConfig } from '@/types/page';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/i18n/useMessages';

interface PublicationsListProps {
    config: PublicationPageConfig;
    publications: Publication[];
    embedded?: boolean;
}

function formatAuthorAPA(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(p => p[0].toUpperCase() + ".").join(" ");
    return last + ", " + initials;
}

function generateAPA(pub: Publication): string {
    const authors = pub.authors.map(a => formatAuthorAPA(a.name));
    let authorStr: string;
    if (authors.length === 1) {
        authorStr = authors[0];
    } else if (authors.length === 2) {
        authorStr = authors[0] + ", & " + authors[1];
    } else {
        authorStr = authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
    }
    const year = pub.year ? " (" + pub.year + ")." : ".";
    const venue = pub.journal || pub.conference || "";
    const volStr = pub.volume
        ? pub.volume + (pub.issue ? "(" + pub.issue + ")" : "")
        : "";
    const pagesStr = pub.pages ? pub.pages.replace(/--/g, "\u2013") : "";
    let sourceStr = "";
    if (venue || volStr || pagesStr) {
        const sourceParts = [venue, volStr, pagesStr].filter(Boolean);
        sourceStr = " " + sourceParts.join(", ") + ".";
    }
    const doi = pub.doi
        ? " https://doi.org/" + pub.doi
        : pub.url
        ? " " + pub.url
        : "";
    return (authorStr + year + " " + pub.title + "." + sourceStr + doi).replace(/\s+/g, " ").trim();
}

export default function PublicationsList({ config, publications, embedded = false }: PublicationsListProps) {
    const messages = useMessages();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState<string | 'all'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [expandedBibtexId, setExpandedBibtexId] = useState<string | null>(null);
    const [copiedApaId, setCopiedApaId] = useState<string | null>(null);

    // const years = useMemo(() => {
    //     const uniqueYears = Array.from(new Set(publications.map(p => p.year)));
    //     return uniqueYears.sort((a, b) => b - a);
    // }, [publications]);
    const years = useMemo(() => {
      const uniqueYears = Array.from(
        new Set(
          publications
            .map(p => p.year)
            .filter((year): year is number => year != null)
        )
      );
      return uniqueYears.sort((a, b) => b - a);
    }, [publications]);
    
    const types = useMemo(() => {
        const uniqueTypes = Array.from(new Set(publications.map(p => p.type)));
        return uniqueTypes.sort();
    }, [publications]);

    const filteredPublications = useMemo(() => {
        return publications.filter(pub => {
            const matchesSearch =
                pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                pub.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pub.conference?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesYear = selectedYear === 'all' || pub.year === selectedYear;
            const matchesType = selectedType === 'all' || pub.type === selectedType;
            return matchesSearch && matchesYear && matchesType;
        });
    }, [publications, searchQuery, selectedYear, selectedType]);

    const toggleCard = (id: string) => {
        setExpandedCardId(prev => (prev === id ? null : id));
        setExpandedBibtexId(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="mb-8">

                {config.description && (
                    <p className={`${embedded ? "text-base" : "text-lg"} text-neutral-600 dark:text-neutral-500 max-w-2xl`}>
                        {config.description}
                    </p>
                )}
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={messages.publications.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center justify-center px-4 py-2 rounded-lg border transition-all duration-200",
                            showFilters
                                ? "bg-accent text-white border-accent"
                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-accent hover:text-accent"
                        )}
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        {messages.publications.filters}
                    </button>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-6">
                                {/* Year Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <CalendarIcon className="h-4 w-4 mr-1" /> {messages.publications.year}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedYear('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedYear === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                onClick={() => setSelectedYear(year)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full transition-colors",
                                                    selectedYear === year
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
                                        <BookOpenIcon className="h-4 w-4 mr-1" /> {messages.publications.type}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedType('all')}
                                            className={cn(
                                                "px-3 py-1 text-xs rounded-full transition-colors",
                                                selectedType === 'all'
                                                    ? "bg-accent text-white"
                                                    : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                            )}
                                        >
                                            {messages.common.all}
                                        </button>
                                        {types.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                className={cn(
                                                    "px-3 py-1 text-xs rounded-full capitalize transition-colors",
                                                    selectedType === type
                                                        ? "bg-accent text-white"
                                                        : "bg-white dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                                )}
                                            >
                                                {type.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Publications List */}
            <div className="space-y-4">
                {filteredPublications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        {messages.publications.noResults}
                    </div>
                ) : (
                    filteredPublications.map((pub, index) => {
                        const isExpanded = expandedCardId === pub.id;
                        const pubUrl = pub.doi ? `https://doi.org/${pub.doi}` : pub.url;

                        return (
                            <motion.div
                                key={pub.id}
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
                                {/* Collapsed row — click to expand */}
                                <div
                                    className="flex items-start gap-4 p-5 cursor-pointer select-none"
                                    onClick={() => toggleCard(pub.id)}
                                >
                                    {/* Small thumbnail */}
                                    {pub.preview && (
                                        <div className="flex-shrink-0 w-24 h-16 relative rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 hidden sm:block">
                                            <Image
                                                src={`/papers/${pub.preview}`}
                                                alt={pub.title}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-grow min-w-0">
                                        <h3 className={`${embedded ? "text-base" : "text-lg"} font-semibold text-primary leading-snug mb-1`}>
                                            {pub.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                            {pub.authors.map((author, idx) => (
                                                <span key={idx}>
                                                    <span className={`${author.isHighlighted ? 'font-semibold text-accent' : ''}`}>
                                                        {author.name}
                                                    </span>
                                                    {idx < pub.authors.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </p>
                                        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-0.5 capitalize">
                                            {[pub.journal || pub.conference, pub.year].filter(Boolean).join(' · ')}{(pub.journal || pub.conference || pub.year) ? ' · ' : ''}<span className="capitalize">{pub.type}</span>
                                        </p>
                                    </div>

                                    {/* Chevron */}
                                    <div className="flex-shrink-0 self-center ml-2">
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDownIcon className="h-5 w-5 text-neutral-400" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Expanded panel */}
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            key="expanded"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">

                                                {/* Figure + Abstract side by side */}
                                                <div className="flex flex-col md:flex-row gap-5">
                                                    {pub.preview && (
                                                        <div className="flex-shrink-0 md:w-1/2 relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800" style={{ minHeight: '220px', maxHeight: '380px' }}>
                                                            <Image
                                                                src={`/papers/${pub.preview}`}
                                                                alt={pub.title}
                                                                width={900}
                                                                height={600}
                                                                className="object-contain w-full h-full"
                                                                style={{ maxHeight: '380px' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {pub.abstract && (
                                                        <div className={pub.preview ? "md:w-1/2 flex flex-col" : "w-full"}>
                                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed overflow-y-auto" style={{ maxHeight: '360px' }}>
                                                                {pub.abstract}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex flex-wrap gap-2 pt-1" onClick={e => e.stopPropagation()}>
                                                    {pubUrl && (
                                                        <a
                                                            href={pubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
                                                            data-umami-event="view-paper"
                                                            data-umami-event-title={pub.title}
                                                        >
                                                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                                            View Paper
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const apa = generateAPA(pub);
                                                            navigator.clipboard.writeText(apa);
                                                            setCopiedApaId(pub.id);
                                                            setTimeout(() => setCopiedApaId(null), 2000);
                                                            const w = window as Window & { umami?: { track: (e: string, d?: Record<string, string>) => void } };
                                                            if (w.umami) w.umami.track('cite-apa', { title: pub.title });
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-colors bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                    >
                                                        <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                                                        {copiedApaId === pub.id ? "Copied!" : "Cite (APA)"}
                                                    </button>
                                                    {pub.bibtex && (
                                                        <button
                                                            onClick={() => setExpandedBibtexId(expandedBibtexId === pub.id ? null : pub.id)}
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                                                                expandedBibtexId === pub.id
                                                                    ? "bg-neutral-700 text-white"
                                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                            )}
                                                        >
                                                            <BookOpenIcon className="h-3.5 w-3.5" />
                                                            Copy BibTeX
                                                        </button>
                                                    )}
                                                </div>

                                                {/* BibTeX panel */}
                                                <AnimatePresence>
                                                    {expandedBibtexId === pub.id && pub.bibtex && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <div className="relative bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                                                <pre className="text-xs text-neutral-600 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap font-mono">
                                                                    {pub.bibtex}
                                                                </pre>
                                                                <button
                                                                    onClick={() => navigator.clipboard.writeText(pub.bibtex || '')}
                                                                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-neutral-700 text-neutral-500 hover:text-accent shadow-sm border border-neutral-200 dark:border-neutral-600 transition-colors"
                                                                    title={messages.common.copyToClipboard}
                                                                >
                                                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
