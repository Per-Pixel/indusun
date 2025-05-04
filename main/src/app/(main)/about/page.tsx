'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, Award, Users, Building, CheckCircle } from 'lucide-react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
        <PlaceholderImage 
          className="w-full h-full object-cover" 
          type="building"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
          <div className="container px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Indusun</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Your trusted partner in finding the perfect property for your needs
            </p>
          </div>
        </div>
      </div>

      {/* Company Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <p className="text-lg text-gray-700 mb-6">
              Launched in 2020, Indusun is a premier real estate portal that deals with every aspect of consumers' needs in the real estate industry. We provide an online forum where buyers, sellers, and brokers/agents can exchange information about real estate properties quickly, effectively, and inexpensively.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              At Indusun, you can advertise a property, search for a property, browse through properties, build your own property microsite, and keep yourself updated with the latest news and trends making headlines in the realty sector.
            </p>
            <p className="text-lg text-gray-700">
              Our mission is to simplify the property search process and help you make informed decisions about one of life's most significant investments.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Indusun?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-4">
                <Building size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Extensive Property Listings</h3>
              <p className="text-gray-600">
                Indusun prides itself on having thousands of property listings spanning across multiple cities in India. We offer a wide range of residential, commercial, and land properties to suit every need and budget.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-4">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Real Estate Agents</h3>
              <p className="text-gray-600">
                Our platform connects you with experienced real estate professionals who can guide you through every step of your property journey, whether you're buying, selling, or renting.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="text-blue-600 mb-4">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-semibold mb-4">Verified Listings</h3>
              <p className="text-gray-600">
                We strive to provide accurate and verified property information to help you make informed decisions. Our team works diligently to ensure the quality and authenticity of listings.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/properties" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      </section>

      {/* Awards & Recognition (if applicable) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Awards & Recognition</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Real Estate Portal</h3>
              <p className="text-gray-600 text-sm">Real Estate Excellence Awards 2023</p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Most Innovative Platform</h3>
              <p className="text-gray-600 text-sm">PropTech Innovation Awards 2022</p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Satisfaction</h3>
              <p className="text-gray-600 text-sm">Customer Choice Awards 2022</p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Mobile Experience</h3>
              <p className="text-gray-600 text-sm">Mobile Excellence Awards 2021</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Dream Property?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect property through Indusun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/properties" 
              className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Properties
            </Link>
            <Link 
              href="/contact" 
              className="px-6 py-3 border-2 border-white text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
