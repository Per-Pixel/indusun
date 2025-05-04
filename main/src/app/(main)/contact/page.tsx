'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Send, Building, Clock, CheckCircle } from 'lucide-react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // In a real app, you would send this data to your backend
    setFormSubmitted(true);
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    // Reset form submission status after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  const officeLocations = [
    {
      city: 'Mumbai (Head Office)',
      address: 'Indusun Realty, 127-128, B-wing, 1st Floor, Andheri-Kurla Road, Andheri-E, Mumbai- 400099',
      phone: '+91 1800-41-99099',
      email: 'info@indusun.com'
    },
    {
      city: 'Bangalore',
      address: 'Indusun Realty, N – 503, North Block, Manipal Centre, Dickenson Road, Bangalore - 560042',
      phone: '+91 1800-41-99099',
      email: 'bangalore@indusun.com'
    },
    {
      city: 'Delhi NCR',
      address: 'Indusun Realty, B-8, Sector 132, Noida, 201301',
      phone: '+91 1800-41-99099',
      email: 'delhi@indusun.com'
    }
  ];
  
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              We're here to help with all your real estate needs
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">
                <a href="tel:+911800-41-99099" className="hover:text-blue-600 transition-colors">
                  +91 1800-41-99099
                </a>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Mon-Sun: 9:30 AM - 6:30 PM
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">
                <a href="mailto:info@indusun.com" className="hover:text-blue-600 transition-colors">
                  info@indusun.com
                </a>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                We'll respond as soon as possible
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">
                Mumbai, Bangalore, Delhi NCR, and more
              </p>
              <p className="text-gray-500 text-sm mt-2">
                See office locations below
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Get in Touch</h2>
            
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-4">
                    Your message has been sent successfully. We'll get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Property Listing">Property Listing</option>
                        <option value="Property Search">Property Search</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="text-right">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Offices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {officeLocations.map((office, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">{office.city}</h3>
                
                <div className="space-y-4 text-gray-600">
                  <div className="flex">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <p>{office.address}</p>
                  </div>
                  
                  <div className="flex">
                    <Phone className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <p>{office.phone}</p>
                  </div>
                  
                  <div className="flex">
                    <Mail className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <p>{office.email}</p>
                  </div>
                  
                  <div className="flex">
                    <Clock className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <p>Mon-Fri: 9:30 AM - 6:30 PM</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
