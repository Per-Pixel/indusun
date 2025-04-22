export interface Property {
  id: number;
  title: string;
  type: 'Apartment' | 'Villa' | 'House' | 'Plot' | 'Commercial';
  location: string;
  price: string;
  priceNumeric: number;
  beds?: number;
  baths?: number;
  area: string;
  areaNumeric: number;
  featured: boolean;
  new: boolean;
  image?: string;
  description: string;
  amenities: string[];
  postedDate: string;
  fullDescription?: string;
  specifications?: {
    [key: string]: string;
  };
}