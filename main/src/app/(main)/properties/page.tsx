// Server-component shell: prepends a CMS-editable banner (if admin saved one)
// above the existing Properties listing page.

import PropertiesPageClient from './PropertiesPageClient';
import CmsPageBanner from '@/components/cms/CmsPageBanner';
import { getPageContent } from '@/lib/page-content';

export default async function PropertiesPage() {
  const content = await getPageContent('properties');
  return (
    <>
      <CmsPageBanner section={content.hero as any} />
      <PropertiesPageClient />
    </>
  );
}
