// Server-component shell: prepends a CMS-editable banner (if admin saved one)
// above the existing About page.

import AboutPageClient from './AboutPageClient';
import CmsPageBanner from '@/components/cms/CmsPageBanner';
import { getPageContent } from '@/lib/page-content';

export default async function AboutPage() {
  const content = await getPageContent('about-us');
  return (
    <>
      <CmsPageBanner section={content.hero as any} />
      <AboutPageClient />
    </>
  );
}
