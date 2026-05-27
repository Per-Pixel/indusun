// Server-component shell: prepends a CMS-editable banner (if admin saved one)
// above the existing Contact page.

import ContactPageClient from './ContactPageClient';
import CmsPageBanner from '@/components/cms/CmsPageBanner';
import { getPageContent } from '@/lib/page-content';

export default async function ContactPage() {
  const content = await getPageContent('contact-us');
  return (
    <>
      <CmsPageBanner section={content.hero as any} />
      <ContactPageClient />
    </>
  );
}
