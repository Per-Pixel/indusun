// Schema-driven CMS definitions.
// Each page has sections, each section has typed fields.
// The admin editor renders a form from this schema; the main app reads the
// resulting JSON from `page_content`.

export type FieldDef =
  | { kind: 'text'; key: string; label: string; placeholder?: string }
  | { kind: 'textarea'; key: string; label: string; placeholder?: string; rows?: number }
  | { kind: 'image'; key: string; label: string }
  | { kind: 'link'; key: string; label: string }
  | { kind: 'repeater'; key: string; label: string; itemLabel: string; fields: FieldDef[] };

export interface SectionDef {
  key: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  /** Initial values that match the live site so editors see context, not blanks. */
  defaults: Record<string, unknown>;
}

export interface PageDef {
  slug: string;
  title: string;
  sections: SectionDef[];
}

const HOMEPAGE: PageDef = {
  slug: 'homepage',
  title: 'Homepage',
  sections: [
    {
      key: 'hero',
      title: 'Hero',
      description: 'Top banner with image, headline and subheadline.',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline', rows: 3 },
        { kind: 'image', key: 'image', label: 'Background image' },
      ],
      defaults: {
        headline: 'Modern living for everyone',
        subheadline:
          'We provide a complete service for the sale, purchase or rental of real estate. We have been operating in Madrid and Barcelona more than 15 years.',
        image:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop',
      },
    },
    {
      key: 'featured',
      title: 'Featured Properties',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'text', key: 'subheadline', label: 'Sub-headline' },
        { kind: 'link', key: 'cta', label: 'View-all link' },
      ],
      defaults: {
        headline: 'Featured Properties',
        subheadline: 'Discover Your Dream Home Today',
        cta: { label: 'View All', url: '/properties' },
      },
    },
    {
      key: 'services',
      title: 'Services',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline' },
        {
          kind: 'repeater',
          key: 'items',
          label: 'Service cards',
          itemLabel: 'Service',
          fields: [
            { kind: 'text', key: 'title', label: 'Title' },
            { kind: 'textarea', key: 'description', label: 'Description', rows: 2 },
          ],
        },
      ],
      defaults: {
        headline: 'Our Services',
        subheadline:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.',
        items: [
          { title: 'Residential Properties', description: 'Find your dream home from our extensive listings of apartments, villas, and houses.' },
          { title: 'Commercial Properties', description: 'Discover the perfect space for your business with our commercial property listings.' },
          { title: 'Land & Plots', description: 'Invest in premium land and plots in high-growth areas with excellent potential.' },
          { title: 'Property Management', description: 'Let us handle the complexities of property management while you enjoy the benefits.' },
          { title: 'Expert Consultation', description: 'Get expert advice from our team of experienced real estate professionals.' },
          { title: 'Legal Assistance', description: 'Navigate legal complexities with our comprehensive legal assistance services.' },
        ],
      },
    },
    {
      key: 'why_choose_us',
      title: 'Why Choose Us',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline' },
      ],
      defaults: { headline: 'Why Choose Us', subheadline: '' },
    },
    {
      key: 'testimonials',
      title: 'Testimonials',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline' },
        {
          kind: 'repeater',
          key: 'items',
          label: 'Testimonials',
          itemLabel: 'Testimonial',
          fields: [
            { kind: 'text', key: 'name', label: 'Name' },
            { kind: 'text', key: 'role', label: 'Role / Location' },
            { kind: 'textarea', key: 'quote', label: 'Quote', rows: 3 },
            { kind: 'image', key: 'avatar', label: 'Avatar image' },
          ],
        },
      ],
      defaults: { headline: 'What Our Clients Say', subheadline: '', items: [] },
    },
    {
      key: 'counter',
      title: 'Counters',
      fields: [
        {
          kind: 'repeater',
          key: 'items',
          label: 'Counters',
          itemLabel: 'Counter',
          fields: [
            { kind: 'text', key: 'value', label: 'Value (e.g. "15+")' },
            { kind: 'text', key: 'label', label: 'Label' },
          ],
        },
      ],
      defaults: { items: [] },
    },
  ],
};

const PROPERTIES: PageDef = {
  slug: 'properties',
  title: 'Properties Page',
  sections: [
    {
      key: 'hero',
      title: 'Page header',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline' },
        { kind: 'image', key: 'image', label: 'Banner image (optional)' },
      ],
      defaults: { headline: 'Properties', subheadline: '', image: '' },
    },
  ],
};

const ABOUT: PageDef = {
  slug: 'about-us',
  title: 'About Us',
  sections: [
    {
      key: 'hero',
      title: 'Page header',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline' },
        { kind: 'image', key: 'image', label: 'Banner image' },
      ],
      defaults: { headline: 'About Us', subheadline: '', image: '' },
    },
    {
      key: 'story',
      title: 'Our Story',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'body', label: 'Body', rows: 8 },
        { kind: 'image', key: 'image', label: 'Image (optional)' },
      ],
      defaults: { headline: 'Our Story', body: '', image: '' },
    },
    {
      key: 'values',
      title: 'Our Values',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        {
          kind: 'repeater',
          key: 'items',
          label: 'Values',
          itemLabel: 'Value',
          fields: [
            { kind: 'text', key: 'title', label: 'Title' },
            { kind: 'textarea', key: 'description', label: 'Description', rows: 2 },
          ],
        },
      ],
      defaults: { headline: 'Our Values', items: [] },
    },
  ],
};

const CONTACT: PageDef = {
  slug: 'contact-us',
  title: 'Contact Us',
  sections: [
    {
      key: 'hero',
      title: 'Page header',
      fields: [
        { kind: 'text', key: 'headline', label: 'Headline' },
        { kind: 'textarea', key: 'subheadline', label: 'Sub-headline' },
      ],
      defaults: { headline: 'Get in Touch', subheadline: '' },
    },
    {
      key: 'details',
      title: 'Contact details',
      fields: [
        { kind: 'text', key: 'address', label: 'Address' },
        { kind: 'text', key: 'phone', label: 'Phone' },
        { kind: 'text', key: 'email', label: 'Email' },
        { kind: 'text', key: 'hours', label: 'Office hours' },
      ],
      defaults: { address: '', phone: '', email: '', hours: '' },
    },
  ],
};

export const PAGES: PageDef[] = [HOMEPAGE, PROPERTIES, ABOUT, CONTACT];

export function getPageDef(slug: string): PageDef | undefined {
  return PAGES.find((p) => p.slug === slug);
}
