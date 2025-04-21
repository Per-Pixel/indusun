'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Calendar,
  Clock
} from 'lucide-react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

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

const PropertyDetailPage = ({ params }: { params: { id: string } }) => {
  const propertyId = parseInt(params.id);
  const property = mockProperties.find(p => p.id === propertyId);
  
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'I am interested in this property. Please contact me with more information.'
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Contact form submitted:', contactFormData);
    alert('Thank you for your interest! An agent will contact you shortly.');
    setShowContactForm(false);
  };
  
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
    <div className="min-h-screen bg-gray-50">
      {/* Property Header */}
      <div className="bg-white py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/properties" className="inline-flex items-center text-blue-600 mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Properties
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-bold text-blue-600">{property.price}</div>
              <div className="flex mt-2 space-x-2">
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100">
                  <Heart className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100">
                  <Share2 className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Property Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Property Images */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
              <div className="h-64 md:h-96 relative">
                <PlaceholderImage
                  className="w-full h-full object-cover"
                  type={property.type === 'Commercial' ? 'building' : 'property'}
                />
                
                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.featured && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {property.new && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              
              {/* Property Features */}
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-gray-200">
                {property.beds && (
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="font-semibold">{property.beds}</div>
                      <div className="text-sm text-gray-500">Bedrooms</div>
                    </div>
                  </div>
                )}
                
                {property.baths && (
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="font-semibold">{property.baths}</div>
                      <div className="text-sm text-gray-500">Bathrooms</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Square className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <div className="font-semibold">{property.area}</div>
                    <div className="text-sm text-gray-500">Area</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <div className="font-semibold">{property.type}</div>
                    <div className="text-sm text-gray-500">Property Type</div>
                  </div>
                </div>
              </div>
              
              {/* Property Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {property.fullDescription || property.description}
                </p>
              </div>
              
              {/* Property Specifications */}
              {property.specifications && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(property.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Property Amenities */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Amenities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Location Map Placeholder */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
                <p className="text-gray-500">Map will be displayed here</p>
              </div>
              <p className="mt-4 text-gray-700">
                Located in {property.location}, this property offers easy access to nearby amenities including schools, hospitals, shopping centers, and public transportation.
              </p>
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Contact Agent */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Agent</h2>
              
              {!showContactForm ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mr-3 overflow-hidden">
                      <PlaceholderImage
                        className="w-full h-full object-cover"
                        type="agent"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">Arshir Patel</div>
                      <div className="text-sm text-gray-500">Property Consultant</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-500 mr-2" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span>arshir.patel@indusun.com</span>
                    </div>
                  </div>
                  
                  <button
                    className="w-full py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => setShowContactForm(true)}
                  >
                    Contact Agent
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={contactFormData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={contactFormData.email}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={contactFormData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        name="message"
                        value={contactFormData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                        onClick={() => setShowContactForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
            
            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Property Info</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Listed On</span>
                    <span className="font-medium">April 15, 2023</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">{property.postedDate}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600">Property ID</span>
                    <span className="font-medium">IND-{property.id.toString().padStart(5, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
