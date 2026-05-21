'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, Users, Calendar, Trophy, Heart, Sparkles } from 'lucide-react';
import PlaceholderImage from '@/components/ui/PlaceholderImage';
import toast, { Toaster } from 'react-hot-toast';

const AboutPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    budget: '',
    propertyType: '',
    location: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [, setIsSubmitting] = useState(false);
  const [, setSubmitError] = useState('');
  const [, setFormSubmitted] = useState(false);

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
          senderName: `${formData.firstName} ${formData.lastName}`,
          senderEmail: formData.email,
          senderPhone: formData.phone,
          subject: `Property Inquiry - ${formData.propertyType} in ${formData.location}`,
          messageContent: `Budget: ${formData.budget}\nProperty Type: ${formData.propertyType}\nLocation: ${formData.location}\n\nMessage: ${formData.message}`,
          source: 'about_page',
          sourcePage: '/about'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success toast
        toast.success('Message sent successfully! We&apos;ll get back to you shortly.', {
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
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          budget: '',
          propertyType: '',
          location: '',
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

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      {/* Hero Section */}
      <div className="relative h-[500px] md:h-[600px] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
        <PlaceholderImage
          className="w-full h-full object-cover"
          type="building"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
          <div className="container px-4 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Find Your Dream Home in<br />
              The Heart of The City
            </h1>
            <Link
              href="/properties"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <h3 className="text-4xl font-bold text-[#191D23] mb-2">200+</h3>
              <p className="text-[#191D23] font-medium">Happy Customers</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <h3 className="text-4xl font-bold text-[#191D23] mb-2">10k+</h3>
              <p className="text-[#191D23] font-medium">Properties Listed</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <h3 className="text-4xl font-bold text-[#191D23] mb-2">1k+</h3>
              <p className="text-[#191D23] font-medium">Years of Experience</p>
            </div>
          </div>

          {/* Mobile Layout - Horizontal Scrollable */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center min-w-[200px] snap-center flex-shrink-0">
                <h3 className="text-3xl font-bold text-[#191D23] mb-2">200+</h3>
                <p className="text-[#191D23] font-medium text-sm">Happy Customers</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center min-w-[200px] snap-center flex-shrink-0">
                <h3 className="text-3xl font-bold text-[#191D23] mb-2">10k+</h3>
                <p className="text-[#191D23] font-medium text-sm">Properties Listed</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 text-center min-w-[200px] snap-center flex-shrink-0">
                <h3 className="text-3xl font-bold text-[#191D23] mb-2">1k+</h3>
                <p className="text-[#191D23] font-medium text-sm">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Building Image Section - Mobile Only */}
      <section className="md:hidden py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="relative">
            <PlaceholderImage
              className="w-full h-[250px] object-cover rounded-lg shadow-lg"
              type="building"
            />
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#191D23] mb-6">Our Journey</h2>
              <p className="text-lg text-[#191D23] mb-6 leading-relaxed">
                Launched in 2020, Indusun is a premier real estate portal that deals with every aspect of consumers&apos; needs in the real estate industry. We provide an online forum where buyers, sellers, and brokers/agents can exchange information about real estate properties quickly, effectively, and inexpensively.
              </p>
              <p className="text-lg text-[#191D23] mb-6 leading-relaxed">
                At Indusun, you can advertise a property, search for a property, browse through properties, build your own property microsite, and keep yourself updated with the latest news and trends making headlines in the realty sector.
              </p>
              <p className="text-lg text-[#191D23] leading-relaxed">
                Our mission is to simplify the property search process and help you make informed decisions about one of life&apos;s most significant investments.
              </p>
            </div>
            {/* Desktop Image */}
            <div className="relative hidden md:block">
              <PlaceholderImage
                className="w-full h-[400px] object-cover rounded-lg shadow-lg"
                type="building"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Achievements */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#191D23] mb-12 text-center">Our Achievements</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
                <Calendar className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-2xl font-bold text-[#191D23] mb-4">3+ Years of Excellence</h3>
              <p className="text-[#191D23] leading-relaxed">
                Since our launch in 2020, we have consistently delivered exceptional real estate services, building trust and reliability in the market through our commitment to excellence and customer satisfaction.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
                <Heart className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-2xl font-bold text-[#191D23] mb-4">Happy Clients</h3>
              <p className="text-[#191D23] leading-relaxed">
                Our success is measured by the satisfaction of our clients. We have helped hundreds of families find their dream homes and assisted numerous investors in making profitable real estate decisions.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-6">
                <Trophy className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-2xl font-bold text-[#191D23] mb-4">Industry Recognition</h3>
              <p className="text-[#191D23] leading-relaxed">
                Our innovative approach and dedication to service excellence have earned us recognition within the real estate industry, establishing us as a trusted and reliable platform for property transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-[#191D23]" />
            <h2 className="text-4xl font-bold text-[#191D23]">Let&apos;s make it happen!</h2>
            <Sparkles className="h-6 w-6 text-[#191D23]" />
          </div>
          <p className="text-[#191D23] mb-12 text-center">
            Ready to take the first step toward your dream property? Fill out the form below, and our real estate wizards will work their magic to find your perfect match. Don&apos;t wait; let&apos;s embark on this exciting journey together.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm text-black mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter First Name"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter Last Name"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your Email"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter Phone Number"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm text-black mb-2">Preferred Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter preferred location"
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors"
                >
                  <option value="">Select Property Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-black mb-2">Budget</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors"
                >
                  <option value="">Select Budget</option>
                  <option value="under-50L">Under ₹50 Lakhs</option>
                  <option value="50L-1Cr">₹50 Lakhs - ₹1 Crore</option>
                  <option value="1Cr-2Cr">₹1 Crore - ₹2 Crores</option>
                  <option value="above-2Cr">Above ₹2 Crores</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-black mb-2">No. of Bedrooms</label>
                <select className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black text-black transition-colors">
                  <option value="">Select no. of Bedrooms</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-black mb-2">Preferred Contact Method</label>
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
              <label className="block text-sm text-black mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter your Message here."
                rows={6}
                className="w-full p-3 rounded-lg bg-[#FFF1F1] outline outline-[2px] outline-black focus:outline-black placeholder:text-gray-600/70 text-black transition-colors"
              ></textarea>
            </div>

            {/* Terms and Send Message button container */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Terms agreement */}
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <p className="text-sm text-black">
                  I agree with <a href="#" className="underline">Terms of Use</a> and <a href="#" className="underline">Privacy Policy</a>
                </p>
              </div>

              {/* Send Message button */}
              <button
                type="submit"
                className="px-8 py-3 bg-[#7C3AED] text-white rounded-lg font-medium hover:bg-[#6D28D9] transition-colors"
              >
                Send Your Message
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#191D23] mb-4">Meet the Indusun Team</h2>
            <p className="text-lg text-[#191D23] max-w-2xl mx-auto">
              Our dedicated team of real estate professionals is here to help you find your perfect property and make your dreams come true.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="bg-blue-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-28 h-28 bg-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-xl font-semibold text-[#191D23] mb-2">Rajesh Kumar</h3>
              <p className="text-blue-600 font-medium mb-2">CEO & Founder</p>
              <p className="text-[#191D23] text-sm leading-relaxed">Leading the vision and strategy for Indusun&apos;s growth</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-28 h-28 bg-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-xl font-semibold text-[#191D23] mb-2">Priya Sharma</h3>
              <p className="text-blue-600 font-medium mb-2">Head of Sales</p>
              <p className="text-[#191D23] text-sm leading-relaxed">Expert in property sales and client relations</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-28 h-28 bg-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-xl font-semibold text-[#191D23] mb-2">Amit Patel</h3>
              <p className="text-blue-600 font-medium mb-2">Marketing Director</p>
              <p className="text-[#191D23] text-sm leading-relaxed">Digital marketing specialist and brand strategist</p>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-28 h-28 bg-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="h-12 w-12 text-[#191D23]" />
              </div>
              <h3 className="text-xl font-semibold text-[#191D23] mb-2">Sneha Gupta</h3>
              <p className="text-blue-600 font-medium mb-2">Customer Relations</p>
              <p className="text-[#191D23] text-sm leading-relaxed">Ensuring exceptional customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default AboutPage;
