'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Send, Building, Clock, CheckCircle, Sparkles } from 'lucide-react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import toast, { Toaster } from 'react-hot-toast';

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
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/messages/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderName: formData.name,
          senderEmail: formData.email,
          senderPhone: formData.phone,
          subject: formData.subject,
          messageContent: formData.message,
          source: 'contact_page',
          sourcePage: '/contact'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success toast
        toast.success('Message sent successfully! We\'ll get back to you shortly.', {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: '500',
          },
        });

        setFormSubmitted(true);
        // Reset form after successful submission
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
      } else {
        // Show error toast
        toast.error(result.error || 'Failed to submit message. Please try again.', {
          duration: 5000,
          position: 'top-center',
        });
        setSubmitError(result.error || 'Failed to submit message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';

      // Show error toast
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
      <Toaster />
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
              <p className="text-[#191D23]">
                <a href="tel:+911800-41-99099" className="hover:text-blue-600 transition-colors">
                  +91 1800-41-99099
                </a>
              </p>
              <p className="text-[#191D23] text-sm mt-2">
                Mon-Sun: 9:30 AM - 6:30 PM
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-[#191D23]">
                <a href="mailto:info@indusun.com" className="hover:text-blue-600 transition-colors">
                  info@indusun.com
                </a>
              </p>
              <p className="text-[#191D23] text-sm mt-2">
                We'll respond as soon as possible
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-[#191D23]">
                Mumbai, Bangalore, Delhi NCR, and more
              </p>
              <p className="text-[#191D23] text-sm mt-2">
                See office locations below
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-12">
              <Sparkles className="h-6 w-6 text-[#191D23]" />
              <h2 className="text-3xl font-bold text-[#191D23]">Get in Touch</h2>
              <Sparkles className="h-6 w-6 text-[#191D23]" />
            </div>
            
            {/* Contact Form */}
            {formSubmitted ? (
              <div className="text-center py-8">
                <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
                <p className="text-[#191D23] mb-4">
                  Your message has been sent successfully. We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">First Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter First Name"
                      className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter Last Name"
                      className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your Email"
                      className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter Phone Number"
                      className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">Preferred Location</label>
                    <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                      <option value="">Select Location</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">Property Type</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors"
                      required
                    >
                      <option value="">Select Property Type</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                      <option value="Apartment">Apartment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">No. of Bathrooms</label>
                    <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                      <option value="">Select no. of Bathrooms</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#191D23] mb-2">No. of Bedrooms</label>
                    <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                      <option value="">Select no. of Bedrooms</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#191D23] mb-2">Budget</label>
                  <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                    <option value="">Select Budget</option>
                    <option value="Under 50L">Under ₹50 Lakhs</option>
                    <option value="50L-1Cr">₹50 Lakhs - ₹1 Crore</option>
                    <option value="1Cr-2Cr">₹1 Crore - ₹2 Crores</option>
                    <option value="Above 2Cr">Above ₹2 Crores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#191D23] mb-2">Preferred Contact Method</label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex items-center p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black">
                        <Phone className="h-5 w-5 text-gray-500 mr-2" />
                        <input
                          type="tel"
                          placeholder="Enter Your Number"
                          className="bg-transparent w-full focus:outline-none placeholder:text-gray-600/70 text-black"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black">
                        <Mail className="h-5 w-5 text-gray-500 mr-2" />
                        <input
                          type="email"
                          placeholder="Enter Your Email"
                          className="bg-transparent w-full focus:outline-none placeholder:text-gray-600/70 text-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#191D23] mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your Message here."
                    rows={6}
                    className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                    required
                  ></textarea>
                </div>

                {/* Terms and Send Message button container */}
                <div className="flex items-center justify-between">
                  {/* Terms agreement */}
                  <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <p className="text-sm text-[#191D23]">
                      I agree with <a href="#" className="underline">Terms of Use</a> and <a href="#" className="underline">Privacy Policy</a>
                    </p>
                  </div>

                  {/* Send Message button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Your Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#191D23] mb-12 text-center">Our Offices</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {officeLocations.map((office, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">{office.city}</h3>

                <div className="space-y-4 text-[#191D23]">
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
