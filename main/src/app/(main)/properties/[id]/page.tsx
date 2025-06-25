import React from 'react';
import Link from 'next/link';

import {
  MapPin,
  Building2,
  Heart,
  Share2,
  ArrowLeft,
  Bed,
  Bath,
  Square,
  CheckCircle2,
  Phone,
  Mail,

  HelpCircle,
  MessageCircle
} from 'lucide-react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import InquiryForm from '@/components/InquiryForm';

// Types
interface Property {
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

// Mock data - same as in the listing page but with additional details
const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Modern Villa with Garden',
    type: 'Villa',
    location: 'Whitefield, Bangalore',
    price: '₹1.2 Cr',
    priceNumeric: 12000000,
    beds: 3,
    baths: 2,
    area: '2100 sq ft',
    areaNumeric: 2100,
    featured: true,
    new: false,
    description: 'Beautiful modern villa with spacious garden and premium amenities.',
    fullDescription: 'This stunning modern villa is located in the heart of Whitefield, one of Bangalore\'s most sought-after neighborhoods. The property features 3 spacious bedrooms, 2 luxurious bathrooms, and a beautiful garden perfect for family gatherings and outdoor activities.\n\nThe villa boasts high-quality finishes throughout, with premium flooring, modern fixtures, and elegant design elements. The open-concept living and dining area is perfect for entertaining, while the kitchen is equipped with top-of-the-line appliances.\n\nResidents will enjoy access to a range of premium amenities, including a swimming pool, gym, and 24/7 security. The property is conveniently located near shopping centers, schools, hospitals, and tech parks, making it an ideal choice for families and professionals alike.',
    amenities: ['Swimming Pool', 'Garden', 'Security', 'Parking', 'Gym'],
    postedDate: '2 days ago',
    specifications: {
      'Property Age': '2 years',
      'Furnishing': 'Semi-furnished',
      'Floor': '2 of 3',
      'Facing': 'East',
      'Ownership': 'Freehold',
      'Balcony': '2',
      'Parking': '2 Covered',
      'Water Supply': '24/7',
      'Power Backup': 'Full'
    }
  },
  {
    id: 2,
    title: 'Luxury Apartment',
    type: 'Apartment',
    location: 'Indiranagar, Bangalore',
    price: '₹85 Lac',
    priceNumeric: 8500000,
    beds: 2,
    baths: 2,
    area: '1200 sq ft',
    areaNumeric: 1200,
    featured: true,
    new: true,
    description: 'Premium apartment with modern amenities in a prime location.',
    fullDescription: 'This luxury apartment is situated in the vibrant neighborhood of Indiranagar, offering the perfect blend of comfort and convenience. With 2 well-appointed bedrooms and 2 modern bathrooms, this apartment is ideal for small families or professionals.\n\nThe apartment features contemporary design elements, including premium flooring, modern fixtures, and elegant finishes. The spacious living area opens onto a balcony, providing a perfect spot to relax and enjoy the city views.\n\nResidents will have access to a range of premium amenities, including a well-equipped gym, swimming pool, and 24/7 security. The property is conveniently located near restaurants, cafes, shopping centers, and entertainment options, making it an ideal choice for those seeking a vibrant urban lifestyle.',
    amenities: ['24/7 Security', 'Parking', 'Gym', 'Club House'],
    postedDate: '1 week ago',
    specifications: {
      'Property Age': '1 year',
      'Furnishing': 'Fully furnished',
      'Floor': '10 of 15',
      'Facing': 'North',
      'Ownership': 'Freehold',
      'Balcony': '1',
      'Parking': '1 Covered',
      'Water Supply': '24/7',
      'Power Backup': 'Full'
    }
  },
  // Add more properties with detailed information as needed
];

const PropertyDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const propertyId = parseInt(resolvedParams.id);
  const property = mockProperties.find(p => p.id === propertyId);


  // If property not found
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Building2 className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Property Not Found</h1>
        <p className="text-gray-600 mb-6">The property you are looking for does not exist or has been removed.</p>
        <Link href="/properties" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Back to Properties
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Property Header */}
      <div className="bg-white pt-[75px] md:pt-[90px] pb-4">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Back Button */}
          <Link href="/properties" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>

          {/* Property Title and Location */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>

            <div className="flex flex-col lg:items-end">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{property.price}</div>
              <div className="flex space-x-3">
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Content */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Images */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-8">
              <div className="h-80 md:h-96 lg:h-[500px] relative">
                <PlaceholderImage
                  className="w-full h-full object-cover"
                  type={property.type === 'Commercial' ? 'building' : 'property'}
                />

                {/* Tags */}
                <div className="absolute top-6 left-6 flex gap-3">
                  {property.featured && (
                    <span className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                  {property.new && (
                    <span className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>

                {/* Image Navigation */}
                <div className="absolute bottom-6 left-6 flex space-x-2">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}></div>
                  ))}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex space-x-3 overflow-x-auto">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <PlaceholderImage
                        className="w-full h-full object-cover"
                        type={property.type === 'Commercial' ? 'building' : 'property'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {property.beds && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Bed className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{property.beds}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
              )}

              {property.baths && (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Bath className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{property.baths}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <Square className="h-8 w-8 text-gray-700 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{property.area.split(' ')[0]}</div>
                <div className="text-sm text-gray-600">Square Feet</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {property.fullDescription || property.description}
              </p>
            </div>

            {/* Key Features and Amenities */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features and Amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Property Specifications */}
            {property.specifications && (
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(property.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{key}</span>
                      <span className="text-gray-900 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Inquiry Form */}
            <InquiryForm propertyTitle={property.title} />

            {/* Need Help Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Need Help?</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">24/7 Support</h4>
                    <p className="text-gray-600 text-sm mb-2">Get support instantly from qualified team.</p>
                    <a href="tel:+911234567890" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      +91 123 456 7890
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">FAQs</h4>
                    <p className="text-gray-600 text-sm mb-2">FAQ answers have specific frequently asked.</p>
                    <Link href="/faq" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      View FAQs
                    </Link>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Blog</h4>
                    <p className="text-gray-600 text-sm mb-2">Stay up-to-date content we recommend.</p>
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Read Blog
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600 text-sm mb-2">Send you our the question answers to your email.</p>
                    <a href="mailto:support@indusun.com" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      support@indusun.com
                    </a>
                  </div>
                </div>
              </div>

              <Link href="/contact" className="block w-full mt-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">
                Contact us
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 mb-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-gray-600 mt-2">
                Find answers to common questions about exclusive services, property listings, and the real estate process.
              </p>
            </div>
            <Link
              href="/faq"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All FAQs
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                question: "How do I search for properties on Indusun?",
                answer: "Learn how to use our user-friendly search tools to find properties that match your criteria."
              },
              {
                question: "How do I search for properties on Indusun?",
                answer: "Learn how to use our user-friendly search tools to find properties that match your criteria."
              },
              {
                question: "How do I search for properties on Indusun?",
                answer: "Learn how to use our user-friendly search tools to find properties that match your criteria."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 text-sm mb-4">{faq.answer}</p>
                <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                  Read More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
