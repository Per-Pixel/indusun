// Server-component banner rendered at the top of CMS-managed pages.
// Renders nothing when no override exists or when the section is hidden in admin.

import type { PageSection } from '@/lib/page-content';

interface HeroData {
  headline?: string;
  subheadline?: string;
  image?: string;
}

interface Props {
  section?: PageSection<HeroData>;
}

export default function CmsPageBanner({ section }: Props) {
  if (!section || !section.visible) return null;

  const { headline, subheadline, image } = section.data || {};
  // If nothing useful was entered, render nothing rather than an empty banner.
  if (!headline?.trim() && !subheadline?.trim() && !image?.trim()) return null;

  return (
    <section className="relative w-full bg-gray-900 text-white">
      {image?.trim() && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        {headline?.trim() && (
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{headline}</h1>
        )}
        {subheadline?.trim() && (
          <p className="text-lg md:text-xl text-white/90 max-w-3xl">{subheadline}</p>
        )}
      </div>
    </section>
  );
}
