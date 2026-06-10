'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  MapPin,
  Home,
  DollarSign,
  User,
  Bed,
  Bath,
  Square,
  Eye,
  GripVertical,
  Star,
  Tag,
  Globe,
  FileText
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';

// Enhanced interfaces
interface PropertyImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

interface DisplayPage {
  page: 'homepage' | 'search' | 'listing' | 'category';
  enabled: boolean;
}

// Property interface (enhanced)
interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  status: 'Listed' | 'Unlisted' | 'Sold' | 'Pending';
  isDraft: boolean;
  images: PropertyImage[];
  targetedLocation: string;
  actualLocation: string;
  listedBy: {
    id: string;
    name: string;
    type: 'Admin' | 'Broker';
    email: string;
    phone: string;
  };
  bedrooms: number;
  bathrooms: number;
  squareFootage: string;
  propertyType: 'House' | 'Villa' | 'Apartment' | 'Plot' | 'Commercial';
  categories: string[];
  displayPages: DisplayPage[];
  dateAdded: string;
  dateModified: string;
}

// Property form data interface
interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  status: 'Listed' | 'Unlisted';
  isDraft: boolean;
  targetedLocation: string;
  actualLocation: string;
  listedBy: string;
  bedrooms: number;
  bathrooms: number;
  squareFootage: string;
  propertyType: 'House' | 'Villa' | 'Apartment' | 'Plot' | 'Commercial';
  categories: string[];
  displayPages: DisplayPage[];
  images: File[];
  existingImages: PropertyImage[];
}

// Constants
const PROPERTY_CATEGORIES = [
  'Featured',
  'New Launch',
  'Premium',
  'Budget Friendly',
  'Ready to Move',
  'Under Construction',
  'Investment',
  'Luxury',
  'Gated Community',
  'Near Metro',
  'School Nearby',
  'Hospital Nearby'
];

const DISPLAY_PAGES = [
  { id: 'homepage', label: 'Homepage (Featured Properties)', description: 'Show in homepage featured section' },
  { id: 'search', label: 'Search Page Results', description: 'Include in search results' },
  { id: 'listing', label: 'Property Listing Page', description: 'Show in main property listings' },
  { id: 'category', label: 'Category-Specific Pages', description: 'Show in category-based pages' }
];

// Mock property data (enhanced)
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Villa in Whitefield',
    description: 'Stunning 4-bedroom villa with modern amenities, spacious garden, and premium interiors. Located in a gated community with 24/7 security.',
    price: '₹1.5 Cr',
    status: 'Listed',
    isDraft: false,
    images: [
      { id: 'img1', url: '/properties/property-01.jpg', order: 1, isPrimary: true },
      { id: 'img2', url: '/properties/property-02.jpg', order: 2, isPrimary: false }
    ],
    targetedLocation: 'Whitefield Premium Sector, Near Tech Parks',
    actualLocation: '123 Palm Avenue, Whitefield, Bangalore',
    listedBy: {
      id: 'admin1',
      name: 'Admin User',
      type: 'Admin',
      email: 'admin@indusun.com',
      phone: '+91 98765 43210'
    },
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: '3500 sq ft',
    propertyType: 'Villa',
    categories: ['Featured', 'Luxury', 'Gated Community'],
    displayPages: [
      { page: 'homepage', enabled: true },
      { page: 'search', enabled: true },
      { page: 'listing', enabled: true },
      { page: 'category', enabled: true }
    ],
    dateAdded: '2023-12-15',
    dateModified: '2023-12-15'
  },
  {
    id: '2',
    title: 'Commercial Space in Tech Park',
    description: 'Premium commercial space in a prime tech park location. Ideal for IT companies, startups, or corporate offices.',
    price: '₹2.8 Cr',
    status: 'Listed',
    images: [{ id: 'img3', url: '/properties/property-02.jpg', order: 1, isPrimary: true }],
    targetedLocation: 'Electronic City Tech Hub, IT Corridor',
    actualLocation: '456 Tech Avenue, Electronic City, Bangalore',
    listedBy: {
      id: 'broker1',
      name: 'Amit Kumar',
      type: 'Broker',
      email: 'amit@indusun.com',
      phone: '+91 98765 43211'
    },
    bedrooms: 0,
    bathrooms: 4,
    squareFootage: '5000 sq ft',
    propertyType: 'Commercial',
    isDraft: false,
    categories: ['Featured'],
    displayPages: [{ page: 'listing', enabled: true }],
    dateAdded: '2023-11-20',
    dateModified: '2023-11-25'
  },
  {
    id: '3',
    title: 'Residential Plot in Sarjapur',
    description: 'Prime residential plot in developing area with excellent connectivity and future growth potential.',
    price: '₹85 Lakhs',
    status: 'Listed',
    images: [{ id: 'img4', url: '/properties/property-03.jpg', order: 1, isPrimary: true }],
    targetedLocation: 'Sarjapur Road Development Zone',
    actualLocation: '789 Green Valley, Sarjapur Road, Bangalore',
    listedBy: {
      id: 'admin1',
      name: 'Admin User',
      type: 'Admin',
      email: 'admin@indusun.com',
      phone: '+91 98765 43210'
    },
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: '2400 sq ft',
    propertyType: 'Plot',
    isDraft: false,
    categories: ['Investment'],
    displayPages: [{ page: 'listing', enabled: true }],
    dateAdded: '2023-12-05',
    dateModified: '2023-12-05'
  }
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: '',
    status: 'Listed',
    isDraft: false,
    targetedLocation: '',
    actualLocation: '',
    listedBy: 'admin1',
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: '',
    propertyType: 'Plot',
    categories: [],
    displayPages: [],
    images: [],
    existingImages: [],
  });

  // Load property data
  useEffect(() => {
    const foundProperty = mockProperties.find(p => p.id === propertyId);
    if (foundProperty) {
      setProperty(foundProperty);
      setFormData({
        title: foundProperty.title,
        description: foundProperty.description,
        price: foundProperty.price,
        status: foundProperty.status === 'Sold' || foundProperty.status === 'Pending' ? 'Listed' : foundProperty.status,
        targetedLocation: foundProperty.targetedLocation,
        actualLocation: foundProperty.actualLocation,
        listedBy: foundProperty.listedBy.id,
        bedrooms: foundProperty.bedrooms,
        bathrooms: foundProperty.bathrooms,
        squareFootage: foundProperty.squareFootage,
        propertyType: foundProperty.propertyType,
        images: [],
        existingImages: foundProperty.images,
        isDraft: foundProperty.isDraft ?? false,
        categories: foundProperty.categories ?? [],
        displayPages: foundProperty.displayPages ?? [],
      });
    }
  }, [propertyId]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Auto-format price with rupee sign
      let formattedValue = value.replace(/[^\d.]/g, ''); // Remove non-numeric characters except decimal
      if (formattedValue && !formattedValue.startsWith('₹')) {
        formattedValue = '₹' + formattedValue;
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'squareFootage') {
      // Auto-format square footage with sq ft
      let formattedValue = value.replace(/[^\d.]/g, ''); // Remove non-numeric characters except decimal
      if (formattedValue && !formattedValue.includes('sq ft')) {
        formattedValue = formattedValue + ' sq ft';
      }
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'bedrooms' || name === 'bathrooms' ? parseInt(value) || 0 : value
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Please ensure all files are images under 10MB.');
    }

    const totalImages = formData.existingImages.length + formData.images.length + validFiles.length;
    if (totalImages > 10) {
      alert('Maximum 10 images allowed. Please remove some existing images first.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  // Remove new image
  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Remove existing image
  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the data to your API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to properties list
      router.push('/properties');
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error updating property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
        <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
          <div className="sticky top-0 z-10">
            <AdminTopNavbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 text-black">Property Not Found</h1>
              <button
                onClick={() => router.push('/properties')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Back to Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 bg-gray-50 ${isSidebarOpen ? 'ml-[200px]' : 'ml-0'}`}>
        {/* Top Navbar */}
        <div className="sticky top-0 z-10">
          <AdminTopNavbar toggleSidebar={toggleSidebar} />
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/properties')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft size={16} className="mr-1" />
                <span>Back to Properties</span>
              </button>
              <h1 className="text-2xl font-bold text-black">Edit Property</h1>
              <p className="text-gray-600 mt-1">Update property details and information</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <Home className="mr-2" size={20} />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-1">Property Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Luxury Villa in Whitefield"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-1">Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe the property features, amenities, and highlights..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Price *</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="₹1.5 Cr"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Status *</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      >
                        <option value="Listed">Listed</option>
                        <option value="Unlisted">Unlisted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Property Type *</label>
                      <select
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Plot">Plot</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Office">Office</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Square Footage *</label>
                      <div className="relative">
                        <Square className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          name="squareFootage"
                          value={formData.squareFootage}
                          onChange={handleInputChange}
                          placeholder="3500 sq ft"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <MapPin className="mr-2" size={20} />
                    Location Information
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Targeted Location (Private) *</label>
                      <input
                        type="text"
                        name="targetedLocation"
                        value={formData.targetedLocation}
                        onChange={handleInputChange}
                        placeholder="e.g., Whitefield Premium Sector, Near Tech Parks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">This location is only visible to admin and brokers</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Actual Location (Public) *</label>
                      <input
                        type="text"
                        name="actualLocation"
                        value={formData.actualLocation}
                        onChange={handleInputChange}
                        placeholder="e.g., 123 Palm Avenue, Whitefield, Bangalore"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">This location will be visible to website visitors</p>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <Home className="mr-2" size={20} />
                    Property Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Bedrooms</label>
                      <div className="relative">
                        <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="number"
                          name="bedrooms"
                          value={formData.bedrooms}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Bathrooms</label>
                      <div className="relative">
                        <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="number"
                          name="bathrooms"
                          value={formData.bathrooms}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Listed By</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select
                          name="listedBy"
                          value={formData.listedBy}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                          <option value="admin1">Admin User</option>
                          <option value="broker1">Broker User</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <Upload className="mr-2" size={20} />
                    Property Images
                  </h2>

                  {/* Existing Images */}
                  {formData.existingImages.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-black mb-2">Current Images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.existingImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={typeof image === 'string' ? image : image.url}
                              alt={`Current ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="images" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-black">
                            Click to upload additional images
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB each (Max 10 images total)
                          </span>
                        </label>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  </div>

                  {/* New Images Preview */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-black mb-2">New Images to Upload</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Total images: {formData.existingImages.length + formData.images.length}/10
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/properties')}
                    className="px-6 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Property...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Update Property
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
