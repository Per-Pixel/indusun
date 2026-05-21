// Server component shell for the homepage.
// Fetches CMS content once on the server and hands it to the client renderer.

import HomePageClient from './HomePageClient';
import { getPageContent } from '@/lib/page-content';

export default async function Home() {
  const content = await getPageContent('homepage');
  return <HomePageClient content={content} />;
}
