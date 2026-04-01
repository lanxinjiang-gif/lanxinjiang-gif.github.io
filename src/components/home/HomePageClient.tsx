'use client';

import { useEffect } from 'react';
import Profile from '@/components/home/Profile';
import About from '@/components/home/About';
import SelectedPublications from '@/components/home/SelectedPublications';
import News, { NewsItem } from '@/components/home/News';
import PublicationsList from '@/components/publications/PublicationsList';
import TextPage from '@/components/pages/TextPage';
import CardPage from '@/components/pages/CardPage';
import type { SiteConfig } from '@/lib/config';
import { Publication } from '@/types/publication';
import { CardPageConfig, PublicationPageConfig, TextPageConfig } from '@/types/page';
import { useLocaleStore } from '@/lib/stores/localeStore';

interface SectionConfig {
  id: string;
  type: 'markdown' | 'publications' | 'list';
  title?: string;
  source?: string;
  filter?: string;
  limit?: number;
  content?: string;
  publications?: Publication[];
  items?: NewsItem[];
}

type PageData =
  | { type: 'about'; id: string; sections: SectionConfig[] }
  | { type: 'publication'; id: string; config: PublicationPageConfig; publications: Publication[] }
  | { type: 'text'; id: string; config: TextPageConfig; content: string }
  | { type: 'card'; id: string; config: CardPageConfig };

export interface HomePageLocaleData {
  author: SiteConfig['author'];
  social: SiteConfig['social'];
  features: SiteConfig['features'];
  enableOnePageMode?: boolean;
  researchInterests?: string[];
  pagesToShow: PageData[];
}

interface HomePageClientProps {
  dataByLocale: Record<string, HomePageLocaleData>;
  defaultLocale: string;
}

export default function HomePageClient({ dataByLocale, defaultLocale }: HomePageClientProps) {
  const locale = useLocaleStore((state) => state.locale);
  const fallback = dataByLocale[defaultLocale] || Object.values(dataByLocale)[0];
  const data = dataByLocale[locale] || fallback;

  // Lock body scroll — only right column scrolls
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!data) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-hidden max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-background">
      {/* Left column — fixed, no scroll (desktop only) */}
      <div className="hidden lg:flex flex-col w-80 flex-shrink-0 py-8 pr-8 overflow-hidden">
        <Profile
          author={data.author}
          social={data.social}
          features={data.features}
          researchInterests={data.researchInterests}
        />
      </div>

      {/* Right column — scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-8 lg:pl-8 space-y-8">
        {/* Profile visible on mobile */}
        <div className="lg:hidden">
          <Profile
            author={data.author}
            social={data.social}
            features={data.features}
            researchInterests={data.researchInterests}
          />
        </div>

        {data.pagesToShow.map((page) => (
          <section key={page.id} id={page.id} className="scroll-mt-24 space-y-8">
            {page.type === 'about' && page.sections.map((section: SectionConfig) => {
              switch (section.type) {
                case 'markdown':
                  return (
                    <About
                      key={section.id}
                      content={section.content || ''}
                      title={section.title}
                    />
                  );
                case 'publications':
                  return (
                    <SelectedPublications
                      key={section.id}
                      publications={section.publications || []}
                      title={section.title}
                      enableOnePageMode={data.enableOnePageMode}
                    />
                  );
                case 'list':
                  return (
                    <News
                      key={section.id}
                      items={section.items || []}
                      title={section.title}
                    />
                  );
                default:
                  return null;
              }
            })}
            {page.type === 'publication' && (
              <PublicationsList
                config={page.config}
                publications={page.publications}
                embedded={true}
              />
            )}
            {page.type === 'text' && (
              <TextPage
                config={page.config}
                content={page.content}
                embedded={true}
              />
            )}
            {page.type === 'card' && (
              <CardPage
                config={page.config}
                embedded={true}
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
