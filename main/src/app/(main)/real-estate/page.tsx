'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import { Search, MapPin, Building, Home, Building2, Filter, ChevronDown, ChevronRight, Star, Heart, ArrowRight, Clock, Users, Calendar, Phone, Mail, CheckCircle2, Menu } from 'lucide-react';

const RealEstatePage = () => {
  const [searchType, setSearchType] = useState<'buy' | 'rent'>('buy');
  const [propertyType, setPropertyType] = useState<string>('all');

  // Sample data
  const featuredProperties = [
    { id: 1, title: 'Modern Villa', location: 'Whitefield, Bangalore', price: '₹1.2 Cr', beds: 3, baths: 2, area: '2100 sq ft' },
    { id: 2, title: 'Luxury Apartment', location: 'Indiranagar, Bangalore', price: '₹85 Lac', beds: 2, baths: 2, area: '1200 sq ft' },
    { id: 3, title: 'Premium House', location: 'HSR Layout, Bangalore', price: '₹1.5 Cr', beds: 4, baths: 3, area: '2800 sq ft' },
  ];

  const popularLocalities = [
    { name: 'Whitefield', properties: 120 },
    { name: 'Indiranagar', properties: 85 },
    { name: 'HSR Layout', properties: 95 },
    { name: 'Koramangala', properties: 75 },
    { name: 'Electronic City', properties: 110 },
    { name: 'Marathahalli', properties: 65 },
  ];

  const newProjects = [
    { id: 1, title: 'Green Valley', developer: 'ABC Builders', location: 'Whitefield, Bangalore', price: '₹75 Lac onwards', possession: '2025' },
    { id: 2, title: 'Serene Heights', developer: 'XYZ Developers', location: 'Electronic City, Bangalore', price: '₹90 Lac onwards', possession: '2024' },
    { id: 3, title: 'Urban Oasis', developer: 'PQR Constructions', location: 'Sarjapur Road, Bangalore', price: '₹1.1 Cr onwards', possession: '2026' },
    { id: 4, title: 'Lakeside Residences', developer: 'LMN Builders', location: 'Hebbal, Bangalore', price: '₹1.3 Cr onwards', possession: '2025' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-gray-100 rounded-b-[50px]">
        <PlaceholderImage
          className="w-full h-full object-cover rounded-b-[50px]"
          type="property"
        />
        <div className="absolute inset-0 bg-black/40 rounded-b-[50px]"></div>

        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Modern living for everyone
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Find your dream home with our extensive property listings
              </p>

              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="flex mb-4">
                  <button
                    className={`px-4 py-2 rounded-md ${searchType === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setSearchType('buy')}
                  >
                    Buy
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ml-2 ${searchType === 'rent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setSearchType('rent')}
                  >
                    Rent
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by location, property name..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      Property Type
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get What You Need Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Get Exactly What You Need</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">31+</div>
              <div className="text-gray-600">Cities</div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">219</div>
              <div className="text-gray-600">Properties</div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">17</div>
              <div className="text-gray-600">Agents</div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Better Places Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <PlaceholderImage
                className="w-full h-[400px] object-cover rounded-lg"
                type="interior"
              />
            </div>

            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-4">Find Better Places to Live, Work and Wonder...</h2>
              <p className="text-gray-600 mb-6">
                Discover a place you'll love to call home. We have the most comprehensive property listings to help you find the perfect place.
              </p>
              <Link href="/properties" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Explore More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
          <p className="text-gray-600 mb-8">Discover Your Dream Home Today</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <PlaceholderImage
                    className="w-full h-full object-cover"
                    type="property"
                  />
                  <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full">
                    <Heart className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{property.title}</h3>
                    <div className="text-blue-600 font-bold">{property.price}</div>
                  </div>

                  <div className="flex items-center text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location}</span>
                  </div>

                  <div className="flex justify-between border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{property.beds}</span> Beds
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{property.baths}</span> Baths
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{property.area}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 flex justify-between items-center">
                  <Link href={`/properties/${property.id}`} className="text-sm text-blue-600 font-medium">View Details</Link>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/properties" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Localities Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Discover a New Homeland</h2>
              <p className="text-gray-600 mb-6">
                Explore the most sought-after neighborhoods and find the perfect location for your new home.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {popularLocalities.map((locality, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="font-semibold mb-1">{locality.name}</div>
                    <div className="text-sm text-gray-500">{locality.properties} Properties</div>
                  </div>
                ))}
              </div>

              <Link href="/localities" className="inline-flex items-center mt-6 text-blue-600 font-medium">
                View All Localities
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="md:w-1/2 md:pl-12">
              <div className="relative h-[400px]">
                <PlaceholderImage
                  className="w-full h-full object-cover rounded-lg"
                  type="building"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlighted Residential Projects */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Highlighted Residential Projects</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newProjects.slice(0, 2).map((project) => (
              <div key={project.id} className="flex flex-col md:flex-row border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="md:w-2/5 relative">
                  <PlaceholderImage
                    className="w-full h-full object-cover"
                    type="building"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    New Launch
                  </div>
                </div>

                <div className="md:w-3/5 p-4">
                  <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">by {project.developer}</p>

                  <div className="flex items-center text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{project.location}</span>
                  </div>

                  <div className="flex justify-between mb-3">
                    <div className="text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium ml-1">{project.price}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Possession:</span>
                      <span className="font-medium ml-1">{project.possession}</span>
                    </div>
                  </div>

                  <Link href={`/projects/${project.id}`} className="inline-flex items-center text-sm text-blue-600 font-medium">
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/projects" className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
              View All Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Our Services</h2>
              <p className="text-gray-600 mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
              </p>

              <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
                <div className="flex">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Property Management</h3>
                    <p className="text-gray-600 text-sm">
                      We handle everything from finding tenants to maintenance and repairs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Property Valuation</h3>
                    <p className="text-gray-600 text-sm">
                      Get an accurate estimate of your property's market value.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 md:pl-12">
              <div className="relative">
                <div className="bg-blue-600 text-white p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Contact an Agent</h3>
                  <p className="text-blue-100 mb-6">
                    Get in touch with one of our experienced agents to help you find your dream home.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-100">Our Agents</div>
                        <div className="font-medium">25+ Professional Agents</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-100">Working Hours</div>
                        <div className="font-medium">Mon-Sat: 9AM - 7PM</div>
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-white text-blue-600 font-medium py-3 rounded-md hover:bg-blue-50 transition-colors">
                    Contact Us Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Projects */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Ongoing Projects</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {newProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <PlaceholderImage
                    className="w-full h-full object-cover"
                    type="building"
                  />
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{project.location}</p>

                  <div className="text-blue-600 font-bold mb-3">{project.price}</div>

                  <Link href={`/projects/${project.id}`} className="inline-flex items-center text-sm text-blue-600 font-medium">
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Testimonials</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold">John Doe</div>
                  <div className="text-sm text-gray-500">Homeowner</div>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm">
                "I found my dream home through Indusun. The process was smooth and the agent was very helpful throughout."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold">Jane Smith</div>
                  <div className="text-sm text-gray-500">Property Investor</div>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 text-sm">
                "The team at Indusun helped me find great investment properties. Their market knowledge is exceptional."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold">Robert Johnson</div>
                  <div className="text-sm text-gray-500">First-time Buyer</div>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <Star className="h-4 w-4 text-gray-300" />
              </div>
              <p className="text-gray-600 text-sm">
                "As a first-time buyer, I was nervous about the process, but the Indusun team guided me every step of the way."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us?</h2>

          <div className="bg-blue-50 p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Trusted by Thousands</h3>
                <p className="text-gray-600 text-sm">
                  Over 10,000 satisfied customers have found their perfect property with us.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Wide Range of Properties</h3>
                <p className="text-gray-600 text-sm">
                  From apartments to villas, we have properties to suit every need and budget.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Expert Agents</h3>
                <p className="text-gray-600 text-sm">
                  Our team of experienced agents are dedicated to helping you find your perfect property.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Indusun</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your trusted partner in finding the perfect property for your needs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  {/* Facebook icon */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  {/* Twitter icon */}
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  {/* Instagram icon */}
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/properties" className="hover:text-white">Properties</Link></li>
                <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
                <li><Link href="/agents" className="hover:text-white">Agents</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>123 Main Street, Bangalore, India</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>+91 1234567890</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@indusun.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest updates on properties and projects.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none flex-1"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Indusun. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RealEstatePage;


