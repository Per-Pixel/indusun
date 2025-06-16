'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  MapPin,
  Home,
  DollarSign,
  User,
  Bed,
  Bath,
  Square,
  Save,
  Eye,
  GripVertical,
  Star,
  Tag,
  Globe,
  FileText
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminTopNavbar from '@/components/AdminTopNavbar';
// Removed react-beautiful-dnd due to React 19 compatibility issues

// Enhanced interfaces
interface PropertyImage {
  id: string;
  file?: File;
  url?: string;
  order: number;
  isPrimary: boolean;
}

interface DisplayPage {
  page: 'homepage' | 'search' | 'listing' | 'category';
  enabled: boolean;
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
  images: PropertyImage[];
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

export default function AddPropertyPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [mounted, setMounted] = useState(false);
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
    propertyType: 'House',
    categories: [],
    displayPages: [
      { page: 'homepage', enabled: false },
      { page: 'search', enabled: true },
      { page: 'listing', enabled: true },
      { page: 'category', enabled: true }
    ],
    images: [],
  });

  // Additional state for enhanced features
  const [showPreview, setShowPreview] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  // Prevent hydration issues and load data from URL params if duplicating
  useEffect(() => {
    setMounted(true);

    const urlParams = new URLSearchParams(window.location.search);
    const duplicate = urlParams.get('duplicate');

    if (duplicate === 'true') {
      setIsDuplicate(true);
      setFormData({
        title: urlParams.get('title') || '',
        description: urlParams.get('description') || '',
        price: urlParams.get('price') || '',
        status: (urlParams.get('status') as 'Listed' | 'Unlisted') || 'Listed',
        isDraft: false,
        targetedLocation: urlParams.get('targetedLocation') || '',
        actualLocation: urlParams.get('actualLocation') || '',
        listedBy: urlParams.get('listedBy') || 'admin1',
        bedrooms: parseInt(urlParams.get('bedrooms') || '0'),
        bathrooms: parseInt(urlParams.get('bathrooms') || '0'),
        squareFootage: urlParams.get('squareFootage') || '',
        propertyType: (urlParams.get('propertyType') as PropertyFormData['propertyType']) || 'House',
        categories: [],
        displayPages: [
          { page: 'homepage', enabled: false },
          { page: 'search', enabled: true },
          { page: 'listing', enabled: true },
          { page: 'category', enabled: true }
        ],
        images: [],
      });
    }
  }, []);

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

  // Handle image upload with enhanced features
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

    const newImages: PropertyImage[] = validFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      file,
      order: formData.images.length + index + 1,
      isPrimary: formData.images.length === 0 && index === 0 // First image is primary
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10) // Max 10 images
    }));
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // Reorder images and ensure we have a primary image
      const reorderedImages = newImages.map((img, i) => ({
        ...img,
        order: i + 1,
        isPrimary: i === 0 // First image becomes primary
      }));

      return {
        ...prev,
        images: reorderedImages
      };
    });
  };

  // Handle drag and drop reordering with HTML5 API
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
      setDraggedImageIndex(null);
      return;
    }

    const items = Array.from(formData.images);
    const draggedItem = items[draggedImageIndex];

    // Remove dragged item
    items.splice(draggedImageIndex, 1);

    // Insert at new position
    items.splice(dropIndex, 0, draggedItem);

    // Update order and primary status
    const reorderedImages = items.map((img, index) => ({
      ...img,
      order: index + 1,
      isPrimary: index === 0 // First image is always primary
    }));

    setFormData(prev => ({
      ...prev,
      images: reorderedImages
    }));

    setDraggedImageIndex(null);
  };

  // Set primary image
  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  // Handle display page selection
  const handleDisplayPageChange = (pageId: string) => {
    setFormData(prev => ({
      ...prev,
      displayPages: prev.displayPages.map(page =>
        page.page === pageId ? { ...page, enabled: !page.enabled } : page
      )
    }));
  };

  // Handle save as draft
  const handleSaveAsDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Set as draft and save
      const draftData = { ...formData, isDraft: true };
      // Here you would typically send the data to your API
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/properties');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle preview
  const handlePreview = () => {
    setShowPreview(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        alert('Please fill in all required fields.');
        return;
      }

      // Set as published (not draft) and save
      const publishedData = { ...formData, isDraft: false };
      // Here you would typically send the data to your API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate back to properties list
      router.push('/properties');
    } catch (error) {
      console.error('Error adding property:', error);
      alert('Error adding property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              <h1 className="text-2xl font-bold text-black">
                {isDuplicate ? 'Duplicate Property' : 'Add New Property'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isDuplicate ? 'Create a copy of an existing property with modifications' : 'Create a new property listing with all the details'}
              </p>
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
                        <option value="House">House</option>
                        <option value="Villa">Villa</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Plot">Plot</option>
                        <option value="Commercial">Commercial</option>
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

                {/* Enhanced Image Upload & Management */}
                <div>
                  <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <Upload className="mr-2" size={20} />
                    Property Images
                  </h2>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="images" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-black">
                            Click to upload images
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB each (Max 10 images)
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

                  {/* Image Management with Drag & Drop */}
                  {formData.images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-black mb-3 flex items-center">
                        <GripVertical size={16} className="mr-1" />
                        Uploaded Images ({formData.images.length}/10) - Drag to reorder
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div
                            key={image.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            className={`relative group cursor-move ${
                              draggedImageIndex === index ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="relative">
                              <img
                                src={image.file && image.file instanceof File ? URL.createObjectURL(image.file) : (image.url || '/placeholder-image.jpg')}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md border-2 border-gray-200"
                              />

                              {/* Image Position Indicator */}
                              <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                              </div>

                              {/* Primary Image Indicator */}
                              {image.isPrimary && (
                                <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                                  <Star size={10} className="mr-0.5" />
                                  Primary
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex gap-1">
                                  {!image.isPrimary && (
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryImage(index)}
                                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                      title="Set as primary"
                                    >
                                      <Star size={12} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    title="Remove image"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>

                              {/* Drag Handle */}
                              <div className="absolute bottom-1 right-1 p-1 bg-gray-800 bg-opacity-75 text-white rounded cursor-move">
                                <GripVertical size={12} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        The first image will be used as the primary/featured image. Drag images to reorder them.
                      </p>
                    </div>
                  )}
                </div>

                {/* Page Display & Category Selection */}
                <div>
                  <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
                    <Globe className="mr-2" size={20} />
                    Page Display & Categories
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Display Pages */}
                    <div>
                      <h3 className="text-sm font-medium text-black mb-3">Display Pages</h3>
                      <div className="space-y-3">
                        {DISPLAY_PAGES.map((page) => (
                          <div key={page.id} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`page-${page.id}`}
                              checked={formData.displayPages.find(p => p.page === page.id)?.enabled || false}
                              onChange={() => handleDisplayPageChange(page.id)}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <label htmlFor={`page-${page.id}`} className="text-sm font-medium text-black cursor-pointer">
                                {page.label}
                              </label>
                              <p className="text-xs text-gray-500">{page.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-black mb-3">Property Categories</h3>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {PROPERTY_CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              checked={formData.categories.includes(category)}
                              onChange={() => handleCategoryChange(category)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`category-${category}`} className="text-sm text-black cursor-pointer">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Select categories that best describe this property
                      </p>
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



                {/* Enhanced Form Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => router.push('/properties')}
                      className="px-6 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePreview}
                      className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 font-medium flex items-center"
                    >
                      <Eye size={16} className="mr-2" />
                      Preview
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleSaveAsDraft}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving Draft...
                        </>
                      ) : (
                        <>
                          <FileText size={16} className="mr-2" />
                          Save as Draft
                        </>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing Property...
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-2" />
                          Publish Property
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Property Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Preview Content */}
              <div className="space-y-6">
                {/* Property Header */}
                <div>
                  <h1 className="text-2xl font-bold text-black mb-2">{formData.title || 'Property Title'}</h1>
                  <p className="text-gray-600 mb-4">{formData.actualLocation || 'Property Location'}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl font-bold text-blue-600">{formData.price || 'Price'}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      formData.status === 'Listed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status}
                    </span>
                    {formData.isDraft && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Property Images */}
                {formData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.file && image.file instanceof File ? URL.createObjectURL(image.file) : (image.url || '/placeholder-image.jpg')}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Property Details */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Property Details</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Type</span>
                      <p className="font-medium text-black">{formData.propertyType}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Area</span>
                      <p className="font-medium text-black">{formData.squareFootage || 'N/A'}</p>
                    </div>
                    {formData.bedrooms > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Bedrooms</span>
                        <p className="font-medium text-black">{formData.bedrooms}</p>
                      </div>
                    )}
                    {formData.bathrooms > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Bathrooms</span>
                        <p className="font-medium text-black">{formData.bathrooms}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {formData.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
                    <p className="text-gray-700">{formData.description}</p>
                  </div>
                )}

                {/* Categories */}
                {formData.categories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((category) => (
                        <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display Pages */}
                <div>
                  <h3 className="text-lg font-semibold text-black mb-3">Will appear on:</h3>
                  <div className="space-y-2">
                    {formData.displayPages.filter(page => page.enabled).map((page) => {
                      const pageInfo = DISPLAY_PAGES.find(p => p.id === page.page);
                      return (
                        <div key={page.page} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-black">{pageInfo?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
